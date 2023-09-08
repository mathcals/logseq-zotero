import { ZoteroApi } from "./zoteroApi";

/**
 * This class observes the DOM for changes and replaces links to zotero items with the title of the zotero item.
 */
export class ZoteroObserver {
    api: ZoteroApi;
    document: Document;
    constructor(api: ZoteroApi) {
        this.api = api;
    }
    observer: MutationObserver;
    init(document: Document) {
        this.document = document;
        this.observer = new MutationObserver((mutations) => this.linksObserverCallback(mutations));
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            throw new Error('app-container not found');
        }
        this.observer.observe(appContainer, {
            childList: true,
            subtree: true
        });
    }
    stop() {
        this.observer.disconnect();
    }
    linksObserverCallback(mutations: MutationRecord[]): void {
        for (let mutation of mutations) {
            const addedNode = mutation.addedNodes[0] as HTMLElement;
            if (addedNode && addedNode.childNodes.length) {
                const elements = [...addedNode
                    .querySelectorAll('.tag[data-ref^="zotero:"],.page-reference[data-ref^="Zotero:"],.page-title span[data-ref^="zotero:"]')];
                console.log(elements);
                for (let element of elements) {
                    let isLink = element.classList.contains('page-reference');
                    let isTag = !isLink && element.classList.contains('tag');
                    if (isLink)
                        this.handleLink(element as HTMLElement);
                    else if (isTag)
                        this.handleTag(element as HTMLElement);
                    else
                        this.handleTitle(element as HTMLElement);

                }

            }
        }
    }
    async handleTag(tagElement: HTMLElement) {
        const ref = tagElement.getAttribute('data-ref');
        const id = ref.substring(ref.indexOf(":") + 1);
        tagElement.insertAdjacentElement('afterend', this.createZoteroButton(id));
    }
    /**
     * Replace a link to a zotero item by the title of the zotero item
     * @param linkElem The element containing the link to the zotero item
     */
    async handleLink(linkElem: HTMLElement) {
        const ref = linkElem.getAttribute('data-ref');
        const id = ref.substring(ref.indexOf(":") + 1);

        // Add a link to open the pdf in zotero
        const aElement = this.createZoteroButton(id);
        linkElem.querySelector('.page-ref').insertAdjacentElement('afterend', aElement);

        try {
            const info = await this.api.getInfo(id);
            linkElem.querySelector('.page-ref').textContent = info.title;
        }
        catch {
        }

    }

    private createZoteroButton(id: string) {
        const aElement = this.document.createElement('a');
        aElement.href = '#';
        aElement.classList.add('lzotero-link');
        const getCitekeyOpenLink = async (id: string) => {
            let attachmentInfo = await this.api.getAttachments(id);
            if (attachmentInfo.length == 0)
                return null;
            return attachmentInfo[0].open;
        };
        aElement.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            let openLink = await getCitekeyOpenLink(id);
            if (openLink === null && ZoteroApi.validateCiteKey(id)) {
                window.open(`zotero://open-pdf/library/items/${id}`);
            }
            else {
                window.open(openLink);
            }
        };
        aElement.textContent = "Z";
        return aElement;
    }

    /**
     * Replace the title of the zotero item with the title of the zotero item
     * @param titleElem The element containing the title of the zotero item
     */
    async handleTitle(titleElem: HTMLElement) {
        const dataRef = titleElem.getAttribute('data-ref');
        const id = dataRef.substring(dataRef.indexOf(":") + 1);

        try {
            const info = await this.api.getInfo(id);
            titleElem.textContent = info.title;
        }
        catch {
        }

    }
}
