import { CurlSslVersion } from '../../enum/CurlSslVersion'
import { deepMerge, parseHeaders } from '../util'
import type { ImpersonateConfig, VariantImpersonateConfig } from '../types'

import { getChromeConfig } from './chrome'

export enum EdgeBrowser {
  Edge101 = 'edge101',
  Edge142 = 'edge142',
  Edge143 = 'edge143',
  Edge = 'edge143',
}

export const DEFAULT_EDGE_VERSION = '143'

export function getEdgeConfig(config?: VariantImpersonateConfig) {
  const version = config?.version ?? DEFAULT_EDGE_VERSION

  return getChromeConfig(
    deepMerge<VariantImpersonateConfig>(
      {
        override: {
          headers: parseHeaders([
            `sec-ch-ua: "Microsoft Edge";v="${version}", "Chromium";v="${version}", "Not A(Brand";v="24"`,
            `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 Edg/${version}.0.0.0`,
          ]),
          tlsUseNewAlpsCodepoint: false,
        },
      },
      config ?? {},
    ),
  )
}

export const EDGE_BROWSER_CONFIGS: Record<EdgeBrowser, ImpersonateConfig> = {
  [EdgeBrowser.Edge101]: {
    alps: true,
    ciphers:
      'TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256,ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256,ECDHE-ECDSA-AES256-GCM-SHA384,ECDHE-RSA-AES256-GCM-SHA384,ECDHE-ECDSA-CHACHA20-POLY1305,ECDHE-RSA-CHACHA20-POLY1305,ECDHE-RSA-AES128-SHA,ECDHE-RSA-AES256-SHA,AES128-GCM-SHA256,AES256-GCM-SHA384,AES128-SHA,AES256-SHA',
    compressed: true,
    headers: parseHeaders([
      'sec-ch-ua: "Not A;Brand";v="99", "Chromium";v="101", "Microsoft Edge";v="101"',
      'sec-ch-ua-mobile: ?0',
      'sec-ch-ua-platform: "Windows"',
      'Upgrade-Insecure-Requests: 1',
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.47',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site: none',
      'Sec-Fetch-Mode: navigate',
      'Sec-Fetch-User: ?1',
      'Sec-Fetch-Dest: document',
      'Accept-Encoding: gzip, deflate, br',
      'Accept-Language: en-US,en;q=0.9',
    ]),
    http2Settings: '1:65536;3:1000;4:6291456;6:262144',
    http2StreamExclusive: 1,
    http2StreamWeight: 256,
    http2WindowUpdate: 15663105,
    sslCertCompression: 'brotli',
    tlsGrease: true,
    tlsSignedCertTimestamps: true,
    tlsVersion: CurlSslVersion.TlsV1_2,
  },
  [EdgeBrowser.Edge142]: getEdgeConfig({ version: '142' }),
  [EdgeBrowser.Edge143]: getEdgeConfig(),
}
