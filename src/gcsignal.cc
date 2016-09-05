// myobject.cc
#include "gcsignal.h"
#include <uv.h>
#include <vector>

namespace gcsignals {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Array;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

std::vector<double> signals;
uv_mutex_t signals_lock;

Persistent<Function> GCSignal::constructor;

GCSignal::GCSignal(double value) : value_(value) {
}

GCSignal::~GCSignal() {
  uv_mutex_lock(&signals_lock);
  signals.push_back(this->value_);
  uv_mutex_unlock(&signals_lock);
}

void GCSignal::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "GCSignal"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "GCSignal"), tpl->GetFunction());
}

void GCSignal::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new GCSignal(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    GCSignal* obj = new GCSignal(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());

  } else {
    // Invoked as plain function `GCSignal(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Context> context = isolate->GetCurrentContext();
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    Local<Object> result = cons->NewInstance(context, argc, argv).ToLocalChecked();
    args.GetReturnValue().Set(result);
  }
}

void ConsumeSignals(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  uv_mutex_lock(&signals_lock);

  int resultCount = (int)signals.size();
  Local<Array> resultArr = Array::New(isolate, resultCount);
  for (int index = 0; index < resultCount; index++) {
    resultArr->Set(index, Number::New(isolate, signals[index]));
  }

  args.GetReturnValue().Set(resultArr);
  signals.clear();

  uv_mutex_unlock(&signals_lock);
}

void InitAll(Local<v8::Object> exports) {

  uv_mutex_init(&signals_lock);

  NODE_SET_METHOD(exports, "consumeSignals", ConsumeSignals);

  GCSignal::Init(exports);
}

NODE_MODULE(addon, InitAll)

}  // namespace gcsignals