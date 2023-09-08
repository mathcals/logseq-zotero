/** @tsx h */
import '@logseq/libs'
import { h, render, createRef, Component } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { ZoteroSelector } from "./zoteroSelector"
import { pasteHandler } from './pasteHandler'
import { onZoteroRendererSlotted } from './zoteroRenderer'
import { ZoteroObserver } from './zoteroObserver'
import { logseq as PL } from './package.json';
import { ZoteroApi } from './zoteroApi'


/**
 * main entry
 */
async function main() {
    const api = new ZoteroApi();
    const appUserConfig = await logseq.App.getUserConfigs()
    const main = document.querySelector('#app') as HTMLElement
    const mainContentContainer = parent.document.getElementById(
        "main-content-container",
    )
    const rootRef = createRef()
    render(<ZoteroSelector api={api} ref={rootRef} />, main)

    let picker = null
    let init = () => {
        rootRef.current.focus()
        //ESC
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === 27) {
                logseq.hideMainUI({ restoreEditingCursor: true })
            }
            e.stopPropagation()
        }, false)

        document.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).closest('#app')) {
                logseq.hideMainUI({ restoreEditingCursor: true })
            }
        })

        logseq.App.onThemeModeChanged(({ mode }) => {
            picker.setTheme(mode)
        })

        return picker
    }

    // Override the default zotero slash command// Override the default zotero slash command
    let onSlashCommand = async () => {
        const {
            left,
            top,
            rect,
        } = await logseq.Editor.getEditingCursorPosition()

        Object.assign(main.style, {
            top: top + rect.top + 'px',
            left: left + rect.left + 'px',
        })
        logseq.showMainUI()
        rootRef.current.clear()
        rootRef.current.focus()
        setTimeout(() => {
            init()
        }, 100)
    };
    logseq.Editor.registerSlashCommand(
        'Zotero', onSlashCommand
    )

    // Allow for pasting zotero annotations
    mainContentContainer.addEventListener("paste", pasteHandler)
    logseq.beforeunload(async () => {
        mainContentContainer.removeEventListener("paste", pasteHandler)
    })

    // Render Zotero macros
    logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
        const [type, startTime, durationMins] = payload.arguments
        if (type?.startsWith(':zotero_'))
            return onZoteroRendererSlotted({ slot, payload });

    })

    // Replace links and titles for Zotero items by the titles of the zotero items
    new ZoteroObserver(api).init(parent.document);

    // Inject CSS
    parent.document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" id="css-logseqzotero" href="lsp://logseq.io/${PL.id}/dist/parent.css">`)
}

// bootstrap
logseq.ready(main).catch(console.error)
