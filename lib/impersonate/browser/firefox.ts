import { parseFingerprint } from '../fingerprint'
import { deepMerge, parseHeaders } from '../util'
import type { ImpersonateConfig, VariantImpersonateConfig } from '../types'

export enum FirefoxBrowser {
  Firefox135 = 'firefox135',
  Firefox136 = 'firefox136',
  Firefox144 = 'firefox144',
  Firefox = 'firefox144',
}

export const DEFAULT_FIREFOX_FINGERPRINT = {
  ja3: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-34-18-51-43-13-45-28-27-65037,4588-29-23-24-25-256-257,0',
  ja4: 't13d1717h2_1301,1303,1302,c02b,c02f,cca9,cca8,c02c,c030,c00a,c009,c013,c014,009c,009d,002f,0035_0000,0017,ff01,000a,000b,0023,0010,0005,0022,0012,0033,002b,000d,002d,001c,001b,fe0d_0403,0503,0603,0804,0805,0806,0401,0501,0601,0203,0201',
  akami: '1:65536;2:0;4:131072;5:16384|12517377|0|m,p,a,s',
  keepExtensionOrder: true,
}

export const DEFAULT_FIREFOX_VERSION = '144.0'

export function getFirefoxConfig(config?: VariantImpersonateConfig) {
  const version = config?.version ?? DEFAULT_FIREFOX_VERSION

  return deepMerge<ImpersonateConfig>(
    {
      compressed: true,
      headers: parseHeaders([
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}) Gecko/20100101 Firefox/${version}`,
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
        'Accept-Encoding: gzip, deflate, br, zstd',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: none',
        'Sec-Fetch-User: ?1',
        'Priority: u=0, i',
        'TE: Trailers',
      ]),
      http2StreamExclusive: 0,
      http2StreamWeight: 42,
      sslCertCompression: 'zlib,brotli,zstd',
      tlsDelegatedCredentials:
        'ecdsa_secp256r1_sha256:ecdsa_secp384r1_sha384:ecdsa_secp521r1_sha512:ecdsa_sha1',
      tlsKeySharesLimit: 3,
      tlsRecordSizeLimit: 4001,
    },
    parseFingerprint(
      deepMerge(DEFAULT_FIREFOX_FINGERPRINT, config?.fingerprint ?? {}),
    ),
    config?.override ?? {},
  )
}

export const FIREFOX_BROWSER_CONFIGS: Record<
  FirefoxBrowser,
  ImpersonateConfig
> = {
  [FirefoxBrowser.Firefox135]: getFirefoxConfig({ version: '135.0' }),
  [FirefoxBrowser.Firefox136]: getFirefoxConfig({ version: '136.0' }),
  [FirefoxBrowser.Firefox144]: getFirefoxConfig(),
}
