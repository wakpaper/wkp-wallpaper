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

function createWallpaperWindow(index:number){
  if(!wallpaperWindows.some(item => item.displayIndex === index)){
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
      autoHideMenuBar: true
    });
    wallpaperWindow.setBounds(display.bounds);
    wallpaperWindow.loadFile("assets/wallpaper.html");
    wallpaperWindows.push({
      window: wallpaperWindow,
      displayIndex: index
    });
    try{
      electronWallpaper.attach(wallpaperWindow);
      electronWallpaper.refresh();
    }catch(e){
      console.log(e);
    }
    return true;
  }
  return false;
}

const wallpaper = bindings("wallpaper");
let window:BrowserWindow;
let wallpaperWindows:WallpaperWindow[] = [];

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
  screen.on("display-metrics-changed", () => {
    const displays = screen.getAllDisplays();
    for(const screen of wallpaperWindows){
      if(!screen.window.isDestroyed()){
        const display = displays[screen.displayIndex];
        screen.window.setBounds(display.bounds);
      }
    }
  });
});

ipcMain.on("displays:give", event => {
  event.reply("displays:result", screen.getAllDisplays().map(item => ({width: item.bounds.width, height: item.bounds.height})));
});

ipcMain.on("displays:select", (event, index) => {
  createWallpaperWindow(index)
    ? event.reply("displays:success")
    : event.reply("displays:fail")
  ;
});

ipcMain.on("displays:detach", (event, index) => {
  const wallpaperWindowIndex = wallpaperWindows.findIndex(item => item.displayIndex === index);
  if(wallpaperWindowIndex !== -1){
    const wallpaperWindow = wallpaperWindows[wallpaperWindowIndex];
    electronWallpaper.detach(wallpaperWindow.window);
    electronWallpaper.refresh();
    wallpaperWindow.window.setClosable(true);
    wallpaperWindow.window.close();
    wallpaperWindows.splice(wallpaperWindowIndex, 1);
  }
  event.reply("displays:success");
});

interface WallpaperWindow{
  window:BrowserWindow;
  displayIndex:number;
};
