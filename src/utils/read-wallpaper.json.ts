import fs from "fs";
import {WALLPAPER_PATH} from "../main";

const readWallpaperJSON = ():Desktop[] => {
  const chunk = fs.existsSync(WALLPAPER_PATH) ? fs.readFileSync(WALLPAPER_PATH) : "[]";
  return JSON.parse(chunk.toString());
};

export default readWallpaperJSON;

export const saveWallpaperJSON = (wallpapers:Desktop[]):void => {
  fs.writeFileSync(WALLPAPER_PATH, JSON.stringify(wallpapers));
};
