import { parseFingerprint } from '../fingerprint'
import { deepMerge, parseHeaders } from '../util'
import type { ImpersonateConfig, VariantImpersonateConfig } from '../types'

export enum ChromeBrowser {
  Chrome136 = 'chrome136',
  Chrome142 = 'chrome142',
  Chrome143 = 'chrome143',
  Chrome = 'chrome143',
}

export const DEFAULT_CHROME_FINGERPRINT = {
  ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-5-10-11-13-16-18-23-27-35-43-45-51-17613-65037-65281,4588-29-23-24,0',
  ja4: 't13d1516h2_1301,1302,1303,c02b,c02f,c02c,c030,cca9,cca8,c013,c014,009c,009d,002f,0035_44cd,fe0d,0012,000a,0005,0017,ff01,001b,002b,0010,000b,000d,0000,0023,002d,0033_0403,0804,0401,0503,0805,0501,0806,0601',
  akami: '1:65536;2:0;4:6291456;6:262144|15663105|0|m,a,s,p',
}

export const DEFAULT_CHROME_VERSION = '143'

export function getChromeConfig(config?: VariantImpersonateConfig) {
  const version = config?.version ?? DEFAULT_CHROME_VERSION

  return deepMerge<ImpersonateConfig>(
    {
      compressed: true,
      headers: parseHeaders([
        `sec-ch-ua: "Google Chrome";v="${version}", "Chromium";v="${version}", "Not A(Brand";v="24"`,
        'sec-ch-ua-mobile: ?0',
        'sec-ch-ua-platform: "Windows"',
        'Upgrade-Insecure-Requests: 1',
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Sec-Fetch-Site: none',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-User: ?1',
        'Sec-Fetch-Dest: document',
        'Accept-Encoding: gzip, deflate, br, zstd',
        'Accept-Language: en-US,en;q=0.9',
        'Priority: u=0, i',
      ]),
      http2StreamExclusive: 1,
      http2StreamWeight: 256,
      sslCertCompression: 'brotli',
      tlsGrease: true,
      tlsPermuteExtensions: true,
    },
    parseFingerprint(
      deepMerge(DEFAULT_CHROME_FINGERPRINT, config?.fingerprint ?? {}),
    ),
    config?.override ?? {},
  )
}

export const CHROME_BROWSER_CONFIGS: Record<ChromeBrowser, ImpersonateConfig> =
  {
    [ChromeBrowser.Chrome136]: getChromeConfig({ version: '136' }),
    [ChromeBrowser.Chrome142]: getChromeConfig({ version: '142' }),
    [ChromeBrowser.Chrome143]: getChromeConfig(),
  }
