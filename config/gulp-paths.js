//////////////////////
// GULP PATHS
//////////////////////

module.exports = {

  dest: {
    js: 'public/dist/js',
    css: 'public/dist/css'
  },

  views: {
    src: 'views/**/*.hbs'
  },

  less: {
    src: 'public/less/*.less',
    watch: 'public/less/**/*.less',
    filename: 'style.css',
    min: 'style.min.css'
  },

  js: {
    src: [],
    watch: [
      'public/js/**/*.js',
      '!public/js/vendor/**/*.js'
    ],
    filename: 'scripts.js',
    min: 'scripts.min.js',
    vendor: {
      src: [
        'public/js/vendor/jquery.js',
        'public/js/vendor/underscore.js',
        'public/js/vendor/handlebars.js'
      ],
      filename: 'vendor.js',
      min: 'vendor.min.js'
    },
  },

  eslint: {
    src: [
      'public/js/**/*.js',
      '!public/js/vendor/**/*.js',
      'config/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      'server.js',
      'gulpfile.js'
    ],
    watch: [
      'public/js/**/*.js',
      '!public/js/vendor/**/*.js',
      'config/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      'server.js',
      'gulpfile.js'
    ]
  }
};