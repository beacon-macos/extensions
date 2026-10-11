# Beacon Extensions

Extensions add new commands to [Beacon](https://github.com/beacon-macos/Beacon), the keyboard-first application launcher for macOS. This repository is the official extension catalog: every extension listed in Beacon Settings comes from here.

## Available extensions

| Extension | Command | What it does |
| --- | --- | --- |
| [Visual Studio Code](extensions/vscode) | Open Recent Project | Search your recent Visual Studio Code folders and workspaces, then open one in Visual Studio Code. |

## Install an extension

1. Open **Beacon Settings** from the launcher or the menu-bar icon.
2. In the **Extensions** section, click **Install** next to the extension.
3. Open Beacon and search for one of the extension's commands, such as **Open Recent Project**.

When a newer version is published, Beacon shows an **Update** button next to the extension. **Uninstall** removes it.

## Use an extension command

Select a command and press `Return`. Its results replace the launcher list:

- Type to filter the results.
- Use `↑` and `↓` to move through them.
- Press `Return` to open the selected result.
- Press `Esc` to go back to all results.

Commands are regular launcher results, so you can also add them to your favorites with `⌘K`.

## How extensions work

An extension is a small folder with a manifest that describes its commands and a JavaScript file that implements them. When you install one, Beacon downloads the folder from this repository and stores it in `~/Library/Application Support/Beacon/Extensions`.

When you run a command, Beacon runs the extension's script with the JavaScriptCore engine built into macOS. The script can read files and SQLite databases and returns a list of results. Each result opens a file, folder, or URL, optionally in a specific application. Extensions cannot access the network or run other programs.

## Security

Extensions can read any file that your user account can read. Every extension in this repository is reviewed before it is merged, and Beacon installs extensions only from this repository.

## Repository layout

```text
catalog.json        Extensions that Beacon lists in its settings
extensions/
└── vscode/         One folder per extension, named after its identifier
CONTRIBUTING.md     How to write, test, and submit an extension
```

## Contributing

New extensions and improvements are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains the extension format, the API available to scripts, how to test an extension locally, and how to submit it.
