module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({

    nodeunit: {
      files: ['test/**/*-spec.js']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },

    stylus: {
        app: {
            banner :'',
            "include css": true,
            paths: ['src/css/**/*'],
            files: {
                'public/css/app.css': 'src/css/app.styl'
            }
        }
    },
    webfont:{
        icons: {
            src: 'src/fonts/icons/*.svg',
            dest: 'public/fonts',
            destCss: 'public/fonts',
            options: {
                ie7:false,
                font : 'icon',
                template : 'src/fonts/template/template.css',
//                htmlDemoTemplate : 'grunt/fonts/template/skycon-template.html',
                htmlDemo : false,
                ligatures : false,
//                    engine : 'node',
//                destHtml : '_includes/base-styles/icons',
                hashes : false,
                embed : true
            }
        }
    },
    copy: {
      images: {
          files: [{
              expand: true,
              dot: true,
              cwd: 'src/',
              dest: 'public',
              src: [
                  'images/backgrounds/*.{jpg,png}'
              ]
          }]
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      }
    }
  });

    // Default task.
  grunt.registerTask('default', ['jshint', 'stylus', 'copy:images', 'webfont']);
  grunt.registerTask('test', ['nodeunit']);

};
