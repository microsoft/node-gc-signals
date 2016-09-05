// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <vector>
#include <node_object_wrap.h>

namespace gcsignals {

void ConsumeSignals(const v8::FunctionCallbackInfo<v8::Value>& args);

class GCSignal : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);

 private:
  explicit GCSignal(double value);
  ~GCSignal();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif