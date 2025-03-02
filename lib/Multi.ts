/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NODE_LIBCURL_BINDING } from './binding'

/**
 * This is a Node.js wrapper around the binding {@link MultiNativeBinding | native Multi class}.
 *
 * The only extra is that it provides a static field `option`.
 *
 * @public
 */
class Multi extends NODE_LIBCURL_BINDING.Multi {
  /**
   * Options to be used with {@link setOpt | `setOpt`}.
   *
   * See the official documentation of [`curl_multi_setopt()`](http://curl.haxx.se/libcurl/c/curl_multi_setopt.html)
   *  for reference.
   *
   * `CURLMOPT_MAXCONNECTS` becomes `Multi.option.MAXCONNECTS`
   */
  static option = NODE_LIBCURL_BINDING.Curl.multi
}

export { Multi }
