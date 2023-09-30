import {BrowserWindow, app} from "electron";
import path from "node:path";

const spawnMain = ():BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js")
    },
    icon: "resources/img/favico.ico",
    show: false
  });
  if(process.argv.includes("--hidden"))
    mainWindow.hide();
  else{
    mainWindow.show();
    mainWindow.maximize();
  }
  if(app.isPackaged)
    mainWindow.setMenu(null);
  mainWindow.loadFile("resources/html/index.html");
  mainWindow.on("close", (event) => {
    if(mainWindow.isVisible()){
      event.preventDefault();
      mainWindow.hide();
    }
  });
  return mainWindow;
};

export default spawnMain;
