#ifndef SRC_GCSIGNAL_H
#define SRC_GCSIGNAL_H

#include <nan.h>

namespace gcsignals {

class GCSignal : public node::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init);

 private:
  explicit GCSignal(double value);
  ~GCSignal();

  static NAN_METHOD(New);
  static Nan::Persistent<v8::Function> constructor;
  double value_;
};

}  // namespace gcsignals

#endif  // SRC_GCSIGNAL_H
