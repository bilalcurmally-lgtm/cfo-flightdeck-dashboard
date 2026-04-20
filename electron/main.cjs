const path = require("node:path");
const { app, BrowserWindow, shell } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 760,
    title: "CFO Flight Deck",
    backgroundColor: "#090a0c",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
