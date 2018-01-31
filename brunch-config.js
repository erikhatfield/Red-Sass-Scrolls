exports.files = {
  javascripts: {
    joinTo: {
      'js/app.js': /^(app)/,
      'js/vendor.js': /^node_modules/,
    },
  },
  stylesheets: { joinTo: 'css/app.css' },
};

exports.plugins = {
  babel: { presets: ['latest', 'stage-0'] },
  pleeease: {
    sass: true,
    autoprefixer: {
      browsers: ['> 1%'],
    },
  },
  sassLint: {
    file: '.sass-lint.yml',
    options: {
	    
    },
    warnOnly: true
  },
};

exports.modules = {
  autoRequire: {
    'js/app.js': ['js/initialize'],
  },
};

exports.npm = {
  globals: {
    jQuery: 'jquery',
    $: 'jquery',
  },
  styles: {
    //bootstrap: ['dist/css/bootstrap.css'],
  },
};
