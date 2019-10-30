#include <node.h>
#include <node_object_wrap.h>
#include <nan.h>

namespace CustomRunInThisContext {
  using v8::FunctionCallbackInfo;
  using v8::Local;
  using v8::Object;
  using v8::Script;
  using v8::ScriptCompiler;
  using v8::ScriptOrigin;
  using v8::String;
  using v8::TryCatch;
  using v8::UnboundScript;
  using v8::Value;
  using v8::MaybeLocal;

  static void RunInThisContextCached(const FunctionCallbackInfo<Value>& args) {
    if (!args[0]->IsString() || !args[1]->IsString()) {
      Nan::ThrowTypeError("Filename and script must be strings");
      return;
    }

    Local<String> code = args[0]->ToString(args.GetIsolate());
    Local<String> filename = args[1]->ToString(args.GetIsolate());

    uint8_t *bufferData = nullptr;
    size_t bufferLength = 0;
    if (args[2]->IsObject()) {
      Local<Object> bufferObj = args[2]->ToObject();
      bufferData = reinterpret_cast<uint8_t*>(node::Buffer::Data(bufferObj));
      bufferLength = node::Buffer::Length(bufferObj);
    }

    auto cachedData = new ScriptCompiler::CachedData(bufferData, bufferLength);
    ScriptOrigin origin(filename);
    ScriptCompiler::Source source(code, origin, cachedData);
    MaybeLocal<UnboundScript> maybe_unbound_script = ScriptCompiler::CompileUnboundScript(
      args.GetIsolate(),
      &source,
      ScriptCompiler::CompileOptions::kConsumeCodeCache
    );

    Local<UnboundScript> unbound_script;
    if (!maybe_unbound_script.ToLocal(&unbound_script)) return;

    Nan::TryCatch try_catch;
    Local<Script> script = unbound_script->BindToCurrentContext();
    Local<Value> result = script->Run();
    if (result.IsEmpty()) {
      try_catch.ReThrow();
      return;
    }

    Local<Object> returnValue = Nan::New<v8::Object>();
    Nan::Set(returnValue, Nan::New("result").ToLocalChecked(), result);
    Nan::Set(returnValue, Nan::New("wasRejected").ToLocalChecked(), Nan::New(source.GetCachedData()->rejected));
    args.GetReturnValue().Set(returnValue);
  }

  static void RunInThisContext(const FunctionCallbackInfo<Value>& args) {
    if (!args[0]->IsString() || !args[1]->IsString()) {
      Nan::ThrowTypeError("Filename and script must be strings");
      return;
    }

    Local<String> code = args[0]->ToString(args.GetIsolate());
    Local<String> filename = args[1]->ToString(args.GetIsolate());
    ScriptOrigin origin(filename);
    ScriptCompiler::Source source(code, origin);
    MaybeLocal<UnboundScript> maybe_unbound_script = ScriptCompiler::CompileUnboundScript(
      args.GetIsolate(),
      &source,
      ScriptCompiler::CompileOptions::kProduceCodeCache
    );

    Local<UnboundScript> unbound_script;
    if (!maybe_unbound_script.ToLocal(&unbound_script)) return;
    if (unbound_script.IsEmpty()) return;

    Nan::TryCatch try_catch;
    Local<Script> script = unbound_script->BindToCurrentContext();
    Local<Value> result = script->Run();
    if (result.IsEmpty()) {
      try_catch.ReThrow();
      return;
    }

    Local<Value> cacheBuffer = Nan::Null();

    #if V8_MAJOR_VERSION == 6 && V8_MINOR_VERSION >= 7
      const ScriptCompiler::CachedData *data = ScriptCompiler::CreateCodeCache(unbound_script);
      if (data) {
        cacheBuffer = Nan::CopyBuffer(reinterpret_cast<const char*>(data->data), data->length).ToLocalChecked();
        delete data;
      }
    #else
      const ScriptCompiler::CachedData *data = source.GetCachedData();
      if (data) {
        cacheBuffer = Nan::CopyBuffer(reinterpret_cast<const char*>(data->data), data->length).ToLocalChecked();
      }
    #endif

    Local<Object> returnValue = Nan::New<v8::Object>();
    Nan::Set(returnValue, Nan::New("cacheBuffer").ToLocalChecked(), cacheBuffer);
    Nan::Set(returnValue, Nan::New("result").ToLocalChecked(), result);
    args.GetReturnValue().Set(returnValue);
  }

  void Init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "runInThisContext", RunInThisContext);
    NODE_SET_METHOD(exports, "runInThisContextCached", RunInThisContextCached);
  }

  NODE_MODULE(cached_run_in_this_context, Init)
}
