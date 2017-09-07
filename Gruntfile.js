module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    config: {
      work: {
        options: {
          variables: {
            'environment': 'work',
            'configuration': 'catalunya-gmap-options-work.js',
            'style': 'src/css/catalunya-gmap.css'
          }
        }
      },
      prod: {
        options: {
          variables: {
            'environment': 'production',
            'configuration': 'catalunya-gmap-options-prod.js',
            'style': 'src/css/catalunya-gmap.css'
          }
        }
      },
      gmap: {
        options: {
          variables: {
            'environment': 'gmap',
            'configuration': 'catalunya-gmap-options-gmap.js',
            'style': 'src/css/*.css'
          }
        }
      },
      demo: {
        options: {
          variables: {
            'environment': 'demo',
            'configuration': 'catalunya-gmap-options-demo.js',
            'style': 'src/css/*.css'
          }
        }
      }
    },
    "jsbeautifier": {
      files: ["src/js/*.js"],
      options: {}
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! Generated <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      my_target: {
        files: {
          'assets/js/catalunya-gmap/catalunya-gmap-list.min.js': ['src/js/catalunya-gmap-list.js'],
          'assets/js/catalunya-gmap/catalunya-gmap-edifici.min.js': ['src/js/catalunya-gmap-edifici.js'],
          'assets/js/catalunya-gmap/catalunya-gmap-catgmap.min.js': ['src/js/catalunya-gmap-catgmap.js'],
          'assets/js/catalunya-gmap/catalunya-gmap-icons.min.js': ['src/js/catalunya-gmap-icons.js'],
          'assets/js/catalunya-gmap/markerclusterer.min.js': ['src/js/markerclusterer.js'],
          'assets/js/catalunya-gmap/jquery-3.2.1.min.js': ['src/js/jquery-3.2.1.js'],
          'assets/js/catalunya-gmap/catalunya-gmap-init.min.js': ['src/js/catalunya-gmap-init.js'],
          'assets/js/catalunya-gmap/catalunya-gmap-extra.min.js': ['src/js/catalunya-gmap-extra.js'],
          'assets/js/catalunya-gmap/bootstrap.min.js': ['src/js/bootstrap.js']
        }
      }
    },
    copy: {
      options: {
        punctuation: ''
      },
      main: {
        files: [{
            src: ['src/js/<%= grunt.config.get("configuration") %>'],
            dest: 'assets/js/catalunya-gmap/catalunya-gmap-options.js'
          },
          {
            src: ['src/js/catalunya-gmap-path.js'],
            dest: 'assets/js/catalunya-gmap/catalunya-gmap-path.js'
          },
        ],
      },
    },
    clean: ['assets/js/', 'assets/css/'],
    cssmin: {
      target: {
        files: [{
          dest: 'assets/css/catalunya-gmap/catalunya-gmap.css',
          src: ['<%= grunt.config.get("style") %>'],
          ext: '.min.css'
        }]
      }
    },
    // make a zipfile
    compress: {
      main: {
        options: {
          archive: 'dist/gmap-<%= grunt.config.get("environment") %>.zip'
        },
        files: [{
            expand: true,
            cwd: 'assets/',
            src: ['**'],
            dest: 'gmap/assets'
          } // makes all src relative to cwd
        ]
      }
    }
  });

  // Load required modules
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Task definitions
  grunt.registerTask('gmap', ['config:gmap', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('demo', ['config:demo', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('work', ['config:work', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('prod', ['config:prod', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);

  grunt.registerTask('demo-compress', ['demo', 'compress']);
  grunt.registerTask('work-compress', ['work', 'compress']);
  grunt.registerTask('prod-compress', ['prod', 'compress']);

  grunt.registerTask('release', ['demo-compress', 'work-compress', 'prod-compress', 'default']);

  grunt.registerTask('default', ['gmap']);
};
