var dest = "./build";
var src = './javascripts';

module.exports = {
  browserSync: {
    server: {
      baseDir: './'
    },
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
      entries: src + '/javascript/app.js',
      dest: dest,
      outputName: 'app.js'
    }]
  }
};