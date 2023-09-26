#include <napi.h>
#include <iostream>
#include <windows.h>

BOOL CALLBACK EnumChildWindowProc(HWND hWnd, LPARAM lParam)
{
  DWORD processId;
  GetWindowThreadProcessId(hWnd, &processId);
  if (processId == lParam)
  {
    SetParent(hWnd, NULL);
    return FALSE;
  }
  return TRUE;
}

void setWallpaper(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, reinterpret_cast<wchar_t *>(info[0].As<Napi::Buffer<void *>>().Data()), SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
}

void detachWindow(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  static HWND workerW = nullptr;
  EnumWindows([](HWND topHandle, LPARAM topParamHandle)
              {
    HWND shellDllDefView = FindWindowExW(topHandle, nullptr, L"SHELLDLL_DefView", nullptr);
    if (shellDllDefView != nullptr)
    {
      workerW = FindWindowExW(nullptr, topHandle, L"WorkerW", nullptr);
    }
    return TRUE; },
              NULL);
  if (workerW == nullptr)
  {
    Napi::TypeError::New(env, "couldn't locate WorkerW").ThrowAsJavaScriptException();
    return;
  }
  EnumChildWindows(workerW, EnumChildWindowProc, (LPARAM)info[0].ToNumber().Uint32Value());
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "detachWindow"), Napi::Function::New(env, detachWindow));
  exports.Set(Napi::String::New(env, "setWallpaper"), Napi::Function::New(env, setWallpaper));
  return exports;
}

NODE_API_MODULE(addon, Init);
