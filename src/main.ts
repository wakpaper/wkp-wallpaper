import {BrowserWindow, Tray, app, ipcMain, screen} from "electron";
import bindings from "bindings";
import path from "node:path";
import fs from "fs";
import * as electronWallpaper from "electron-as-wallpaper";
import spawnMain from "./window/spawnMain";
import spawnWallpaper from "./window/spawnWallpaper";
import initTray from "./electron/tray";
import productionInitialSetting from "./electron/productionInitialSetting";

export const WALLPAPER_PATH = path.join(app.getPath("userData"), "wallpaper.json");
const wallpaper = bindings("wallpaper");

let window:BrowserWindow;
let tray:Tray|null = null;

app.whenReady().then(() => {
  window = spawnMain();
  app.setName("왁페이퍼 엔진 테스트");
  if(app.isPackaged)
    productionInitialSetting();
  tray = initTray(window);
});

app.on("quit", (event) => {
  if(window.isVisible()){
    window.hide();
    event.preventDefault();
  }
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
  const chunk = fs.existsSync(WALLPAPER_PATH) ? fs.readFileSync(WALLPAPER_PATH) : "[]";
  const data:Desktop[] = JSON.parse(chunk.toString());
  const dataItem = data.find(item => item.display === index);
  if(!dataItem){
    event.reply("displays:fail");
    return;
  }
  data.splice(index, 1);
  fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(data));
  wallpaper.detachWindow(process);
  process.kill(dataItem.pid);
  electronWallpaper.refresh();
  event.reply("displays:success");
});

ipcMain.on("reload", () => {
  electronWallpaper.refresh();
  fs.writeFileSync(WALLPAPER_PATH, "[]");
});
