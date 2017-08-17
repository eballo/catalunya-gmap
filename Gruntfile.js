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
          'assets/js/catalunya-gmap-list.min.js': ['src/js/catalunya-gmap-list.js'],
          'assets/js/catalunya-gmap-edifici.min.js': ['src/js/catalunya-gmap-edifici.js'],
          'assets/js/catalunya-gmap-catgmap.min.js': ['src/js/catalunya-gmap-catgmap.js'],
          'assets/js/catalunya-gmap-icons.min.js': ['src/js/catalunya-gmap-icons.js'],
          'assets/js/markerclusterer.min.js': ['src/js/markerclusterer.js'],
          'assets/js/catalunya-gmap-path.min.js': ['src/js/catalunya-gmap-path.js'],
          'assets/js/jquery-3.2.1.min.js': ['src/js/jquery-3.2.1.js'],
          'assets/js/catalunya-gmap-init.min.js': ['src/js/catalunya-gmap-init.js'],
          'assets/js/bootstrap.min.js': ['src/js/bootstrap.js']
        }
      }
    },
    copy: {
      options: {
        punctuation: ''
      },
      main: {
        files: [{
            src: ['src/js/catalunya-gmap-init.js'],
            dest: 'assets/js/catalunya-gmap-init.js'
          },
          {
            src: ['src/js/<%= grunt.config.get("configuration") %>'],
            dest: 'assets/js/catalunya-gmap-options.js'
          },
          {
            src: ['src/js/catalunya-gmap-path.js'],
            dest: 'assets/js/catalunya-gmap-path.js'
          },
          {
            src: ['src/js/jquery-3.1.1.min.js'],
            dest: 'assets/js/jquery-3.1.1.min.js'
          },
        ],
      },
    },
    clean: ['assets/js/', 'assets/css/'],
    cssmin: {
      target: {
        files: [{
          dest: 'assets/css/catalunya-gmap.css',
          src: ['<%= grunt.config.get("style") %>'],
          ext: '.min.css'
        }]
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

  // Task definitions
  grunt.registerTask('default', ['config:gmap', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('work', ['config:work', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('prod', ['config:prod', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
  grunt.registerTask('demo', ['config:demo', 'clean', 'jsbeautifier', 'uglify', 'copy', 'cssmin']);
};
