{
  "targets": [
    {
      "target_name": "hello_world",
      "sources": ["lib/hello_world.cpp"],
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