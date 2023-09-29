#include <napi.h>

#include <windows.h>

void setWallpaper(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, reinterpret_cast<wchar_t *>(info[0].As<Napi::Buffer<void *>>().Data()), SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
}

void refreshWallpaper(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  HKEY hKey;
  DWORD bufferSize = MAX_PATH;
  char wallpaperPath[MAX_PATH];
  RegOpenKeyExA(HKEY_CURRENT_USER, "Control Panel\\Desktop", 0, KEY_READ, &hKey);
  RegQueryValueExA(hKey, "WallPaper", NULL, NULL, (LPBYTE)wallpaperPath, &bufferSize);
  SystemParametersInfo(SPI_SETDESKWALLPAPER, 0, (PVOID)wallpaperPath, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "setWallpaper"), Napi::Function::New(env, setWallpaper));
  exports.Set(Napi::String::New(env, "refreshWallpaper"), Napi::Function::New(env, refreshWallpaper));
  return exports;
}

NODE_API_MODULE(addon, Init);
