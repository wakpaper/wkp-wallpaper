import {type BrowserWindow, Menu, Tray, nativeImage} from "electron";

const clickOpenMenu = (window:BrowserWindow) => () => {
  window.show();
  window.focus();
};

const initTray = (window:BrowserWindow):Tray => {
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
      role: "quit",
      type: "normal",
      label: "끝내기"
    }
  ]);
  tray.addListener("click", clickOpenMenu(window));
  tray.setToolTip("왁페이퍼 엔진");
  tray.setContextMenu(contextMenu);
  return tray;
};

export default initTray;
