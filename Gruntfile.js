module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            mainCSS: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css', '!*.min.css', '*/*.css', '!*/*.min.css'], // minify all files ending with .css but not .min.css
                    dest: 'public/css',
                    ext: '.min.css'
                }]
            },
            revolutionCSS: {
                files: [{
                    expand: true,
                    cwd: 'public/revolution',
                    src: ['*.css', '!*.min.css', '*/*.css', '!*/*.min.css'], // minify all files ending with .css but not .min.css
                    dest: 'public/revolution',
                    ext: '.min.css'
                }]
            }
        }
    });

    // Load the plugin that provides the "cssmin" task.
    grunt.loadNpmTasks('grunt-contrib-cssmin');



};