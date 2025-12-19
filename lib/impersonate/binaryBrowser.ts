import {
  CurlyFunction,
  CurlyOptions,
  CurlyResponseBodyParsersProperty,
  CurlyResult,
  methods,
  defaultResponseBodyParsers,
} from '../curly'
import { exec } from 'child_process'
import type { Browser } from './index'
import path from 'path'

type httpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'
const curlDir =
  process.env['NODE_LIBCURL_JA3_BIN_PATH'] ||
  path.resolve(
    __dirname,
    '../../deps/curl-impersonate/build/curl-impersonate/bin',
  )

interface CurlResponse {
  StatusCode: number
  Headers: Record<string, string>
  Body: string
}

function parseCurlOutput(stderr: string, stdout: string): CurlResponse {
  const response: CurlResponse = {
    StatusCode: 200,
    Headers: {},
    Body: stdout.trim(),
  }

  // Extract status line (e.g., "HTTP/2 200" or "HTTP/1.1 404 Not Found")
  const statusLineMatch = stderr.match(/< HTTP\/\d(\.\d)? (\d{3})/)
  if (statusLineMatch) {
    response.StatusCode = parseInt(statusLineMatch[2], 10)
  }

  // Extract headers
  const headerLines = stderr
    .split('\n')
    .filter((line) => line.startsWith('<') && !line.includes('HTTP/'))
  headerLines.forEach((line) => {
    const match = line.match(/< ([^:]+):\s*(.*)/)
    if (match) {
      response.Headers[match[1].trim()] = match[2].trim()
    }
  })

  return response
}

export function create(browser: Browser): CurlyFunction {
  function runCommand(
    method: httpMethod,
    url: string,
    headers?: Record<string, string>,
    body?: string,
  ): Promise<CurlResponse> {
    const args = ['-v', '-X', method]

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        args.push('-H', `"${key}: ${value}"`)
      }
    }

    if (method !== 'GET') {
      args.push('-d', body ? JSON.stringify(body) : '')
    }

    args.push(url)

    const binName = 'curl_' + browser.replace(/_/g, '')
    const curlCommand = path.resolve(`${curlDir}/${binName}`)
    const command = `${curlCommand} ${args.join(' ')}`

    return new Promise((resolve, reject) => {
      const process = exec(
        command,
        {
          encoding: 'utf8',
        },
        (error, stdout, stderr) => {
          if (error) {
            reject(error)
            return
          }

          const response = parseCurlOutput(stderr, stdout)
          if (response.StatusCode >= 400) {
            reject(
              new Error(`request error, status code ${response.StatusCode}`),
            )
          }

          resolve(response)
        },
      )

      // Optionally, you can also handle the streams directly
      process.stdout?.setEncoding('utf8')
      process.stderr?.setEncoding('utf8')
    })
  }

  function fn<ResultData>(
    url: string,
    options: CurlyOptions = {},
  ): Promise<CurlyResult<ResultData>> {
    return new Promise((resolve, reject) => {
      const method = (options.customRequest || 'GET') as httpMethod

      // construct headers
      const headers: Record<string, string> = {}
      if (options.httpHeader) {
        options.httpHeader.forEach((header) => {
          const parts = header.split(':')
          if (parts.length == 2) {
            headers[parts[0].trim()] = parts[1].trim()
          }
        })
      }

      runCommand(method, url, headers)
        .then((response) => {
          // get content type
          const contentTypeEntry = Object.entries(response.Headers).find(
            ([k]) => k.toLowerCase() === 'content-type',
          )

          const contentType = contentTypeEntry ? contentTypeEntry[1] : ''
          let parser = defaultResponseBodyParsers[contentType]
          if (!parser) {
            parser = (data, _headers) => data.toString('utf8')
          }

          const headers = [{ ...response.Headers } as Record<string, string>]

          // Convert string to Buffer before parsing
          const bodyBuffer = Buffer.from(response.Body)
          const body = parser(bodyBuffer, headers)

          const result: CurlyResult<ResultData> = {
            statusCode: response.StatusCode,
            headers: headers,
            data: body,
          }
          resolve(result)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  fn.create = create
  fn.defaultResponseBodyParsers = {} as CurlyResponseBodyParsersProperty

  const httpMethodOptionsMap: Record<
    string,
    null | ((m: string, o: CurlyOptions) => CurlyOptions)
  > = {
    get: null,
    post: (_m, o) => ({
      post: true,
      ...o,
    }),
    head: (_m, o) => ({
      nobody: true,
      ...o,
    }),
    _: (m, o) => ({
      customRequest: m.toUpperCase(),
      ...o,
    }),
  }

  for (const httpMethod of methods) {
    const httpMethodOptionsKey = Object.prototype.hasOwnProperty.call(
      httpMethodOptionsMap,
      httpMethod,
    )
      ? httpMethod
      : '_'
    const httpMethodOptions = httpMethodOptionsMap[httpMethodOptionsKey]

    // @ts-ignore
    fn[httpMethod] =
      httpMethodOptions === null
        ? fn
        : (url: string, options: CurlyOptions = {}) =>
            fn(url, {
              ...httpMethodOptions(httpMethod, options),
            })
  }

  return fn as unknown as CurlyFunction
}
