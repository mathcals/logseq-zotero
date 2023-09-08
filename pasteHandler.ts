import '@logseq/libs'
import { ZoteroApi } from './zoteroApi';

export async function pasteHandler(e: ClipboardEvent) {
    const data = getZoteroClipboard()
    const bibtexRegex = /\\cite{([^{}]+)}/
    if (data != null && (data instanceof Array)) {
        pasteAnnotation(data, e);
    }
    else if (e.clipboardData.getData('text/plain').match(bibtexRegex)) {
        const keys = e.clipboardData.getData('text/plain').match(bibtexRegex)[1].split(',').map(t => t.trim())
        e.stopPropagation();
        e.preventDefault();
        logseq.Editor.insertAtEditingCursor(keys.map(key => `[[Zotero:${key}]]`).join(" "))
    }

}

async function toMarkdown(item) {
    if (!ZoteroApi.validateId(item.parentId) || !ZoteroApi.validateId(item.id))
        return;
    let annotation = await new ZoteroApi().getAnnotation(item.id);
    if (!ZoteroApi.validateId(annotation.parentKey) || !ZoteroApi.validateCiteKey(annotation.citationKey))
        return;
    switch (item.type) {
        case "highlight":
            {
                let url = `zotero://open-pdf/library/items/${annotation.parentKey}?page=${Number.parseInt(item.position.pageIndex)}&annotation=${item.id}`
                let markdown = `==[${item.text}](${url})== ` + createTag(annotation.citationKey);
                return markdown;
            }
        case "ink":
        case "image":
            {
                const markdown = `{{renderer :zotero_annotation_image ${annotation.parentKey} ${item.id}}} `  + createTag(annotation.citationKey);
                return markdown
            }

    }
}

function getZoteroClipboard() {
    const buffer: Uint8Array | null = parent.apis.getClipboardData !== undefined ? parent.apis.getClipboardData("application/x-moz-custom-clipdata") : null;
    if (buffer == null)
        return;
    const view = new DataView(buffer.buffer, 0)
    const decoder = new TextDecoder('utf-16')
    if (view.getUint32(0) != 1)
        return;
    if (view.getUint32(4) != 34)
        return;
    if (decoder.decode(buffer.subarray(8, 42)) != "zotero/annotation")
        return;

    try {
        const length = view.getUint32(42);
        return JSON.parse(decoder.decode(buffer.subarray(46, 46 + length)))

    } catch (e) {
        return;
    }
}

async function pasteAnnotation(data: any, e: ClipboardEvent) {
    // Now we need to get the parentIds. These are not contained in the zotero/annotation clipboard data unfortunately, so we have to get them from the text/plain clipboard data.
    let parentIds = [...e.clipboardData.getData("text/plain").matchAll(/zotero:\/\/open-pdf\/library\/items\/([A-Z0-9]+)\?/g)].map((match) => match[1])
    if (parentIds.length != data.length) return;
    data.forEach((e, i) => e.parentId = parentIds[i])

    e.preventDefault()
    e.stopPropagation()

    let blocks = await Promise.all(data.map(async (item) => ({ content: await toMarkdown(item) })))

    const targetBlock = await logseq.Editor.getCurrentBlock()
    await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocks, { sibling: true })
}
function createTag(citationKey: string) {
    if (!ZoteroApi.validateCiteKey(citationKey))
        return;
    return `#[[Zotero:${citationKey}]]`;
}

