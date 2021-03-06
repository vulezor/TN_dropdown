module.exports = function(grunt) {
    // Konfiguracija
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });
    // Ucitaj plugin za "uglify" task
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Podrazumevani taskovi
    grunt.registerTask('default', ['uglify']);
};