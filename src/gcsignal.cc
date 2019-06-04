#include "gcsignal.h"

namespace gcsignals {

std::vector<double> signals;
uv_mutex_t signals_lock;
Nan::Persistent<v8::Function> GCSignal::constructor;

GCSignal::GCSignal(double value) : value_(value) {}

GCSignal::~GCSignal() {
  uv_mutex_lock(&signals_lock);
  signals.push_back(this->value_);
  uv_mutex_unlock(&signals_lock);
}

NAN_METHOD(ConsumeSignals) {
  uv_mutex_lock(&signals_lock);

  size_t resultCount = signals.size();
  v8::Local<v8::Array> result = Nan::New<v8::Array>(resultCount);
  for (size_t index = 0; index < resultCount; index++) {
    Nan::Set(result, index, Nan::New<v8::Number>(signals[index]));
  }

  info.GetReturnValue().Set(result);
  signals.clear();

  uv_mutex_unlock(&signals_lock);
}

NAN_METHOD(GCSignal::New) {
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new GCSignal(...)`
    double value =
        info[0]->IsUndefined() ? 0 : Nan::To<double>(info[0]).FromJust();
    auto* obj = new GCSignal(value);
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    // Invoked as plain function `GCSignal(...)`, turn into construct call.
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = {info[0]};
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
    info.GetReturnValue().Set(
        Nan::NewInstance(cons, argc, argv).ToLocalChecked());
  }
}

NAN_MODULE_INIT(GCSignal::Init) {
  uv_mutex_init(&signals_lock);

  Nan::SetMethod(target, "consumeSignals", ConsumeSignals);

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New<v8::String>("GCSignal").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  v8::Local<v8::Function> function = Nan::GetFunction(tpl).ToLocalChecked();
  constructor.Reset(function);
  Nan::Set(target, Nan::New<v8::String>("GCSignal").ToLocalChecked(),
      function);
}

NODE_MODULE(gcsignal, GCSignal::Init)

}  // namespace gcsignals
