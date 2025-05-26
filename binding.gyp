{
  'variables': {
    'build_dir': '<(module_root_dir)/deps/curl-impersonate/build/curl-impersonate',
  },
  'targets': [
    {
      'target_name': '<(module_name)',
      'type': 'loadable_module',
      'product_dir': '<(module_path)',
      'product_name': '<(module_name)',
      'sources': [
        'src/node_libcurl.cc',
        'src/Easy.cc',
        'src/Share.cc',
        'src/Multi.cc',
        'src/Curl.cc',
        'src/CurlHttpPost.cc',
        'src/CurlVersionInfo.cc',
        'src/Http2PushFrameHeaders.cc',
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
        "<(build_dir)/include"
      ],
      'conditions': [
        ['OS=="linux"', {
          'defines': [
            'CURL_STATICLIB',
            'BUILD_IMPERSONATE',
          ],
          'libraries': [
            '-L<(build_dir)/lib',
            '<!@(<(build_dir)/bin/curl-impersonate-config --static-libs)',
          ]
        }],
        ['OS=="mac"', {
          'defines': [
            'CURL_STATICLIB',
            'BUILD_IMPERSONATE',
          ],
          'xcode_settings': {
            'OTHER_LDFLAGS': [
              # HACK: -framework CoreFoundation appears twice, but CoreFoundation is a singleton
              # because it doesn't start with a -. We need to remove one of the instances of
              # -framework CoreFoundation or GYP will break our args.
              # This seems to be required starting with xcode 12
              # original workaround from https://github.com/JCMais/node-libcurl/pull/312
              '-static',
              '<!@(<(build_dir)/bin/curl-impersonate-config --static-libs | sed "s/-framework CoreFoundation//")',
            ],

            'LD_RUNPATH_SEARCH_PATHS': [
              '<!@(<(build_dir)/bin/curl-impersonate-config --static-libs | node -e "console.log(require(\'fs\').readFileSync(0, \'utf-8\').split(\' \').filter(i => i.startsWith(\'-L\')).join(\' \').replace(/-L/g, \'\'))")'
            ],
          },
        }],
      ]
    },
    {
      'target_name': 'action_after_build',
      'type': 'none',
      'dependencies': [ '<(module_name)' ],
      'copies': [
        {
          'files': [ '<(module_path)/<(module_name).node' ],
          'destination': '<(module_root_dir)/lib/binding'
        }
      ]
    }
  ]
}
