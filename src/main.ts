import {BrowserWindow, app} from "electron";
import bindings from "bindings";

function createWindow(){
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080
  });
  mainWindow.maximize();
  window = mainWindow;
}

let window:BrowserWindow;

app.whenReady().then(() => {
  const str = bindings("hello_world").HelloWorld();
  // console.log(str);
  createWindow();
  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
