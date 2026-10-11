# Contributing to Beacon Extensions

This guide explains how to write a Beacon extension, test it locally, and submit it to the catalog.

## Extension structure

Each extension lives in `extensions/<id>/`, where `<id>` is the extension identifier:

```text
extensions/vscode/
├── manifest.json
└── main.js
```

### `manifest.json`

```json
{
  "id": "vscode",
  "name": "Visual Studio Code",
  "description": "Open recent Visual Studio Code projects.",
  "version": "1.0.0",
  "author": "beacon-macos",
  "icon": { "app": "com.microsoft.VSCode" },
  "main": "main.js",
  "commands": [
    {
      "id": "open-recent-project",
      "title": "Open Recent Project",
      "subtitle": "Visual Studio Code",
      "placeholder": "Search recent projects"
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `id` | Lowercase letters, digits, and hyphens. Must match the folder name. |
| `name`, `description` | Shown in Beacon Settings. |
| `version` | Dotted version, such as `1.2.0`. Beacon offers an update when `catalog.json` lists a newer one. |
| `author` | Optional. |
| `icon` | Optional. One of `{ "app": "<bundle identifier>" }`, `{ "file": "<path>" }`, or `{ "symbol": "<SF Symbol name>" }`. |
| `main` | The script file name, in the same folder. |
| `commands` | The commands that appear in the launcher. Each needs an `id` (same rules as the extension `id`) and a `title`. `subtitle` defaults to the extension name, and `placeholder` is the search field placeholder while the command is open. |

### The script

The script registers a handler for each command in the manifest. A handler is synchronous and returns an array of results:

```js
beacon.registerCommand("open-recent-project", () => [
  {
    title: "project",
    subtitle: "~/project",
    icon: { file: "/Users/me/project" },
    action: { type: "open", target: "/Users/me/project", application: "com.microsoft.VSCode" },
  },
]);
```

| Result field | Description |
| --- | --- |
| `title`, `subtitle` | The row text. Beacon searches both. `subtitle` is optional. |
| `icon` | Optional, in the same format as the manifest icon. |
| `action` | `{ "type": "open", "target": "<path or URL>", "application": "<bundle identifier>" }`. A target that starts with `/` or `~` is a path; anything else must be a URL. `application` is optional. |

Beacon keeps the order of the results until the user types, then ranks them by how well they match.

### Script API

Beacon evaluates the script in a fresh JavaScriptCore context each time a command runs. The global `beacon` object provides:

| API | Description |
| --- | --- |
| `beacon.registerCommand(id, handler)` | Registers the handler for a command in the manifest. |
| `beacon.homeDirectory` | The user's home directory. |
| `beacon.fileExists(path)` | Whether a file or folder exists. |
| `beacon.readFile(path)` | A UTF-8 file's contents, or `null` if it cannot be read. |
| `beacon.querySQLite(path, sql)` | Rows from a SQLite database opened read-only, as objects keyed by column name. Throws on failure. |
| `console.log(...)` | Writes to Beacon's standard output. |

Paths may start with `~`. The usual JavaScript built-ins, such as `JSON` and `decodeURIComponent`, are available, but browser and Node.js APIs such as `fetch` and `require` are not.

## Guidelines

- Keep handlers fast. They run every time the command opens.
- Read only the files the command needs.
- Return an empty list when the application the extension supports is not installed or has no data, rather than throwing.
- Throw an `Error` with a short, readable message for real failures; Beacon shows it in the launcher.
- Prefer the application's documented data files, and fall back gracefully when their format changes.

## Test an extension locally

1. Copy the extension folder to `~/Library/Application Support/Beacon/Extensions/<id>`.
2. Quit and reopen Beacon. Beacon loads installed extensions when it starts.
3. Search for the command and run it.

If the script throws, Beacon shows the error in place of the results. Run Beacon from Xcode to see `console.log` output in the Xcode console.

## Submit an extension

1. Add the extension folder under `extensions/`.
2. Add an entry to `catalog.json` with the same `id`, `name`, `description`, `version`, and `icon` as the manifest.
3. Add the extension to the table in [README.md](README.md).
4. Open a pull request titled in the Conventional Commits format with the extension identifier as the scope, for example `feat(vscode): add a command to open recent files`.

To publish an update, raise `version` in both `manifest.json` and `catalog.json`. Installed copies update only when the catalog version is newer.
