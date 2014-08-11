'use strict';
module.exports = function(grunt) {

  // ----------------------------------------------------------
  // WARNING, BRAVE DEVELOPER
  // ----------------------------------------------------------
  // Webhook allows you to use local grunt tasks and files.
  // However, these tasks are ONLY RUN LOCALLY and not when
  // your live site needs to be rebuilt. This means you should
  // only use grunt for pre-processing tasks like building
  // Sass, less or coffescript files, not for reading things
  // from your templates and making dynamic changes during
  // the build process. Doing so will cause your live site
  // not to regerate.
  //
  // You have been warned!
  grunt.initConfig({

    // Import Bourbon, Neat and Wyrm. Generate CSS from the /sass/ folder
    sass: {
      dev: {
        options: {
          style: 'compressed',
          loadPath: ['bower_components/bourbon/app/assets/stylesheets', 'bower_components/neat/app/assets/stylesheets', 'bower_components/font-awesome/scss', 'bower_components/wyrm/sass']
        },
        files: [{
          expand: true,
          cwd: 'sass',
          src: ['*.sass'],
          dest: 'static/css',
          ext: '.css'
        }]
      }
    },
    copy: {
      // Import Fontawesome fonts
      fontawesome: {
        files: [
          {expand: true, src: ['bower_components/font-awesome/fonts/*'], dest: 'static/fonts/', flatten: true, filter: 'isFile'}
        ]
      },
      // Import the Webhook affix JS
      webhookjs: {
        files: [
          {expand: true, src: ['bower_components/webhook-js/src/webhook-affix.js'], dest: 'static/javascript/webhook-js/', flatten: true, filter: 'isFile'}
        ]
      },
      // Import Fluid Box JS
      fluidbox: {
        files: [
          {expand: true, src: ['bower_components/fluidbox/jquery.fluidbox.js'], dest: 'static/javascript/fluidbox/', flatten: true, filter: 'isFile'},
          {expand: true, src: ['bower_components/fluidbox/css/fluidbox.css'], dest: 'static/css/', flatten: true, filter: 'isFile'},
          {expand: true, src: ['bower_components/imagesloaded/*.js'], dest: 'static/javascript/imagesloaded/', flatten: true, filter: 'isFile'}
        ]
      }
    },
    watch: {
      options : {
        files: ['sass/**/*.sass', 'bower_components/wyrm/sass/**/*.sass'],
        tasks: ['sass','build']
      },
    }
  });

  // These are the custom grunt packages we're adding
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // NEVER REMOVE THESE LINES, OR ELSE YOUR PROJECT MAY NOT WORK
  require('./options/generatorOptions.js')(grunt);
  grunt.loadTasks('tasks');
};
