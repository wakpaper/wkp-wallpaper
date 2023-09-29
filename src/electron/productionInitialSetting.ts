import {app} from "electron";
import fs from "fs";
import {WALLPAPER_PATH} from "../main";
import spawnWallpaper from "../window/spawnWallpaper";
import readWallpaperJSON, {saveWallpaperJSON} from "../utils/read-wallpaper.json";

const productionInitialSetting = ():void => {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    path: app.getPath("exe"),
    args: ["--hidden"]
  });
  if(fs.existsSync(WALLPAPER_PATH)){
    const data = readWallpaperJSON();
    if(data.length > 0)
      saveWallpaperJSON([]);
    for(const item of data)
      spawnWallpaper(item.display, true);
  }
};

export default productionInitialSetting;
