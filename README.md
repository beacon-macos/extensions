# Beacon Extensions

Extensions add commands to [Beacon](https://github.com/beacon-macos/Beacon), the macOS launcher. Install them from **Beacon Settings → Extensions**; Beacon downloads them from this repository.

| Extension | Commands |
| --- | --- |
| [Visual Studio Code](vscode) | Open Recent Project |

## How an extension works

Each extension is a folder named after its identifier, containing a `manifest.json` and a JavaScript file. [`catalog.json`](catalog.json) lists the extensions that Beacon offers in its settings.

When you run one of the extension's commands, Beacon evaluates its script in a fresh JavaScriptCore context and calls the command handler. The handler returns a list of items, which Beacon shows in the launcher. Choosing an item performs its action.

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
| `version` | Dotted version. Beacon offers an update when `catalog.json` lists a newer one. |
| `icon` | Optional. One of `{ "app": "<bundle identifier>" }`, `{ "file": "<path>" }`, or `{ "symbol": "<SF Symbol name>" }`. |
| `main` | The script file name, in the same folder. |
| `commands` | The commands that appear in the launcher. `subtitle` defaults to the extension name, and `placeholder` is the search field placeholder while the command is open. |

### The script

The script registers a handler for each command in the manifest. Handlers are synchronous and return an array of items:

```js
beacon.registerCommand("open-recent-project", () => [
  {
    id: "/Users/me/project",
    title: "project",
    subtitle: "~/project",
    icon: { file: "/Users/me/project" },
    action: { type: "open", target: "/Users/me/project", application: "com.microsoft.VSCode" },
  },
]);
```

| Item field | Description |
| --- | --- |
| `id` | Optional stable identifier. |
| `title`, `subtitle` | The row text. Beacon searches both. |
| `icon` | Optional, in the same format as the manifest icon. |
| `action` | `{ "type": "open", "target": "<path or URL>", "application": "<bundle identifier>" }`. A target that starts with `/` or `~` is a path; anything else must be a URL. `application` is optional. |

The global `beacon` object provides:

| API | Description |
| --- | --- |
| `beacon.registerCommand(id, handler)` | Registers the handler for a command in the manifest. |
| `beacon.homeDirectory` | The user's home directory. |
| `beacon.fileExists(path)` | Whether a file or folder exists. |
| `beacon.readFile(path)` | A UTF-8 file's contents, or `null`. |
| `beacon.querySQLite(path, sql)` | Rows from a SQLite database opened read-only, as objects keyed by column name. Throws on failure. |
| `console.log(...)` | Writes to Beacon's log. |

Paths may start with `~`.

## Adding an extension

1. Create a folder named after the extension identifier with `manifest.json` and the script.
2. Add the extension to `catalog.json` with the same `id`, `name`, `description`, `version`, and `icon` as the manifest.
3. Open a pull request.

To publish an update, raise `version` in both `manifest.json` and `catalog.json`.

Extensions run with Beacon's access to your files, so every extension in this repository is reviewed before it is merged.
