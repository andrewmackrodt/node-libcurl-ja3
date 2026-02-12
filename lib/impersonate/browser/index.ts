import { CurlSslVersion } from '../../enum/CurlSslVersion'
import type { CurlOptionValueType } from '../../generated/CurlOption'
import type { ImpersonateConfig } from '../types'
import { CHROME_BROWSER_CONFIGS, ChromeBrowser } from './chrome'
import { EDGE_BROWSER_CONFIGS, EdgeBrowser } from './edge'
import { FIREFOX_BROWSER_CONFIGS, FirefoxBrowser } from './firefox'
import { SAFARI_BROWSER_CONFIGS, SafariBrowser } from './safari'

export { getChromeConfig } from './chrome'
export { getEdgeConfig } from './edge'
export { getFirefoxConfig } from './firefox'
export { getSafariConfig } from './safari'

export const Browser = {
  ...ChromeBrowser,
  ...EdgeBrowser,
  ...FirefoxBrowser,
  ...SafariBrowser,
}

export type Browser =
  | ChromeBrowser
  | EdgeBrowser
  | FirefoxBrowser
  | SafariBrowser

export const BROWSER_CONFIGS = {
  ...CHROME_BROWSER_CONFIGS,
  ...EDGE_BROWSER_CONFIGS,
  ...FIREFOX_BROWSER_CONFIGS,
  ...SAFARI_BROWSER_CONFIGS,
}

export function getCurlOptionsFromBrowser(
  browser: Browser,
): CurlOptionValueType {
  const config = BROWSER_CONFIGS[browser]

  if (!config) {
    throw new Error(`Unsupported browser: ${browser}`)
  }

  return getCurlOptionsFromBrowserConfig(config)
}

export function getCurlOptionsFromBrowserConfig(
  config: ImpersonateConfig,
): CurlOptionValueType {
  const curlOptions: CurlOptionValueType = { TLS_STATUS_REQUEST: 1 }

  const headersList = Object.entries(config.headers).map(([key, value]) => {
    if (key.toLowerCase() === 'user-agent') {
      curlOptions.USERAGENT = value
    }
    return `${key}: ${value}`
  })

  curlOptions.HTTPBASEHEADER = headersList

  if (config.tlsVersion) {
    let tlsVersion = config.tlsVersion
    // setting tls as 1.3 causes fingerprint mismatch so force 1.2
    if (tlsVersion === CurlSslVersion.TlsV1_3) {
      tlsVersion = CurlSslVersion.TlsV1_2
    }
    curlOptions.SSLVERSION = tlsVersion
  }

  if (config.ciphers) {
    curlOptions.SSL_CIPHER_LIST = config.ciphers
  }

  if (config.curves) {
    curlOptions.SSL_EC_CURVES = config.curves
  }

  if (config.signatureHashes) {
    curlOptions.SSL_SIG_HASH_ALGS = config.signatureHashes
  }

  if (config.compressed) {
    const acceptEncoding = headersList
      .find((header) => header.toLowerCase().startsWith('accept-encoding:'))
      ?.split(':', 2)[1]
      .trim()

    curlOptions.ACCEPT_ENCODING = acceptEncoding || 'gzip, deflate, br, zstd'
  }

  if (config.httpVersion) {
    curlOptions.HTTP_VERSION = config.httpVersion
  }

  if (config.http2PseudoHeadersOrder) {
    curlOptions.HTTP2_PSEUDO_HEADERS_ORDER = config.http2PseudoHeadersOrder
  }

  if (config.http2Settings) {
    curlOptions.HTTP2_SETTINGS = config.http2Settings
  }

  if (typeof config.http2StreamExclusive === 'number') {
    curlOptions.STREAM_EXCLUSIVE = config.http2StreamExclusive
  }

  // CURLOPT_STREAM_WEIGHT is not supported (issue in node bindings?)
  // if (typeof config.http2StreamWeight === 'number') {
  //   curlOptions.STREAM_WEIGHT = config.http2StreamWeight;
  // }

  if (typeof config.http2WindowUpdate === 'number') {
    curlOptions.HTTP2_WINDOW_UPDATE = config.http2WindowUpdate
  }

  if (typeof config.alps === 'boolean') {
    curlOptions.SSL_ENABLE_ALPS = Number(config.alps)
  }

  if (config.ech) {
    curlOptions.ECH = config.ech
  }

  if (config.sslCertCompression) {
    curlOptions.SSL_CERT_COMPRESSION = config.sslCertCompression
  }

  if (config.tlsDelegatedCredentials) {
    curlOptions.TLS_DELEGATED_CREDENTIALS = config.tlsDelegatedCredentials
  }

  if (config.tlsExtensionOrder) {
    curlOptions.TLS_EXTENSION_ORDER = config.tlsExtensionOrder
  }

  if (typeof config.tlsGrease === 'boolean') {
    curlOptions.TLS_GREASE = Number(config.tlsGrease)
  }

  if (typeof config.tlsKeySharesLimit === 'number') {
    curlOptions.TLS_KEY_SHARES_LIMIT = config.tlsKeySharesLimit
  }

  if (typeof config.tlsPermuteExtensions === 'boolean') {
    curlOptions.SSL_PERMUTE_EXTENSIONS = Number(config.tlsPermuteExtensions)
  }

  if (typeof config.tlsRecordSizeLimit === 'number') {
    curlOptions.TLS_RECORD_SIZE_LIMIT = config.tlsRecordSizeLimit
  }

  if (typeof config.tlsSessionTicket === 'boolean') {
    curlOptions.SSL_ENABLE_TICKET = Number(config.tlsSessionTicket)
  }

  if (typeof config.tlsSignedCertTimestamps === 'boolean') {
    curlOptions.TLS_SIGNED_CERT_TIMESTAMPS = Number(
      config.tlsSignedCertTimestamps,
    )
  }

  if (typeof config.tlsUseNewAlpsCodepoint === 'boolean') {
    curlOptions.TLS_USE_NEW_ALPS_CODEPOINT = Number(
      config.tlsUseNewAlpsCodepoint,
    )
  }

  return curlOptions
}
