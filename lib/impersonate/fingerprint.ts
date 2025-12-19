import { CurlSslVersion } from '../enum/CurlSslVersion'
import { CurlJa3Cipher } from './enum/CurlJa3Cipher'
import { CurlJa3Curve } from './enum/CurlJa3Curve'
import { CurlJa3Extension } from './enum/CurlJa3Extension'
import { CurlJa3SigHashAlg } from './enum/CurlJa3SigHashAlg'
import type { Fingerprint, ImpersonateConfig } from './types'

export function parseFingerprint(fp: Fingerprint): Partial<ImpersonateConfig> {
  const config: Partial<ImpersonateConfig> = {}
  if (fp.ja3) {
    Object.assign(config, parseJa3Fingerprint(fp.ja3, fp.keepExtensionOrder))
  }
  if (fp.ja4) {
    Object.assign(config, parseJa4Fingerprint(fp.ja4, fp.keepExtensionOrder))
  }
  if (fp.akami) {
    Object.assign(config, parseAkamiFingerprint(fp.akami))
  }
  return config
}

const EXTENSION_CONFIG_MAPPING: Record<
  number,
  (config: Partial<ImpersonateConfig>) => undefined
> = {
  [CurlJa3Extension.TLSEXT_TYPE_application_settings_old]: (config) => {
    config.alps = true
  },
  [CurlJa3Extension.TLSEXT_TYPE_application_settings]: (config) => {
    config.alps = true
    config.tlsUseNewAlpsCodepoint = true
  },
  [CurlJa3Extension.TLSEXT_TYPE_cert_compression]: (config) => {
    // brotli is only used by chromium, other browsers must override
    config.sslCertCompression = 'brotli'
  },
  [CurlJa3Extension.TLSEXT_TYPE_certificate_timestamp]: (config) => {
    config.tlsSignedCertTimestamps = true
  },
  [CurlJa3Extension.TLSEXT_TYPE_encrypted_client_hello]: (config) => {
    config.ech = 'grease'
  },
}

function applyExtensionConfigs(
  extensionIds: number[],
  config: Partial<ImpersonateConfig>,
  keepExtensionOrder?: boolean,
) {
  extensionIds
    .filter((id) => id in EXTENSION_CONFIG_MAPPING)
    .forEach((id) => EXTENSION_CONFIG_MAPPING[id](config))

  if (!extensionIds.includes(CurlJa3Extension.TLSEXT_TYPE_session_ticket)) {
    config.tlsSessionTicket = false
  }

  if (keepExtensionOrder) {
    config.tlsExtensionOrder = extensionIds.join('-')
  }
}

function parseAkamiFingerprint(
  fingerprint: string,
): Partial<ImpersonateConfig> {
  const [a, b, , d] = fingerprint.split('|')
  return {
    http2Settings: a,
    http2WindowUpdate: parseInt(b, 10),
    http2PseudoHeadersOrder: d.replace(/,/g, ''),
  }
}

function parseCipher(id: string, base?: number): string {
  const parsed = CurlJa3Cipher[parseInt(id, base ?? 10)]
  if (typeof parsed === 'undefined') {
    throw new Error(`Unsupported cipher: ${id}`)
  }
  return parsed
}

function parseCurve(id: string, base?: number): string {
  const parsed = CurlJa3Curve[parseInt(id, base ?? 10)]
  if (typeof parsed === 'undefined') {
    throw new Error(`Unsupported curve: ${id}`)
  }
  return parsed
}

function parseJa3Fingerprint(
  fingerprint: string,
  tlsPermuteExtensions?: boolean,
): Partial<ImpersonateConfig> {
  const [_tlsVersion, _ciphers, _extensions, _curves] = fingerprint.split(',')

  let tlsVersion: CurlSslVersion
  switch (parseInt(_tlsVersion, 10)) {
    case 771:
      tlsVersion = CurlSslVersion.TlsV1_2
      break
    case 772:
      tlsVersion = CurlSslVersion.TlsV1_3
      break
    default:
      throw new Error(`Unsupported TLS version: ${_tlsVersion}`)
  }

  const config: Partial<ImpersonateConfig> = {
    tlsVersion,
    ciphers:
      _ciphers
        .split('-')
        .map((id) => parseCipher(id))
        .join(':') || undefined,
    curves:
      _curves
        .split('-')
        .map((id) => parseCurve(id))
        .join(':') || undefined,
  }

  applyExtensionConfigs(
    _extensions.split('-').map((id) => parseInt(id, 10)),
    config,
    tlsPermuteExtensions,
  )

  return config
}

/**
 * @link https://github.com/FoxIO-LLC/ja4/blob/main/technical_details/JA4.md
 */
function parseJa4Fingerprint(
  fingerprint: string,
  tlsPermuteExtensions?: boolean,
): Partial<ImpersonateConfig> {
  const [_header, _ciphers, _extensions, _sigalgs] = fingerprint.split('_')

  let tlsVersion: CurlSslVersion
  switch (_header.slice(1, 3)) {
    case '12':
      tlsVersion = CurlSslVersion.TlsV1_2
      break
    case '13':
      tlsVersion = CurlSslVersion.TlsV1_3
      break
    default:
      throw new Error(`Unsupported TLS version: ${_header.slice(1, 3)}`)
  }

  const config: Partial<ImpersonateConfig> = {
    tlsVersion,
    ciphers:
      _ciphers
        .split(',')
        .map((id) => parseCipher(id, 16))
        .join(':') || undefined,
    signatureHashes:
      _sigalgs
        .split(',')
        .map((id) => parseSigHashAlg(id, 16))
        .join(',') || undefined,
  }

  applyExtensionConfigs(
    _extensions.split(',').map((id) => parseInt(id, 16)),
    config,
    tlsPermuteExtensions,
  )

  return config
}

function parseSigHashAlg(id: string, base?: number): string {
  const parsed = CurlJa3SigHashAlg[parseInt(id, base ?? 10)]
  if (typeof parsed === 'undefined') {
    throw new Error(`Unsupported sig hash alg: ${id}`)
  }
  return parsed
}
