import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("ipc", {
  send: (channel:string, ...data:any[]) => {
    ipcRenderer.send(channel, ...data);
  },
  on: (channel:string, listener: (event:Electron.IpcRendererEvent, ...args:any[]) => void) => {
    ipcRenderer.on(channel, listener);
  }
});
