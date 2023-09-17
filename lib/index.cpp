#include <napi.h>

#include <windows.h>

void setWallpaper(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  SystemParametersInfo(SPI_SETDESKWALLPAPER, 0, info[0], SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  return exports;
}

NODE_API_MODULE(addon, Init);
