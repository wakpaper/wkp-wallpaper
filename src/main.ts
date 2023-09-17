import {BrowserWindow, app, ipcMain, screen} from "electron";
import bindings from "bindings";
import path from "node:path";
import * as electronWallpaper from "electron-as-wallpaper";

function createWindow(){
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow.maximize();
  mainWindow.setMenu(null);
  mainWindow.loadFile("assets/index.html");
  window = mainWindow;
}

function createAndAttachWindow(index:number){
  const display = screen.getAllDisplays()[index];
  const wallpaperWindow_ = new BrowserWindow({
    width: display.bounds.width,
    height: display.bounds.height,
    fullscreen: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    frame: false,
    focusable: false,
    hasShadow: false,
    transparent: true,
    closable: false,
    roundedCorners: false,
    thickFrame: false
  });
  wallpaperWindow_.setPosition(display.bounds.x * display.bounds.width, display.bounds.y * display.bounds.height);
  wallpaperWindow_.loadFile("assets/wallpaper.html");
  wallpaperWindow = wallpaperWindow_;
  electronWallpaper.attach(wallpaperWindow, {
    transparent: true
  });
  electronWallpaper.refresh();
}

const wallpaper = bindings("wallpaper");
let window:BrowserWindow;
let wallpaperWindow:BrowserWindow|undefined;

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});

ipcMain.on("displays:give", event => {
  event.reply("displays:result", screen.getAllDisplays().map(item => ({width: item.bounds.width, height: item.bounds.height})));
});

ipcMain.on("displays:select", (event, index) => {
  createAndAttachWindow(index);
  event.reply("displays:success");
});

ipcMain.on("displays:detach", event => {
  if(!wallpaperWindow) return;
  electronWallpaper.detach(wallpaperWindow);
  wallpaperWindow.setClosable(true);
  wallpaperWindow.close();
  event.reply("displays:success");
});
