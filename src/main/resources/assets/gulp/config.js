var dest = "./build";
var src = './javascripts';

module.exports = {
  browserSync: {
    proxy: "localhost:8081",
    files: [
      dest + "/**",
      "!" + dest + "/**.map"
    ]
  },

  browserify: {

    // Enable source maps
    debug: true,

    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/app.js',
      dest: dest,
      outputName: 'app.js'
    }, {
      entries: src + '/plugins/plugin.js',
      dest: dest,
      outputName: 'plugin.js'
    }]
  },

  jest: {
    scriptPreprocessor: './specs/support/preprocessor.js',
    unmockedModulePathPatterns: [
      'node_modules/react'
    ],
    testDirectoryName: 'specs',
    testPathIgnorePatterns: [
      'node_modules',
      'specs/support'
    ],
    moduleFileExtensions: [
      'js', 'json', 'react'
    ]
  }
};