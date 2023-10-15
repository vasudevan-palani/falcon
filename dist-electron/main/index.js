"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(process.env.DIST, "index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Main window",
    titleBarStyle: "hidden",
    width: 1920,
    height: 1080,
    icon: node_path.join(process.env.VITE_PUBLIC, "dist/falconicon_512.icns"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });
  win.setMinimumSize(1280, 720);
  win.on("closed", () => {
    win = null;
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  let position1 = win.getPosition();
  console.log(position1);
  electron.ipcMain.on("open-file-dialog", function(event) {
    electron.dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    }).then((result) => {
      let filepaths = result.filePaths;
      console.log(result);
      event.sender.send("selected-folder", filepaths);
    });
  });
  electron.ipcMain.on("open-import-dialog", function(event) {
    electron.dialog.showOpenDialog(win, {
      properties: ["openFile"]
    }).then((result) => {
      let filepaths = result.filePaths;
      console.log(result);
      event.sender.send("selected-import-file", filepaths[0]);
    });
  });
  electron.ipcMain.on("dblclick-navbar", () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  electron.ipcMain.on("closeApp", (event, x, y) => {
    win.close();
  });
  electron.ipcMain.on("minimizeApp", (event, x, y) => {
    win.minimize();
  });
});
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
//# sourceMappingURL=index.js.map
