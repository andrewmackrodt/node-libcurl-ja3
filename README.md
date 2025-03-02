# node-libcurl-ja3

[![NPM version][npm-image]][npm-url]
[![license][license-image]][license-url]

[npm-image]:https://img.shields.io/npm/v/node-libcurl-ja3.svg?style=flat-square
[npm-url]:https://www.npmjs.org/package/node-libcurl-ja3
[license-image]:https://img.shields.io/npm/l/node-libcurl-ja3?style=flat-square
[license-url]:https://raw.githubusercontent.com/andrewmackrodt/node-libcurl-ja3/develop/LICENSE

## Disclaimer

This is a fork of [node-libcurl](https://github.com/JCMais/node-libcurl) using patches from [lexiforest/curl-impersonate](https://github.com/lexiforest/curl-impersonate)
to impersonate the four major browsers: Chrome, Edge, Safari and Firefox. `node-libcurl-ja3` is able to
perform TLS and HTTP handshakes that are identical to that of a real browser.

**Only the following platforms are supported:**
- Linux 64-bit (glibc based)
- macOS Apple Silicon (M1+)

Prebuilt binaries are provided for Node.js `20` and `22`. Any other version has not been tested and will need an
environment capable of building the native module. Refer to [Important Notes on Prebuilt Binaries / Direct Installation](#important-notes-on-prebuilt-binaries--direct-installation)
for a list of required system packages.

Although the library is named `node-libcurl-ja3`, it **also supports** `http2` and `ja4` impersonation (e.g. Akamai).

## Table of Contents

- [Quick Start](#quick-start)
  - [Install](#install)
  - [Impersonate Usage](#impersonate-usage)
    - [Simple Impersonate Request - Async / Await using curly](#simple-impersonate-request---async--await-using-curly)
    - [Simple Impersonate Request - Using Curl class](#simple-impersonate-request---using-curl-class)
  - [Simple Request - Async / Await using curly](#simple-request---async--await-using-curly)
  - [Simple Request - Using Curl class](#simple-request---using-curl-class)
  - [Setting HTTP headers](#setting-http-headers)
  - [Form Submission (Content-Type: application/x-www-form-urlencoded)](#form-submission-content-type-applicationx-www-form-urlencoded)
  - [MultiPart Upload / HttpPost libcurl Option (Content-Type: multipart/form-data)](#multipart-upload--httppost-libcurl-option-content-type-multipartform-data)
  - [Binary Data](#binary-data)
- [API](#api)
- [Special Notes](#special-notes)
  - [`READFUNCTION` option](#readfunction-option)
- [Common Issues](#common-issues)
- [Benchmarks](#benchmarks)
- [Detailed Installation](#detailed-installation)
  - [Important Notes on Prebuilt Binaries / Direct Installation](#important-notes-on-prebuilt-binaries--direct-installation)
    - [Missing Packages](#missing-packages)
  - [Building on Linux](#building-on-linux)
  - [Building on macOS](#building-on-macos)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

## Quick Start

- This library cannot be used in a browser, it depends on native code.
- There is no worker threads support at the moment. See [#169](https://github.com/JCMais/node-libcurl/issues/169)

### Install
```shell
npm i node-libcurl-ja3 --save
```
or
```shell
yarn add node-libcurl-ja3
```

### Impersonate Usage

The following browser fingerprints are pre-configured:

- Chrome 134
- Edge 134
- Firefox 136.0
- Safari 18.3

To learn how to configure custom impersonation options, refer to the folder [lib/impersonate/browser](./lib/impersonate/browser).

For brevity, this section covers a single example for creating impersonate instances using the curly API and Curl class.
To use impersonation with the examples following this section, adapt them to use either:
- `impersonate` in place of `curly`
- `Curl.impersonate` in place of `new Curl`

#### Simple Impersonate Request - Async / Await using curly
```javascript
const { Browser, impersonate } = require('node-libcurl-ja3');

const curly = impersonate(Browser.Chrome);
const { data } = await curly.get('https://tls.browserleaks.com/json');

console.log(data.ja3n_hash); // 8e19337e7524d2573be54efb2b0784c9
```

#### Simple Impersonate Request - Using Curl class
```javascript
const { Browser, Curl } = require('node-libcurl-ja3');

const curl = Curl.impersonate(Browser.Chrome);

curl.setOpt('URL', 'tls.browserleaks.com/json');
curl.setOpt('FOLLOWLOCATION', true);

curl.on('end', function (statusCode, data, headers) {
  console.info(statusCode);
  console.info('---');
  console.info(data.length);
  console.info('---');
  console.info(this.getInfo('TOTAL_TIME'));

  this.close();
});

curl.on('error', curl.close.bind(curl));
curl.perform();
```

### Simple Request - Async / Await using curly

**this API is experimental and is subject to changes without a major version bump**

```javascript
const { curly } = require('node-libcurl-ja3');

const { statusCode, data, headers } = await curly.get('http://www.google.com')
```

Any option can be passed using their `FULLNAME` or a `lowerPascalCase` format:
```javascript
const querystring = require('querystring');
const { curly } = require('node-libcurl-ja3');

const { statusCode, data, headers } = await curly.post('http://httpbin.com/post', {
  postFields: querystring.stringify({
    field: 'value',
  }),
  // can use `postFields` or `POSTFIELDS`
})
```

JSON POST example:
```javascript
const { curly } = require('node-libcurl-ja3')
const { data } = await curly.post('http://httpbin.com/post', {
  postFields: JSON.stringify({ field: 'value' }),
  httpHeader: [
    'Content-Type: application/json',
    'Accept: application/json'
  ],
})

console.log(data)
```

### Simple Request - Using Curl class
```javascript
const { Curl } = require('node-libcurl-ja3');

const curl = new Curl();

curl.setOpt('URL', 'www.google.com');
curl.setOpt('FOLLOWLOCATION', true);

curl.on('end', function (statusCode, data, headers) {
  console.info(statusCode);
  console.info('---');
  console.info(data.length);
  console.info('---');
  console.info(this.getInfo( 'TOTAL_TIME'));
  
  this.close();
});

curl.on('error', curl.close.bind(curl));
curl.perform();
```

### Setting HTTP headers

Pass an array of strings specifying headers
```javascript
curl.setOpt(Curl.option.HTTPHEADER,
  ['Content-Type: application/x-amz-json-1.1'])
```

### Form Submission (Content-Type: application/x-www-form-urlencoded)
```javascript
const querystring = require('querystring');
const { Curl } = require('node-libcurl-ja3');

const curl = new Curl();
const close = curl.close.bind(curl);

curl.setOpt(Curl.option.URL, '127.0.0.1/upload');
curl.setOpt(Curl.option.POST, true)
curl.setOpt(Curl.option.POSTFIELDS, querystring.stringify({
  field: 'value',
}));

curl.on('end', close);
curl.on('error', close);
```

### MultiPart Upload / HttpPost libcurl Option (Content-Type: multipart/form-data)

```javascript
const { Curl } = require('node-libcurl-ja3');

const curl = new Curl();
const close = curl.close.bind(curl);

curl.setOpt(Curl.option.URL, '127.0.0.1/upload.php');
curl.setOpt(Curl.option.HTTPPOST, [
    { name: 'input-name', file: '/file/path', type: 'text/html' },
    { name: 'input-name2', contents: 'field-contents' }
]);

curl.on('end', close);
curl.on('error', close);
```

### Binary Data

When requesting binary data make sure to do one of these:
- Pass your own `WRITEFUNCTION` (https://curl.haxx.se/libcurl/c/CURLOPT_WRITEFUNCTION.html):
```javascript
curl.setOpt('WRITEFUNCTION', (buffer, size, nmemb) => {
  // something
})
```
- Enable one of the following flags:
```javascript
curl.enable(CurlFeature.NoDataParsing)
// or
curl.enable(CurlFeature.Raw)
```

The reasoning behind this is that by default, the `Curl` instance will try to decode the received data and headers to utf8 strings, as can be seen here: https://github.com/JCMais/node-libcurl/blob/b55b13529c9d11fdcdd7959137d8030b39427800/lib/Curl.ts#L391

For more examples check the [examples folder](./examples).

## API

This library provides Typescript type definitions.

Almost all [CURL options](https://curl.haxx.se/libcurl/c/curl_easy_setopt.html) are supported, if you pass one that is not, an error will be thrown.

For more usage examples check the [examples folder](./examples).

## Special Notes

### `READFUNCTION` option

The buffer passed as first parameter to the callback set with the [`READFUNCTION`](https://curl.haxx.se/libcurl/c/CURLOPT_READFUNCTION.html) option is initialized with the size libcurl is using in their upload buffer (which can be set with [`UPLOAD_BUFFERSIZE`](https://curl.haxx.se/libcurl/c/CURLOPT_UPLOAD_BUFFERSIZE.html)), this is initialized using `node::Buffer::Data(buf);` which is basically the same than `Buffer#allocUnsafe` and therefore, it has all the implications as to its correct usage: https://nodejs.org/pt-br/docs/guides/buffer-constructor-deprecation/#regarding-buffer-allocunsafe

So, be careful, make sure to return **exactly** the amount of data you have written to the buffer on this callback. Only that specific amount is going to be copied and handed over to libcurl.

## Common Issues

See [COMMON_ISSUES.md](./COMMON_ISSUES.md)

## Benchmarks

See [./benchmark](./benchmark)

## Detailed Installation

The latest version of this package has prebuilt binaries (thanks to [node-pre-gyp](https://github.com/mapbox/node-pre-gyp/)) 
 available for:

- Node.js: Latest two versions on active LTS (see https://github.com/nodejs/Release)

And on the following platforms:
- Linux 64-bit (glibc based)
- macOS Apple Silicon (M1+)

Installing with `yarn add node-libcurl-ja3` or `npm install node-libcurl-ja3` should download a prebuilt binary and no compilation will be needed.

The prebuilt binary is statically built with the following library versions, features and protocols:
```
Versions: libcurl/8.7.0-DEV BoringSSL zlib/1.3 brotli/1.1.0 zstd/1.5.6 nghttp2/1.63.0
Protocols: dict file ftp ftps gopher gophers http https imap imaps ipfs ipns mqtt pop3 pop3s rtsp smb smbs smtp smtps telnet tftp ws wss
Features: alt-svc AsynchDNS brotli HSTS HTTP2 HTTPS-proxy IPv6 Largefile libz NTLM SSL threadsafe UnixSockets zstd
```

If there is no prebuilt binary available that matches your system, or if the installation fails, then you will need an environment capable of compiling Node.js addons, which means:
- [python 3.x](https://www.python.org/downloads/) installed
- updated C++ compiler able to compile C++17.

If you don't want to use the prebuilt binary even if it works on your system, you can pass a flag when installing:

**With npm:**

```sh
npm install node-libcurl-ja3 --build-from-source
```

**With yarn:**

```sh
npm_config_build_from_source=true yarn add node-libcurl-ja3
```

### Important Notes on Prebuilt Binaries / Direct Installation

The built binaries are statically linked with `BoringSSL`, `brotli`, `nghttp2`, `zlib` and `zstd`. 

#### Missing Packages

The built binaries do not have support for `GSASL`, `GSS-API`, `HTTP3`, `IDN`, `LDAP`, `LDAPS`, `PSL`, `RTMP`, `SPNEGO`, `SSH`, `SSPI` or `TLS-SRP`.

### Building on Linux

If you are on a debian based system, install the required dependencies by running:
```bash
sudo apt install -qqy autoconf automake build-essential cmake curl libtool ninja-build pkg-config
```

Users for other distributions will need to find the equivalent packages and install via your package manager.

### Building on macOS

On macOS you must have:
- macOS >= 11.6 (Big Sur)
- Xcode Command Line Tools
- [Homebrew](https://brew.sh/)
- Bash >= 5.0 (unconfirmed)

You can check if you have Xcode Command Line Tools be running:
```sh
xcode-select -p
```
It should return their path, in case it returns nothing, you must install it by running:
```sh
xcode-select --install
```

Finally, install the remaining packages using homebrew:
```sh
brew install automake bash cmake libtool make meson ninja
```

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md)

## Acknowledgments
- [JCMais/node-libcurl][a1] — provides the node libcurl bindings upon which this fork is created from.
- [lexiforest/curl-impersonate][a2] — provides patches to add impersonate behaviour to curl.
- [galihrivanto/node-libcurli][a3] — a similar fork based upon an older version of node-libcurl and libcurl-impersonate.
- [Ossianaa/node-libcurl][a4] — a similar library which provided inspiration for setting fingerprints from JA3.

[a1]: https://github.com/JCMais/node-libcurl
[a2]: https://github.com/lexiforest/curl-impersonate
[a3]: https://github.com/galihrivanto/node-libcurli
[a4]: https://github.com/Ossianaa/node-libcurl
