import {BrowserWindow, app, ipcMain, screen} from "electron";
import bindings from "bindings";
import path from "node:path";
import fs from "fs";
import * as electronWallpaper from "electron-as-wallpaper";

function createWindow(){
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    show: false
  });
  mainWindow.maximize();
  if(app.isPackaged){
    mainWindow.setMenu(null);
  }
  mainWindow.loadFile("assets/index.html");
  window = mainWindow;
}

function createWallpaperWindow(index:number){
  const chunk = fs.existsSync(WALLPAPER_PATH) ? fs.readFileSync(WALLPAPER_PATH) : "[]";
  const data:Desktop[] = JSON.parse(chunk.toString());
  if(data.some(item => item.display === index))
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
    thickFrame: false
  });
  wallpaperWindow.setBounds(display.bounds);
  wallpaperWindow.loadFile("assets/wallpaper.html");
  try{
    electronWallpaper.attach(wallpaperWindow);
    electronWallpaper.refresh();
    wallpaperWindow.webContents.on("did-finish-load", () => {
      data.push({apply: true, display: index, pid: wallpaperWindow.webContents.getOSProcessId()});
      fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(data));
    });
    return true;
  }catch(e){
    console.log(e);
  }
}

const wallpaper = bindings("wallpaper");
const WALLPAPER_PATH = path.join(app.getPath("userData"), "wallpaper.json");
let window:BrowserWindow;

app.whenReady().then(() => {
  createWindow();
  // wallpaper.setWallpaper(strEncodeUTF16("C:\\Users\\bsiu6\\AppData\\Roaming\\wakpaper-client\\wallpapers\\4568708\\비챤_팬아트_4_일러.png"));
  if(app.isPackaged){
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: app.getPath("exe")
    });
    if(fs.existsSync(WALLPAPER_PATH)){
      const chunk = fs.readFileSync(WALLPAPER_PATH);
      const data = JSON.parse(chunk.toString());
      for(const item of data){
        if(item.apply){
          createWallpaperWindow(item.display);
        }
      }
    }
  }
  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
  screen.on("display-metrics-changed", () => {
  });
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

ipcMain.on("displays:select", (event, index) => {
  const result = createWallpaperWindow(index);
  result
    ? event.reply("displays:success")
    : event.reply("displays:already-done")
  ;
});

ipcMain.on("displays:detach", (event, index) => {
  const chunk = fs.existsSync(WALLPAPER_PATH) ? fs.readFileSync(WALLPAPER_PATH) : "[]";
  const data:Desktop[] = JSON.parse(chunk.toString());
  const dataItem = data.find(item => item.display === index);
  if(!dataItem){
    event.reply("displays:fail");
    return;
  }
  data.splice(index, 1);
  fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(data));
  wallpaper.detachWindow(process.pid);
  process.kill(dataItem.pid);
  electronWallpaper.refresh();
  event.reply("displays:success");
});

ipcMain.on("force-reload", () => {
  electronWallpaper.refresh();
});

function strEncodeUTF16(str:string){
  let buf = new ArrayBuffer(str.length * 2);
  let bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++){
    bufView[i] = str.charCodeAt(i);
  }
  return new Uint8Array(buf);
}

interface Desktop{
  apply:boolean;
  display:number;
  pid:number;
};
