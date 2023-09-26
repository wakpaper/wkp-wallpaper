#include <napi.h>

#include <windows.h>

void setWallpaper(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, reinterpret_cast<wchar_t *>(info[0].As<Napi::Buffer<void *>>().Data()), SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "setWallpaper"), Napi::Function::New(env, setWallpaper));
  return exports;
}

NODE_API_MODULE(addon, Init);
