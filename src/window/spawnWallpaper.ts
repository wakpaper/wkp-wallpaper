import {BrowserWindow, screen} from "electron";
import * as electronWallpaper from "electron-as-wallpaper";
import readWallpaperJSON, {saveWallpaperJSON} from "../utils/read-wallpaper.json";

const spawnWallpaper = (index:number, computerReload:boolean = false):boolean => {
  const data:Desktop[] = readWallpaperJSON();
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
    title: `Wallpaper${index}`
  });
  wallpaperWindow.setBounds(display.bounds);
  wallpaperWindow.loadFile("resources/html/wallpaper.html");
  electronWallpaper.attach(wallpaperWindow, {
    forwardMouseInput: true
  });
  wallpaperWindow.webContents.on("did-finish-load", () => {
    data.push({apply: true, display: index, pid: wallpaperWindow.webContents.getOSProcessId()});
    saveWallpaperJSON(data);
  });
  return true;
};

export default spawnWallpaper;
