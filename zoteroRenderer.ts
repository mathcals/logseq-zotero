import { ZoteroApi } from "./zoteroApi";

export function onZoteroRendererSlotted({slot, payload}) {
    const [type, startTime, durationMins] = payload.arguments
    if (!type?.startsWith(':zotero_annotation')) return

    const subType = type.split(' ')[0]
    const args = type.substring(subType.length + 1)

    switch (subType) {
        case ':zotero_annotation_image':
            return annotationImage({ slot, payload }, args);
    }

}

function annotationImage({slot, payload}, args: string) {
    const [fileId = null, annotationId = null, ...rest] = args.split(' ')
    if (!ZoteroApi.validateId(fileId) || !ZoteroApi.validateId(annotationId)) return
    return logseq.provideUI({
        key: payload.uuid,
        slot, reset: true,
        template: `
          <a href="zotero://open-pdf/library/items/${fileId}?&annotation=${annotationId}"><img
          class="zotero-annotation-image"
          data-slot-id="${slot}"
          data-pomo-id="${55}"
          data-block-uuid="${payload.uuid}"
          src="http://localhost:23119/logseq/annotation/image?id=${annotationId}" /></a>
        `,
    });
}

