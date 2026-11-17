#!/bin/sh
set -eu

workspace="${1:-$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)}"
build_dir="$(mktemp -d "$workspace/tools/foxconvert/.flac-build.XXXXXX")"
trap 'rm -rf "$build_dir"' EXIT

docker run --rm \
  -v "$workspace:/workspace" \
  -v "$build_dir:/flac-build" \
  emscripten/emsdk:4.0.21 sh -eu -c '
  mkdir -p /flac-build/mediabunny /flac-build/flac
  curl -fsSL https://codeload.github.com/Vanilagy/mediabunny/tar.gz/refs/tags/v1.65.2 \
    | tar -xz --strip-components=1 -C /flac-build/mediabunny
  curl -fsSL https://codeload.github.com/xiph/flac/tar.gz/3f1ecff843dd1b8c07fbb5f59425a4ec71fe4f6c \
    | tar -xz --strip-components=1 -C /flac-build/flac
  node /workspace/tools/foxconvert/patch-flac-source.mjs /flac-build/mediabunny
  cd /flac-build/flac
  mkdir -p build
  cd build
  emcmake cmake .. \
    -DBUILD_PROGRAMS=OFF \
    -DBUILD_CXXLIBS=OFF \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_TESTING=OFF \
    -DWITH_OGG=OFF \
    -DBUILD_SHARED_LIBS=OFF \
    -DENABLE_MULTITHREADING=OFF \
    -DINSTALL_MANPAGES=OFF \
    -DCMAKE_C_FLAGS="-DNDEBUG -Oz -flto -msimd128"
  emmake make -j2
  cd /flac-build/mediabunny/packages/flac-encoder
  emcc src/bridge.c \
    /flac-build/flac/build/src/libFLAC/libFLAC.a \
    -I/flac-build/flac/include \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s SINGLE_FILE=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ENVIRONMENT=web,worker \
    -s FILESYSTEM=0 \
    -s MALLOC=emmalloc \
    -s SUPPORT_LONGJMP=0 \
    -s EXPORTED_RUNTIME_METHODS=cwrap,HEAPU8 \
    -s EXPORTED_FUNCTIONS=_malloc,_free \
    -msimd128 \
    -flto \
    -Oz \
    -o build/flac.js
'

docker run --rm -v "$workspace:/workspace" -v "$build_dir:/flac-build" node:22-slim sh -eu -c '
  mkdir -p /tmp/foxconvert-build
  cp /workspace/tools/foxconvert/package.json /workspace/tools/foxconvert/package-lock.json \
    /workspace/tools/foxconvert/engine-entry.js /workspace/tools/foxconvert/build-flac-encoder.mjs \
    /tmp/foxconvert-build/
  cd /tmp/foxconvert-build
  npm ci
  node build-flac-encoder.mjs /flac-build/mediabunny flac-encoder.custom.mjs
  npm run build
  cp dist/mediabunny.bundle.js /workspace/static/foxconvert/mediabunny.bundle.js
'
