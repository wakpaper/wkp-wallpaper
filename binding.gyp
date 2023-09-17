{
  "targets": [
    {
      "target_name": "wallpaper",
      "sources": ["lib/index.cpp"],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "msvs_settings": {
        "VCCLCompilerTool": {"ExceptionHandling": 1}
      }
    }
  ]
}