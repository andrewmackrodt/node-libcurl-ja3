#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd -P)"

# Configuration variables
CURL_IMPERSONATE_DIR="$(dirname "$PWD")/deps/curl-impersonate"
BUILD_DIR="$CURL_IMPERSONATE_DIR/build"
SRC_ARTIFACTS_FILE="$BUILD_DIR/curl-impersonate.src.tar.gz"
BUILD_ARTIFACTS_FILE="$BUILD_DIR/curl-impersonate.tar.gz"
OS=$(uname -s)

CURL_VERSION="8_13_0"
CURL_SRC_DIR="$BUILD_DIR/curl-$CURL_VERSION"
CURL_OUT_DIR="$BUILD_DIR/curl-impersonate"

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
    --enable-static
  mv "$CURL_IMPERSONATE_DIR/Makefile.in.bak" "$CURL_IMPERSONATE_DIR/Makefile.in"
}

# Build Curl Impersonate
build_curl_impersonate() {
  $MAKE build
  $MAKE checkbuild
  $MAKE install

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

  # Configure
  echo "Configuring build..."
  configure_build

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
