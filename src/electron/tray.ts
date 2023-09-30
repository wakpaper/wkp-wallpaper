import {BrowserWindow, Menu, Tray, app, nativeImage, screen} from "electron";
import * as electronWallpaper from "electron-as-wallpaper";
import fs from "fs";
import {WALLPAPER_PATH} from "../main";
import readWallpaperJSON, {saveWallpaperJSON} from "../utils/read-wallpaper.json";

const clickOpenMenu = (window:BrowserWindow) => () => {
  window.show();
  window.focus();
};

const closeWallpaper = (index:number) => () => {
  const data = readWallpaperJSON();
  const dataItem = data.find(item => item.display === index);
  if(!dataItem) return;
  data.splice(index, 1);
  saveWallpaperJSON(data);
  const window = BrowserWindow.getAllWindows().find(item => item.title === `Wallpaper${index}`);
  if(window){
    electronWallpaper.detach(window);
    window.destroy();
  }
};

const clickQuit = () => {
  for(const window of BrowserWindow.getAllWindows()){
    if(window.title.startsWith("Wallpaper"))
      electronWallpaper.detach(window);
    window.setClosable(true);
    window.close();
  }
  app.quit();
  electronWallpaper.refresh();
  fs.writeFileSync(WALLPAPER_PATH, "[]");
};

const initTray = (window:BrowserWindow):Tray => {
  const displays = screen.getAllDisplays();
  const icon = nativeImage.createFromPath("resources/img/icon.png");
  const tray = new Tray(icon.resize({width: 36}));
  const contextMenu = Menu.buildFromTemplate([
    {
      icon: icon.resize({width: 16}),
      label: "Wakpaper Engine",
      enabled: false
    },
    {
      type: "separator"
    },
    {
      label: "열기",
      click: clickOpenMenu(window)
    },
    {
      type: "separator"
    },
    {
      id: "wallpaper-close",
      label: "배경화면 끄기",
      submenu: displays.map((item, index) => ({
        label: `디스플레이 ${index + 1} 끄기`,
        toolTip: item.id.toString(),
        click: closeWallpaper(index)
      }))
    },
    {
      label: "배경화면 바꾸기 (즐찾 10개만)",
      submenu: displays.map((item, index) => ({
        label: `디스플레이 ${index + 1} 끄기`,
        toolTip: item.id.toString(),
        submenu: [
          {
            label: "한복비챤"
          }
        ]
      }))
    },
    {
      type: "separator"
    },
    {
      label: "끝내기",
      click: clickQuit
    }
  ]);
  tray.addListener("click", clickOpenMenu(window));
  tray.setToolTip("왁페이퍼 엔진");
  tray.setContextMenu(contextMenu);
  return tray;
};

export default initTray;
