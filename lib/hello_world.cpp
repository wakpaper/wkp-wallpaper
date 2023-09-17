#include <napi.h>

Napi::String HelloWorld(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello World! Electron!");
}

Napi::Object init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "HelloWorld"), Napi::Function::New(env, HelloWorld));
  return exports;
}

NODE_API_MODULE(hello_world, init);
