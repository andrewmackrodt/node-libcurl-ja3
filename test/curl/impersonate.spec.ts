import { describe, beforeAll, afterAll, it, expect } from 'vitest'
import express from 'express'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { Browser, BROWSER_CONFIGS, impersonate } from '../../lib'
import { create as createBinaryBrowser } from '../../lib/impersonate/binaryBrowser'

describe('Browser Impersonation', function () {
  let server: Server
  let port: number

  // Start express server before tests
  beforeAll(async () => {
    const app = express()

    // Endpoint that returns received headers
    app.get('/headers', (req, res) => {
      res.json(req.headers)
    })

    return new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        // Port 0 means random available port
        port = (server.address() as AddressInfo).port
        resolve()
      })
    })
  })

  // Close server after tests
  afterAll(() => {
    return new Promise((resolve) => server.close(resolve))
  })

  // Test cases for different browsers
  ;[Browser.Chrome133, Browser.Firefox135].forEach((browser) => {
    it(`should correctly impersonate ${browser}`, async () => {
      // Get the curly function for the browser
      const curly = impersonate(browser)

      // Make request to our test server
      const { statusCode, data } = await curly(
        `http://localhost:${port}/headers`,
      )

      if (statusCode !== 200) {
        throw new Error(`Failed to make request to server: ${statusCode}`)
      }

      // Parse response data
      const receivedHeaders = data

      // Get expected headers for this browser
      const expectedHeaders = {
        ...BROWSER_CONFIGS[browser].headers,
        host: `localhost:${port}`, // Host header is automatically added
      }

      // Convert all header keys to lowercase for comparison
      const normalizedExpectedHeaders = Object.entries(expectedHeaders).reduce(
        (acc, [key, value]) => {
          acc[key.toLowerCase()] = value
          return acc
        },
        {} as Record<string, string>,
      )

      // Check each expected header
      Object.entries(normalizedExpectedHeaders).forEach(([key, value]) => {
        expect(receivedHeaders[key]).to.equal(
          value,
          `Header "${key}" doesn't match for ${browser}`,
        )
      })
    })
  })

  // custom cookie
  it('should correctly impersonate with custom cookie', async () => {
    const curly = impersonate(Browser.Firefox135)
    const cookieValue = 'custom_cookie=value'
    const { statusCode, data } = await curly(
      `http://localhost:${port}/headers`,
      {
        httpHeader: ['Cookie: custom_cookie=value'],
      },
    )

    if (statusCode !== 200) {
      throw new Error(`Failed to make request to server: ${statusCode}`)
    }

    const receivedHeaders = data

    // received headers should contain the custom cookie
    expect(receivedHeaders['cookie']).to.equal(cookieValue)
  })

  // Test error case
  it('should throw error for unsupported browser', () => {
    expect(() => impersonate('invalid' as Browser)).to.throw(
      'Unsupported browser: invalid',
    )
  })
})

describe('Comparison with binary version', function () {
  ;[
    Browser.Chrome133,
    Browser.Edge101,
    Browser.Firefox135,
    Browser.Safari18_0,
  ].forEach((browserName) => {
    it(`should match response with binary browser ${browserName}`, async function () {
      const binBrowser = createBinaryBrowser(browserName)
      const browser = impersonate(browserName)
      const browserConfig = BROWSER_CONFIGS[browserName]

      const [binPage, page] = await Promise.all([
        binBrowser.get('https://tls.browserleaks.com/json'),
        browser.get('https://tls.browserleaks.com/json'),
      ])

      const compareKeys = browserConfig.tlsPermuteExtensions
        ? ['akamai_hash', 'ja3n_hash', 'ja4']
        : ['akamai_hash', 'ja3_hash', 'ja4']

      const normalize = (data: Record<string, string>) => {
        // remove platform information from user agent
        let lastUserAgent = null
        let userAgent = data.user_agent
        do {
          lastUserAgent = userAgent
          userAgent = userAgent
            .replace(
              /\(([^)]*?)(?:Intel|Linux|Mac|Win|X11|x64).*?(; *|\))/gi,
              '($1Generic$2',
            )
            .replace(/Generic(; Generic\b)+/g, 'Generic')
        } while (userAgent !== lastUserAgent)

        return compareKeys.reduce(
          (obj, key) => {
            obj[key] = data[key]
            return obj
          },
          { user_agent: userAgent } as Record<string, string>,
        )
      }

      expect(normalize(binPage.data)).to.deep.equal(normalize(page.data))
    })
  })
})
