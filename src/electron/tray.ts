import {type BrowserWindow, Menu, Tray, app} from "electron";

const initTray = (window:BrowserWindow):Tray => {
  const tray = new Tray("resources/img/icon.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "열기",
      click: () => {
        window.show();
        window.focus();
      }
    },
    {
      label: "끝내기",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("왁페이퍼 엔진");
  tray.setContextMenu(contextMenu);
  return tray;
};

export default initTray;
