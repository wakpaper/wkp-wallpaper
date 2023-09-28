import {BrowserWindow, Menu, Tray, app, ipcMain, nativeImage, screen} from "electron";
import bindings from "bindings";
import path from "node:path";
import fs from "fs";
import * as electronWallpaper from "electron-as-wallpaper";

function createWallpaperWindow(index:number, computerReload:boolean = false){
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
  electronWallpaper.refresh();
  wallpaperWindow.webContents.on("did-finish-load", () => {
    data.push({apply: true, display: index, pid: wallpaperWindow.webContents.getOSProcessId()});
    fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(data));
  });
}

const wallpaper = bindings("wallpaper");
const WALLPAPER_PATH = path.join(app.getPath("userData"), "wallpaper.json");

app.whenReady().then(() => {
  const window = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    show: false,
    icon: "resources/img/favico.ico"
  });
  window.maximize();
  if(app.isPackaged)
    window.setMenu(null);
  window.loadFile("resources/html/index.html");
  if(app.isPackaged){
    app.setName("왁페이퍼 엔진 테스트");
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: app.getPath("exe"),
      enabled: true
    });
    if(fs.existsSync(WALLPAPER_PATH)){
      const chunk = fs.readFileSync(WALLPAPER_PATH);
      const data = JSON.parse(chunk.toString());
      if(data.length > 0){
        fs.writeFileSync(WALLPAPER_PATH, "[]");
      }
      for(const item of data){
        createWallpaperWindow(item.display, true);
      }
    }
  }
  const tray = new Tray("resources/img/icon.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "열기",
      click: () => {
        window.show();
        window.focus();
      }
    }
  ]);
  tray.setToolTip("왁페이퍼 엔진");
  tray.setContextMenu(contextMenu);
  app.on("activate",() => {
    window.show();
    window.focus();
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
  wallpaper.detachWindow(process);
  process.kill(dataItem.pid);
  electronWallpaper.refresh();
  event.reply("displays:success");
});

ipcMain.on("force-reload", () => {
  electronWallpaper.refresh();
  fs.writeFileSync(WALLPAPER_PATH, "[]");
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
