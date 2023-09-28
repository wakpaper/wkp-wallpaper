import {app} from "electron";
import fs from "fs";
import {WALLPAPER_PATH} from "../main";
import spawnWallpaper from "../window/spawnWallpaper";

const productionInitialSetting = ():void => {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    path: app.getPath("exe"),
    enabled: true
  });
  if(fs.existsSync(WALLPAPER_PATH)){
    const chunk = fs.readFileSync(WALLPAPER_PATH);
    const data = JSON.parse(chunk.toString());
    if(data.length > 0)
      fs.writeFileSync(WALLPAPER_PATH, "[]");
    for(const item of data)
      spawnWallpaper(item.display, true);
  }
};

export default productionInitialSetting;
