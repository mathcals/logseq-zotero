/**
 * Zotero API interface
 */
export class ZoteroApi {
    path: string;
    constructor(path = "http://localhost/") {
        this.path = path;
    }
    private async post(path: string, content) {
        const response = (await fetch("http://localhost:23119/" + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Zotero-Allowed-Request': "true"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(content)
        }));

        if (response.ok) {
            return response.json();
        } else {
            throw new Error("HTTP error " + response.status);
        }
    }
    async getInfo(citekey: string) {
        return await this.post("logseq/info", citekey);
    }
    async search(value: any) {
        return await this.post("logseq/search", [{ "condition": "quicksearch-titleCreatorYear", "value": value }]);
    }
    async getAttachments(citekey: string) {
        let res = await this.post("better-bibtex/json-rpc", {
            'jsonrpc': '2.0',
            'method': 'item.attachments',
            'params': [citekey]
        });
        if (res.result !== undefined) {
            return res.result;
        }
    }
    async getAnnotation(annotationKey: string) : Promise<{parentKey: string, citationKey: string}> {
        return await this.post("logseq/annotation", annotationKey);
    }

    public static validateId(id: string | null) {
        if (id == null) return false
        return id.match(/^[A-Z0-9]+$/) !== null;
    }
    public static validateCiteKey(id: string | null) {
        if (id == null) return false
        return id.match(/^[a-zA-Z0-9_\-:]+$/) !== null;
    }
}
