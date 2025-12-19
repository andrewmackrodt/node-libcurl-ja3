import { CurlSslVersion } from '../../enum/CurlSslVersion'
import { parseFingerprint } from '../fingerprint'
import { deepMerge, parseHeaders } from '../util'
import type { ImpersonateConfig, VariantImpersonateConfig } from '../types'

export enum SafariBrowser {
  Safari18_0 = 'safari18_0',
  Safari18_4 = 'safari18_4',
  Safari18_6 = 'safari18_6',
  Safari = 'safari18_6',
}

export const DEFAULT_SAFARI_FINGERPRINT = {
  ja3: '771,4865-4866-4867-49196-49195-52393-49200-49199-52392-49162-49161-49172-49171-157-156-53-47-49160-49170-10,0-23-65281-10-11-16-5-13-18-51-45-43-27-21,29-23-24-25,0',
  ja4: 't13d2014h2_1301,1302,1303,c02c,c02b,cca9,c030,c02f,cca8,c00a,c009,c014,c013,009d,009c,0035,002f,c008,c012,000a_0000,0017,ff01,000a,000b,0010,0005,000d,0012,0033,002d,002b,001b,0015_0403,0804,0401,0503,0805,0805,0501,0806,0601,0201',
  akami: '2:0;3:100;4:2097152;9:1|10420225|0|m,s,a,p',
}

export const DEFAULT_SAFARI_VERSION = '18.6'

export function getSafariConfig(config?: VariantImpersonateConfig) {
  const version = config?.version ?? DEFAULT_SAFARI_VERSION

  return deepMerge<ImpersonateConfig>(
    {
      compressed: true,
      headers: parseHeaders([
        'sec-fetch-dest: document',
        `user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Safari/605.1.15`,
        'accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'sec-fetch-site: none',
        'sec-fetch-mode: navigate',
        'accept-language: en-US,en;q=0.9',
        'priority: u=0, i',
        'accept-encoding: gzip, deflate, br',
      ]),
      http2StreamExclusive: 1,
      http2StreamWeight: 256,
      sslCertCompression: 'zlib',
      tlsGrease: true,
      tlsVersion: CurlSslVersion.TlsV1_0,
    },
    parseFingerprint(
      deepMerge(DEFAULT_SAFARI_FINGERPRINT, config?.fingerprint ?? {}),
    ),
    config?.override ?? {},
  )
}

export const SAFARI_BROWSER_CONFIGS: Record<SafariBrowser, ImpersonateConfig> =
  {
    [SafariBrowser.Safari18_0]: getSafariConfig({
      version: '18.0',
      fingerprint: { akami: '2:0;3:100;4:2097152;8:1;9:1|10420225|0|m,s,a,p' },
    }),
    [SafariBrowser.Safari18_4]: getSafariConfig({ version: '18.4' }),
    [SafariBrowser.Safari18_6]: getSafariConfig(),
  }
