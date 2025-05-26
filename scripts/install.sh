#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd -P)/.."

CURL_IMPERSONATE_VERSION="1.0.0"

# no action required if binding exists
if [[ -f lib/binding/node_libcurl_ja3.node ]]; then
  exit
fi

fetch_curl_impersonate_source() {
  if [[ -f deps/curl-impersonate/configure ]]; then
    return
  fi
  if [[ -d .git ]] && [[ -f .gitmodules ]]; then
    git submodule update --init --recursive
  else
    [[ -d deps ]] || mkdir deps
    cd deps
    curl -LO "https://github.com/lexiforest/curl-impersonate/archive/refs/tags/v${CURL_IMPERSONATE_VERSION}.tar.gz"
    tar xf "v${CURL_IMPERSONATE_VERSION}.tar.gz"
    mv "curl-impersonate-${CURL_IMPERSONATE_VERSION}" curl-impersonate
    rm -f "v${CURL_IMPERSONATE_VERSION}.tar.gz"
    cd - >/dev/null
  fi
}

build_curl_impersonate() {
  if [[ -f deps/curl-impersonate/build/lib/libcurl-impersonate-chrome.a ]]; then
    return
  fi
  scripts/build.sh
}

build_from_source() {
  fetch_curl_impersonate_source
  build_curl_impersonate
  npx node-pre-gyp rebuild
}

if [[ "${npm_config_build_from_source:-}" == "true" ]] \
    || ! npx node-pre-gyp install \
; then
  # fallback to build from source if node-pre-gyp install fails
  build_from_source
fi
