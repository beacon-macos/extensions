const VSCODE_BUNDLE_ID = "com.microsoft.VSCode";
const STORAGE_DIRECTORY = beacon.homeDirectory + "/Library/Application Support/Code/User/globalStorage";
const WORKSPACE_EXTENSION = ".code-workspace";

beacon.registerCommand("open-recent-project", () => {
  const seen = new Set();
  return recentProjectPaths()
    .filter((path) => !seen.has(path) && seen.add(path) && beacon.fileExists(path))
    .map(projectItem);
});

// VS Code keeps its recently opened list in the application state database. The menu bar cache in
// storage.json mirrors the File > Open Recent menu and is used when the database has no entries.
function recentProjectPaths() {
  const fromDatabase = recentPathsFromStateDatabase();
  return fromDatabase.length > 0 ? fromDatabase : recentPathsFromMenuBar();
}

function recentPathsFromStateDatabase() {
  const databasePath = STORAGE_DIRECTORY + "/state.vscdb";
  if (!beacon.fileExists(databasePath)) return [];

  let rows;
  try {
    rows = beacon.querySQLite(
      databasePath,
      "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'"
    );
  } catch (error) {
    console.warn("Could not read the VS Code state database:", error);
    return [];
  }
  if (rows.length === 0) return [];

  const entries = parseJSON(rows[0].value)?.entries ?? [];
  return entries
    .map((entry) => entry.folderUri ?? entry.workspace?.configPath)
    .map(pathFromFileURI)
    .filter(Boolean);
}

function recentPathsFromMenuBar() {
  const storage = parseJSON(beacon.readFile(STORAGE_DIRECTORY + "/storage.json"));
  const paths = [];
  const visit = (items) => {
    for (const item of items ?? []) {
      if (
        (item.id === "openRecentFolder" || item.id === "openRecentWorkspace") &&
        item.uri?.scheme === "file"
      ) {
        paths.push(item.uri.path);
      }
      visit(item.submenu?.items);
    }
  };
  visit(storage?.lastKnownMenubarData?.menus?.File?.items);
  return paths;
}

function projectItem(path) {
  const name = path.split("/").filter(Boolean).pop() ?? path;
  const isWorkspace = name.endsWith(WORKSPACE_EXTENSION);
  return {
    id: path,
    title: isWorkspace ? name.slice(0, -WORKSPACE_EXTENSION.length) + " (Workspace)" : name,
    subtitle: abbreviateHome(path),
    icon: { file: path },
    action: { type: "open", target: path, application: VSCODE_BUNDLE_ID },
  };
}

function pathFromFileURI(uri) {
  if (typeof uri !== "string" || !uri.startsWith("file://")) return null;
  try {
    return decodeURIComponent(uri.slice("file://".length));
  } catch {
    return null;
  }
}

function abbreviateHome(path) {
  const home = beacon.homeDirectory;
  return path === home || path.startsWith(home + "/") ? "~" + path.slice(home.length) : path;
}

function parseJSON(text) {
  if (typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
