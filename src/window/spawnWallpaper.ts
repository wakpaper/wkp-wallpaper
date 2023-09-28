import {BrowserWindow, screen} from "electron";
import fs from "fs";
import * as electronWallpaper from "electron-as-wallpaper";
import {WALLPAPER_PATH} from "../main";

const spawnWallpaper = (index:number, computerReload:boolean = false):boolean => {
  const chunk = fs.existsSync(WALLPAPER_PATH) ? fs.readFileSync(WALLPAPER_PATH) : "[]";
  const data:Desktop[] = JSON.parse(chunk.toString());
  if(data.some(item => item.display === index) && !computerReload)
    return false;
  const display = screen.getAllDisplays()[index];
  const wallpaperWindow = new BrowserWindow({
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
    thickFrame: false,
    title: "Wallpaper"
  });
  wallpaperWindow.setBounds(display.bounds);
  wallpaperWindow.loadFile("resources/html/wallpaper.html");
  electronWallpaper.attach(wallpaperWindow);
  wallpaperWindow.webContents.on("did-finish-load", () => {
    data.push({apply: true, display: index, pid: wallpaperWindow.webContents.getOSProcessId()});
    fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(data));
  });
  return true;
};

export default spawnWallpaper;
