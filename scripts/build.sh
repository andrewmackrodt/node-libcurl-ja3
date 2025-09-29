#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd -P)"

# Configuration variables
CURL_IMPERSONATE_DIR="$(dirname "$PWD")/deps/curl-impersonate"
BUILD_DIR="$CURL_IMPERSONATE_DIR/build"
SRC_ARTIFACTS_FILE="$BUILD_DIR/curl-impersonate.src.tar.gz"
BUILD_ARTIFACTS_FILE="$BUILD_DIR/curl-impersonate.tar.gz"
OS=$(uname -s)

BORINGSSL_COMMIT="23768dca563c4e62d48bb3675e49e34955dced12"
BORINGSSL_SRC_DIR="$BUILD_DIR/boringssl-$BORINGSSL_COMMIT"

BROTLI_VERSION="1.1.0"
BROTLI_SRC_DIR="$BUILD_DIR/brotli-$BROTLI_VERSION"
BROTLI_OUT_DIR="$BROTLI_SRC_DIR/out/installed"

CURL_VERSION="8_7_1"
CURL_SRC_DIR="$BUILD_DIR/curl-$CURL_VERSION"
CURL_OUT_DIR="$BUILD_DIR/curl-impersonate"

NGHTTP2_VERSION="1.63.0"
NGHTTP2_SRC_DIR="$BUILD_DIR/nghttp2-$NGHTTP2_VERSION"
NGHTTP2_OUT_DIR="$NGHTTP2_SRC_DIR/installed"

ZLIB_VERSION="1.3"
ZLIB_SRC_DIR="$BUILD_DIR/zlib-$ZLIB_VERSION"
ZLIB_OUT_DIR="$ZLIB_SRC_DIR/installed"

ZSTD_VERSION="1.5.6"
ZSTD_SRC_DIR="$BUILD_DIR/zstd-$ZSTD_VERSION"
ZSTD_OUT_DIR="$ZSTD_SRC_DIR/installed"

# Determine OS-specific variables
if [ "$OS" = "Linux" ]; then
  MAKE="make"
  HOST="x86_64-linux-gnu"
  CPP_LIB="stdc++"
elif [ "$OS" = "Darwin" ]; then
  MAKE="gmake"
  HOST="arm64-apple-darwin"
  CPP_LIB="c++"
else
  echo "Unsupported operating system: $OS"
  exit 1
fi

# Build BoringSSL
build_boringssl() {
  $MAKE chrome-build
}

# Build zlib
build_zlib() {
  if [[ ! -d "$ZLIB_SRC_DIR" ]]; then
    curl -LO "https://github.com/madler/zlib/archive/refs/tags/v$ZLIB_VERSION.tar.gz"
    tar xf "v$ZLIB_VERSION.tar.gz"
  fi
  cd "$ZLIB_SRC_DIR"
  CHOST=$HOST CFLAGS="-fPIC" ./configure --prefix="$ZLIB_OUT_DIR"
  make
  make install
  rm -f "$ZLIB_OUT_DIR/lib/libz.so"
  cd ..
}

# Build zstd
build_zstd() {
  if [[ ! -d "$ZSTD_SRC_DIR" ]]; then
    curl -LO "https://github.com/facebook/zstd/releases/download/v$ZSTD_VERSION/zstd-$ZSTD_VERSION.tar.gz"
    tar xf "zstd-$ZSTD_VERSION.tar.gz"
  fi
  cd "$ZSTD_SRC_DIR"
  if [[ "$OS" == "Linux" ]]; then
    make
    make install PREFIX="$ZSTD_OUT_DIR"
  else
    meson setup -Dbin_programs=false -Dstatic_runtime=true -Ddefault_library=static --prefix="$ZSTD_OUT_DIR" --reconfigure build/meson out
    ninja -C out
    ninja -C out install
  fi
  rm -f "$ZSTD_OUT_DIR/lib/libzstd.so"
  cd ..
}

# Configure
configure_build() {
  if [[ ! -f "$CURL_IMPERSONATE_DIR/Makefile.in.bak" ]]; then
    cp "$CURL_IMPERSONATE_DIR/Makefile.in" "$CURL_IMPERSONATE_DIR/Makefile.in.bak"
  fi
  local extra_config_flags
  declare -a extra_config_flags=(
    --without-gssapi
    --without-libidn2
    --disable-ldap
    --disable-ldaps
    --without-libgsasl
    --without-libpsl
    --without-librtmp
    --without-libssh
    --without-libssh2
    --disable-sspi
    --disable-tls-srp
  )
  cat "$CURL_IMPERSONATE_DIR/Makefile.in.bak" \
    | sed "s/-lc++/-l$CPP_LIB/" \
    | sed "s/-stdlib=libc++/-stdlib=lib$CPP_LIB/" \
    | sed -E 's/(add_libs=.+)/\1\n\t  config_flags="$$config_flags '"${extra_config_flags[*]}"'"; \\/' \
    | tee "$CURL_IMPERSONATE_DIR/Makefile.in" >/dev/null
  "$CURL_IMPERSONATE_DIR/configure" --prefix="$CURL_OUT_DIR" \
    --enable-static \
    --with-zlib="$ZLIB_OUT_DIR" \
    --with-zstd="$ZSTD_OUT_DIR"
  mv "$CURL_IMPERSONATE_DIR/Makefile.in.bak" "$CURL_IMPERSONATE_DIR/Makefile.in"
}

# Build Curl Impersonate
build_curl_impersonate() {
  $MAKE chrome-build
  $MAKE chrome-checkbuild
  $MAKE chrome-install

  # copy curl include dir
  mkdir -p "$CURL_OUT_DIR/include"
  cp -r "$CURL_SRC_DIR/include/curl" "$CURL_OUT_DIR/include"
  rm -f "$CURL_OUT_DIR/include/curl/".* 2>/dev/null || true
}

# Copy the build sources to store as a ci artifact
archive_build_sources() {
  local tmpdir
  tmpdir=$(mktemp -d)
  untar() {
    tar xf "$1" -C "$tmpdir/curl-impersonate/build"
  }
  mkdir -p "$tmpdir/curl-impersonate/build"
  git --work-tree="$tmpdir/curl-impersonate" checkout -fq HEAD
  unzip -q "boringssl-$BORINGSSL_COMMIT.zip" -d "$tmpdir/curl-impersonate/build"
  untar "brotli-$BROTLI_VERSION.tar.gz"
  untar "curl-$CURL_VERSION.tar.gz"
  untar "nghttp2-$NGHTTP2_VERSION.tar.bz2"
  untar "zlib-$ZLIB_VERSION.tar.gz"
  untar "zstd-$ZSTD_VERSION.tar.gz"
  GZ_OPT=-9 tar zcf "$SRC_ARTIFACTS_FILE" -C "$tmpdir" curl-impersonate
  rm -rf "$tmpdir"
}

# Copy the build output(s) to store as a ci artifact
archive_build_outputs() {
  relpath() {
    echo "${1:$((${#CURL_IMPERSONATE_DIR}+1))}"
  }
  tar zcf "$BUILD_ARTIFACTS_FILE" --exclude .gitignore -C .. \
    "$(relpath "$BORINGSSL_SRC_DIR/include")" \
    "$(relpath "$BORINGSSL_SRC_DIR/lib")" \
    "$(relpath "$BROTLI_OUT_DIR/")" \
    "$(relpath "$CURL_OUT_DIR/")" \
    "$(relpath "$NGHTTP2_OUT_DIR/")" \
    "$(relpath "$ZLIB_OUT_DIR/")" \
    "$(relpath "$ZSTD_OUT_DIR/")"
}

# Main execution
main() {
  echo "Starting curl-impersonate build process..."

  # Create install directory
  mkdir -p "$BUILD_DIR"
  cd "$BUILD_DIR"

  # Build zlib
  echo "Building zlib..."
  build_zlib

  # Build zstd
  echo "Building zstd..."
  build_zstd

  # Configure
  echo "Configuring build..."
  configure_build

  # Build boringssl
  echo "Building boringssl..."
  build_boringssl

  # Build curl impersonate
  echo "Building Curl Impersonate..."
  build_curl_impersonate

  # Copy build artifacts
  if [[ "${CI:-}" == "true" ]]; then
    if [[ "${ARCHIVE_SOURCES:-}" == "true" ]]; then
      echo "Archiving build sources..."
      archive_build_sources
    fi

    echo "Archiving build outputs..."
    archive_build_outputs
  fi

  echo "Build process completed successfully!"
}

main
