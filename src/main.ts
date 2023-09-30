import {BrowserWindow, Tray, app, ipcMain, protocol, screen} from "electron";
import bindings from "bindings";
import path from "node:path";
import * as electronWallpaper from "electron-as-wallpaper";
import spawnMain from "./window/spawnMain";
import spawnWallpaper from "./window/spawnWallpaper";
import initTray from "./electron/tray";
import productionInitialSetting from "./electron/productionInitialSetting";
import readWallpaperJSON, {saveWallpaperJSON} from "./utils/read-wallpaper.json";

export const WALLPAPER_PATH = path.join(app.getPath("userData"), "wallpaper.json");
const wallpaper = bindings("wallpaper");

let window:BrowserWindow;
let tray:Tray|null = null;

const gotTheLock = app.requestSingleInstanceLock();
if(!gotTheLock){
  app.quit();
}

app.whenReady().then(() => {
  window = spawnMain();
  app.setName("왁페이퍼 엔진 테스트");
  if(app.isPackaged)
    productionInitialSetting();
  tray = initTray(window);
});

app.on("second-instance", () => {
  window.show();
  window.focus();
});

app.on("activate", () => {
  window.show();
  window.focus();
});

app.on("window-all-closed", () => {
  if(process.platform !== "darwin")
    app.quit();
});

ipcMain.on("displays:give", event => {
  const primary = screen.getPrimaryDisplay();
  event.reply("displays:result", screen.getAllDisplays().map(item => ({
    width: item.bounds.width,
    height: item.bounds.height,
    rotation: item.rotation,
    primary: primary.id === item.id
  })));
});

ipcMain.on("display:attach", (event, index) => {
  const result = spawnWallpaper(index);
  result
    ? event.reply("displays:success")
    : event.reply("displays:already-done")
  ;
});

ipcMain.on("display:detach", (event, index) => {
  const data = readWallpaperJSON();
  const dataItem = data.find(item => item.display === index);
  if(!dataItem){
    event.reply("displays:fail");
    return;
  }
  data.splice(index, 1);
  saveWallpaperJSON(data);
  const window = BrowserWindow.getAllWindows().find(item => item.title === `Wallpaper${index}`);
  if(window){
    electronWallpaper.detach(window);
    window.setClosable(true);
    window.close();
    event.reply("displays:success");
  }
});

ipcMain.on("reload", () => {
  wallpaper.refreshWallpaper();
  saveWallpaperJSON([]);
});
