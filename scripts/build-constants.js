const fs = require('fs')
const path = require('path')
const { inspect } = require('util')
const { execSync } = require('child_process')

const { optionKindMap, optionKindValueMap } = require('./data/options')

const {
  createConstantsFile,
  getDescriptionCommentForOption,
} = require('./utils/createConstantsFile')
const { createSetOptOverloads } = require('./utils/createSetOptOverloads')
const { curlOptionsBlacklist } = require('./utils/curlOptionsBlacklist')
const { multiOptionsBlacklist } = require('./utils/multiOptionsBlacklist')
const { retrieveConstantList } = require('./utils/retrieveConstantList')

const run = async () => {
  const curlOptionsFilePath = path.resolve(
    __dirname,
    '../lib/generated/CurlOption.ts',
  )

  const curlInfoFilePath = path.resolve(
    __dirname,
    '../lib/generated/CurlInfo.ts',
  )

  const multiOptionFilePath = path.resolve(
    __dirname,
    '../lib/generated/MultiOption.ts',
  )

  const allowedCurlOptions = await retrieveConstantList({
    url: 'https://curl.se/libcurl/c/curl_easy_setopt.html',
    constantPrefix: 'CURLOPT_',
    blacklist: curlOptionsBlacklist,
  })

  allowedCurlOptions.push(
    ...[
      {
        constantOriginal: 'CURLOPT_HTTPBASEHEADER',
        constantName: 'HTTPBASEHEADER',
        constantNameCamelCase: 'httpbaseheader',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L190',
      },
      {
        constantOriginal: 'CURLOPT_SSL_SIG_HASH_ALGS',
        constantName: 'SSL_SIG_HASH_ALGS',
        constantNameCamelCase: 'sslSigHashAlgs',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L194',
      },
      {
        constantOriginal: 'CURLOPT_SSL_ENABLE_ALPS',
        constantName: 'SSL_ENABLE_ALPS',
        constantNameCamelCase: 'sslEnableAlps',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L200',
      },
      {
        constantOriginal: 'CURLOPT_SSL_CERT_COMPRESSION',
        constantName: 'SSL_CERT_COMPRESSION',
        constantNameCamelCase: 'sslCertCompression',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L206',
      },
      {
        constantOriginal: 'CURLOPT_SSL_ENABLE_TICKET',
        constantName: 'SSL_ENABLE_TICKET',
        constantNameCamelCase: 'sslEnableTicket',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L209',
      },
      {
        constantOriginal: 'CURLOPT_HTTP2_PSEUDO_HEADERS_ORDER',
        constantName: 'HTTP2_PSEUDO_HEADERS_ORDER',
        constantNameCamelCase: 'http2PseudoHeadersOrder',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L218',
      },
      {
        constantOriginal: 'CURLOPT_HTTP2_SETTINGS',
        constantName: 'HTTP2_SETTINGS',
        constantNameCamelCase: 'http2Settings',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L224',
      },
      {
        constantOriginal: 'CURLOPT_SSL_PERMUTE_EXTENSIONS',
        constantName: 'SSL_PERMUTE_EXTENSIONS',
        constantNameCamelCase: 'sslPermuteExtensions',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L230',
      },
      {
        constantOriginal: 'CURLOPT_HTTP2_WINDOW_UPDATE',
        constantName: 'HTTP2_WINDOW_UPDATE',
        constantNameCamelCase: 'http2WindowUpdate',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L236',
      },
      {
        constantOriginal: 'CURLOPT_HTTP2_STREAMS',
        constantName: 'HTTP2_STREAMS',
        constantNameCamelCase: 'http2Streams',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L247',
      },
      {
        constantOriginal: 'CURLOPT_TLS_GREASE',
        constantName: 'TLS_GREASE',
        constantNameCamelCase: 'tlsGrease',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L250',
      },
      {
        constantOriginal: 'CURLOPT_TLS_EXTENSION_ORDER',
        constantName: 'TLS_EXTENSION_ORDER',
        constantNameCamelCase: 'tlsExtensionOrder',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L253',
      },
      {
        constantOriginal: 'CURLOPT_STREAM_EXCLUSIVE',
        constantName: 'STREAM_EXCLUSIVE',
        constantNameCamelCase: 'streamExclusive',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L256',
      },
      {
        constantOriginal: 'CURLOPT_TLS_KEY_USAGE_NO_CHECK',
        constantName: 'TLS_KEY_USAGE_NO_CHECK',
        constantNameCamelCase: 'tlsKeyUsageNoCheck',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L259',
      },
      {
        constantOriginal: 'CURLOPT_TLS_SIGNED_CERT_TIMESTAMPS',
        constantName: 'TLS_SIGNED_CERT_TIMESTAMPS',
        constantNameCamelCase: 'tlsSignedCertTimestamps',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L262',
      },
      {
        constantOriginal: 'CURLOPT_TLS_STATUS_REQUEST',
        constantName: 'TLS_STATUS_REQUEST',
        constantNameCamelCase: 'tlsStatusRequest',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L265',
      },
      {
        constantOriginal: 'CURLOPT_TLS_DELEGATED_CREDENTIALS',
        constantName: 'TLS_DELEGATED_CREDENTIALS',
        constantNameCamelCase: 'tlsDelegatedCredentials',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L268',
      },
      {
        constantOriginal: 'CURLOPT_TLS_RECORD_SIZE_LIMIT',
        constantName: 'TLS_RECORD_SIZE_LIMIT',
        constantNameCamelCase: 'tlsRecordSizeLimit',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L271',
      },
      {
        constantOriginal: 'CURLOPT_TLS_KEY_SHARES_LIMIT',
        constantName: 'TLS_KEY_SHARES_LIMIT',
        constantNameCamelCase: 'tlsKeySharesLimit',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L274',
      },
      {
        constantOriginal: 'CURLOPT_TLS_USE_NEW_ALPS_CODEPOINT',
        constantName: 'TLS_USE_NEW_ALPS_CODEPOINT',
        constantNameCamelCase: 'tlsUseNewAlpsCodepoint',
        description: 'curl-impersonate',
        url: 'https://github.com/lexiforest/curl-impersonate/blob/a9729a48134437e90dd450c760495c0c3ea8d6a4/chrome/patches/curl-impersonate.patch#L277',
      },
    ],
  )

  await createConstantsFile({
    constants: allowedCurlOptions,
    variableName: 'CurlOption',
    filePath: curlOptionsFilePath,
    shouldGenerateCamelCaseMap: true,
    extraHeaderText: `
      import { CurlChunk } from '../enum/CurlChunk'
      import { CurlFnMatchFunc } from '../enum/CurlFnMatchFunc'
      import { CurlFtpMethod } from '../enum/CurlFtpMethod'
      import { CurlFtpSsl } from '../enum/CurlFtpSsl'
      import { CurlGssApi } from '../enum/CurlGssApi'
      import { CurlHeader } from '../enum/CurlHeader'
      import { CurlHsts, CurlHstsCacheCount, CurlHstsCacheEntry } from '../enum/CurlHsts'
      import { CurlHttpVersion } from '../enum/CurlHttpVersion'
      import { CurlInfoDebug } from '../enum/CurlInfoDebug'
      import { CurlIpResolve } from '../enum/CurlIpResolve'
      import { CurlNetrc } from '../enum/CurlNetrc'
      import { CurlPreReqFunc } from '../enum/CurlPreReqFunc'
      import { CurlProgressFunc } from '../enum/CurlProgressFunc'
      import { CurlProtocol } from '../enum/CurlProtocol'
      import { CurlProxy } from '../enum/CurlProxy'
      import { CurlRtspRequest } from '../enum/CurlRtspRequest'
      import { CurlSshAuth } from '../enum/CurlSshAuth'
      import { CurlSslOpt } from '../enum/CurlSslOpt'
      import { CurlSslVersion } from '../enum/CurlSslVersion'
      import { CurlTimeCond } from '../enum/CurlTimeCond'
      import { CurlUseSsl } from '../enum/CurlUseSsl'
      import { EasyNativeBinding } from "../types/EasyNativeBinding"
      import { Share } from "../Share"
    `,
  })

  const allowedCurlInfos = await retrieveConstantList({
    url: 'https://curl.se/libcurl/c/curl_easy_getinfo.html',
    constantPrefix: 'CURLINFO_',
    blacklist: [
      // time constants at the bottom
      'NAMELOOKUP',
      'CONNECT',
      'APPCONNECT',
      'PRETRANSFER',
      'STARTTRANSFER',
      'TOTAL',
      'REDIRECT',
    ],
  })
  await createConstantsFile({
    constants: allowedCurlInfos,
    variableName: 'CurlInfo',
    filePath: curlInfoFilePath,
  })

  const allowedMultiOptions = await retrieveConstantList({
    url: 'https://curl.se/libcurl/c/curl_multi_setopt.html',
    constantPrefix: 'CURLMOPT_',
    blacklist: multiOptionsBlacklist,
  })
  await createConstantsFile({
    constants: allowedMultiOptions,
    variableName: 'MultiOption',
    filePath: multiOptionFilePath,
  })

  // add extra types to CurlOption
  const union = (arr) => arr.map((i) => inspect(i)).join(' | ')

  let optionsValueTypeData = [
    'import { FileInfo, HttpPostField } from "../types"',
    `export type DataCallbackOptions = ${union(optionKindMap.dataCallback)}`,
    `export type ProgressCallbackOptions = ${union(
      optionKindMap.progressCallback,
    )}`,
    `export type StringListOptions = ${union(optionKindMap.stringList)}`,
    `export type BlobOptions = ${union(optionKindMap.blob)}`,
    `export type SpecificOptions = DataCallbackOptions | ProgressCallbackOptions | StringListOptions | BlobOptions | ${union(
      optionKindMap.other,
    )}`,
  ]

  // Now we must create the type for the curl.<http-verb> options param
  optionsValueTypeData = [
    ...optionsValueTypeData,
    `
    /**
     * @public
     */
    export type CurlOptionValueType = {`,
  ]

  for (const option of allowedCurlOptions) {
    const optionDescription = getDescriptionCommentForOption(option)

    const optionValueType =
      Object.entries(optionKindMap).reduce((acc, [kind, kindOptions]) => {
        if (acc) return acc

        return (
          kindOptions.includes(option.constantName) &&
          (optionKindValueMap[kind] || optionKindValueMap[option.constantName])
        )
      }, null) || optionKindValueMap._

    optionsValueTypeData = [
      ...optionsValueTypeData,
      `${optionDescription}${option.constantName}?: ${optionValueType} | null`,
      `${optionDescription}${option.constantNameCamelCase}?: ${optionValueType} | null`,
    ]
  }

  optionsValueTypeData = [...optionsValueTypeData, '}']

  fs.writeFileSync(curlOptionsFilePath, optionsValueTypeData.join('\n'), {
    flag: 'a+',
  })

  const easyBindingFilePath = path.resolve(
    __dirname,
    '../lib/types/EasyNativeBinding.ts',
  )
  const curlClassFilePath = path.resolve(__dirname, '../lib/Curl.ts')

  createSetOptOverloads(easyBindingFilePath)
  createSetOptOverloads(curlClassFilePath, 'this')

  execSync(
    `yarn prettier ${curlOptionsFilePath} ${curlInfoFilePath} ${multiOptionFilePath} ${easyBindingFilePath} ${curlClassFilePath}`,
  )
}

run()
