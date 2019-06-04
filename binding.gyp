{
  "targets": [
    {
      "target_name": "gcsignals",
      "defines": [ "V8_DEPRECATION_WARNINGS=1" ],
      "include_dirs": ["<!(node -e \"require('nan')\")"],
      "sources": [ 
        "src/gcsignal.cc",
        "src/gcsignal.h", 
      ]
    }
  ]
}