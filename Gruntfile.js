module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    "jsbeautifier": {
      files: ["js/*.js", "!js/markerclusterer.js", "!js/jquery-3.1.1.min.js", "!js/catalunya-gmap-path.js"],
      options: {}
    }
  });

  // Load required modules
  grunt.loadNpmTasks('grunt-jsbeautifier');

  // Task definitions
  grunt.registerTask(
    'default', ['jsbeautifier']
  );
};
