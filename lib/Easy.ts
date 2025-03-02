/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NODE_LIBCURL_BINDING } from './binding'

/**
 * This is a Node.js wrapper around the binding {@link EasyNativeBinding | native Easy class}
 *
 * @public
 */
class Easy extends NODE_LIBCURL_BINDING.Easy {}

export { Easy }
