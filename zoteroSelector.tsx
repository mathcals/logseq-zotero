/** @tsx h */
import '@logseq/libs'
import { createRef, Component } from 'preact'
import { ZoteroApi } from './zoteroApi';


export class ZoteroSelector extends Component<{ api: ZoteroApi }> {
    input = createRef()
    scrollDiv = createRef()
    state = { value: '', results: [], selectedIndex: null };
    timeout = null
    prevRef = null

    componentDidUpdate() {
        if (this.prevRef !== this.scrollDiv.current) {
            if (this.scrollDiv.current !== null)
                this.scrollDiv.current.scrollIntoViewIfNeeded(false)
        }

        this.prevRef = this.scrollDiv.current;
    }

    onInput = (e) => {
        const { value } = e.target;
        this.setState({ value })
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => { this.doSearch(value) }, 50);
    }
    async doSearch(value) {
        let results = await this.props.api.search(value);
        this.setState({ results: results.slice(0, Math.min(25, results.length)) })
        this.setSelection(0)

    }
    async select(suggestion) {
        if (suggestion == null)
            return;
        console.log(suggestion)
        logseq.Editor.insertAtEditingCursor(formatReference(suggestion))
        logseq.hideMainUI({ restoreEditingCursor: true });
    }
    moveSelection(diff) {
        if (this.state.selectedIndex == null || this.state.results.length == 0)
            return;

        this.setSelection((this.state.selectedIndex + diff + this.state.results.length) % this.state.results.length)
    }
    setSelection(i) {
        this.setState({ selectedIndex: i })
    }
    getSelection() {
        if (this.state.selectedIndex == null || this.state.results.length <= this.state.selectedIndex)
            return;
        return this.state.results[this.state.selectedIndex]
    }
    render() {

        return (
            <div className="zotero-search rounded-md shadow-lg absolute-modal">
                <div className="flex items-center input-wrap">
                    <input ref={this.input} onKeyDown={(e) => this.keyDown(e)} onInput={this.onInput}
                        placeholder="Search for your Zotero articles (title, author, text, anything)" className="flex-1 focus:outline-none"
                        value={this.state.value} />
                </div>
                <div className='suggestionList'>
                    {this.state.results.map((result, i) =>
                        <div ref={this.state.selectedIndex == i ? this.scrollDiv : null}
                            onClick={() => this.select(this.state.results[i])}
                            onMouseMove={() => this.setSelection(i)}
                            className={"suggestion" + (i == this.state.selectedIndex ? " active" : "")} key={i}>
                            <div class="title">{result.title}</div>
                            <div class="author">{result.creators !== undefined ? result.creators.map(x => x.firstName + " " + x.lastName).join(", ") : ""}</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
    keyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'Escape':
                logseq.hideMainUI({ restoreEditingCursor: true })
                event.preventDefault()
                break;
            case 'ArrowUp':
                this.moveSelection(-1);
                event.preventDefault()
                break;
            case 'ArrowDown':
                this.moveSelection(1);
                event.preventDefault()
                break;
            case 'Tab':
            case 'Enter':
                this.select(this.getSelection());
                event.preventDefault()
                break;
        }
    }

    focus() {
        this.input.current.focus()
    }

    clear() {
        this.setState({ value: '', results: [], selectedIndex: null })
    }
}

function formatReference(reference) {
    debugger;
    let key = reference.citationKey !== undefined ? reference.citationKey : reference.key;
    return `[[Zotero:${key}]] `
}