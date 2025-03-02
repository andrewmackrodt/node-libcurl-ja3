import { CurlHttpVersion } from '../../enum/CurlHttpVersion'
import { CurlSslVersion } from '../../enum/CurlSslVersion'
import { Fingerprint } from './Fingerprint'

export interface ImpersonateConfig {
  headers: Record<string, string>
  tlsVersion?:
    | CurlSslVersion.TlsV1_0
    | CurlSslVersion.TlsV1_1
    | CurlSslVersion.TlsV1_2
    | CurlSslVersion.TlsV1_3
  ciphers?: string
  curves?: string
  signatureHashes?: string
  compressed?: boolean
  httpVersion?: CurlHttpVersion
  http2PseudoHeadersOrder?: string
  http2Settings?: string
  http2StreamExclusive?: number
  http2StreamWeight?: number
  http2WindowUpdate?: number
  alps?: boolean
  ech?: string
  sslCertCompression?: string
  tlsDelegatedCredentials?: string
  tlsExtensionOrder?: string
  tlsGrease?: boolean
  tlsKeySharesLimit?: number
  tlsPermuteExtensions?: boolean
  tlsRecordSizeLimit?: number
  tlsSessionTicket?: boolean
  tlsSignedCertTimestamps?: boolean
  tlsUseNewAlpsCodepoint?: boolean
}

export interface VariantImpersonateConfig {
  fingerprint?: Fingerprint
  override?: ImpersonateConfig
  version?: string
}
