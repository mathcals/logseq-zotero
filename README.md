# Logseq Zotero plugin

This plugin for the Logseq knowledge base provides an alternative for the built-in integration with the Zotero reference manager.
In contrast to the built-in integration, this plugin relies on a local version of Zotero and does not use the Zotero cloud API.
Furthermore, this plugin supports pasting Zotero annotations into the Logseq editor.

## Design philosophy
Integration with Zotero can be implemented in many different ways. The main philosophy underlying this plugin is that metadata about documents should be owned by Zotero and therefore should not be imported into Logseq.
That way, the issue of having to sync metadata changes between the two programs is avoided.

## Install
- Install the [zotero-better-bibtex](https://github.com/retorquere/zotero-better-bibtex) plugin for Zotero (at least v6.7.136)
- Install the [zotero-logseq](https://github.com/retorquere/zotero-better-bibtex) plugin for Zotero (latest version)
- Install the plugin from the logseq plugin repository


### Build
To manually build the plugin, clone the repository and execute:
- `yarn install`
- `yarn build`

