/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'node:fs'
import path from 'node:path'

import type { NodeLibcurlNativeBinding } from './types'

const pkg = require('../package.json')
const moduleParent = pkg.binary.module_path.split('{configuration}', 1)

let nodeLibcurlBindingPath: string | undefined

if (moduleParent.length === 1) {
  nodeLibcurlBindingPath = path.join(
    path.join(__dirname, '..'),
    moduleParent[0],
    `${pkg.binary.module_name}.node`,
  )
}

if (!nodeLibcurlBindingPath || !fs.existsSync(nodeLibcurlBindingPath)) {
  nodeLibcurlBindingPath = path.join(
    path.join(__dirname, '..'),
    pkg.binary.module_path
      .replaceAll('{configuration}', `Release`)
      .replaceAll('{node_abi}', `node-v${process.versions.modules}`)
      .replaceAll('{platform}', process.platform)
      .replaceAll('{arch}', process.arch),
    `${pkg.binary.module_name}.node`,
  )
}

export const NODE_LIBCURL_BINDING = require(
  nodeLibcurlBindingPath,
) as NodeLibcurlNativeBinding
