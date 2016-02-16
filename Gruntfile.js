/// <binding ProjectOpened='watch' />
'use strict';

module.exports = function (grunt) {

	var bowerComponents = grunt.file.readJSON("bower_components.json");

	require('load-grunt-tasks')(grunt);

	//Using exclusion patterns slows down Grunt significantly
	//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
	//this method is used to create a set of inclusive patterns for all subdirectories
	//skipping node_modules, bower_components, dist, and any .dirs
	//This enables users to create any directory structure they desire.
	var createFolderGlobs = function (fileTypePatterns) {
		fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
		var ignore = ['node_modules', 'bower_components', 'dist', 'temp', 'Scripts', 'obj'];
		var fs = require('fs');
		return fs.readdirSync(process.cwd())
				.map(function (file) {
					if (ignore.indexOf(file) !== -1 ||
							file.indexOf('.') === 0 ||
							!fs.lstatSync(file).isDirectory()) {
						return null;
					} else {
						return fileTypePatterns.map(function (pattern) {
							return file + '/**/' + pattern;
						});
					}
				})
				.filter(function (patterns) {
					return patterns;
				})
				.concat(fileTypePatterns);
	};

	// Project configuration.
	grunt.initConfig({
		ngAnnotate: {
			dist: {
				options: {
					sourceMap: false
				},
				files: [{
						expand: true,
						src: ["src/**/*.js", "!src/**/*-spec.js"],
						dest: 'temp/dist/annotated/',
						ext: '.js'
					}]
			}
		},
		uglify: {
			dist: {
				options: {
					sourceMap: false
				},
				files: [
				{
						expand: true,
						flatten: true,
						src: ["temp/dist/annotated/**/*.js"],
						dest: 'dist/',
						ext: '.min.js'
					}
				]
			}
		},		
		concat: {
			distBowerScripts: {
				options: {
					sourceMap: false
				},
				src: [bowerComponents.vendor, bowerComponents.dev],
				dest: 'temp/bower_scripts.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc',
			},
			teamcity: {
				options: {
					force: true,
					reporter: 'checkstyle',
					reporterOutput: 'temp/reports/jshint_checkstyle.xml'
				},
				files: {src: [createFolderGlobs('*.js')]}
			},
			src: {
				options: {
					force: true
				},
				files: {src: [createFolderGlobs('*.js')]}
			}
		},
		jasmine: {
			tests: {
				src: ['src/**/*.js', '!src/**/*-spec.js'],
				options: {
					junit: {path: "temp/reports/jasmine_junit"},
					specs: 'src/**/*-spec.js',
					vendor: ["temp/bower_scripts.js"],
					outfile: 'temp/specrunner.html',
					keepRunner: true
				}
			}
		},
		connect: {
			tests: {
				options: {
					port: 9001,
					open: 'http://localhost:9001/temp/specrunner.html'
				}
			}
		},
		watch: {
			options: {
				livereload: true,
				atBegin: true
			},
			js: {
				files: ['src/**/*.js', '!src/**/*-spec.js'],
				tasks: ['ngAnnotate:dist', 'uglify:dist']
			},
			devJs: {
				files: ['bower_components/**/*.js', 'bower_components.json'],
				tasks: ['distBowerScripts']
			},
			bower: {
				files: ['bower.json'],
				tasks: ['bowerinstall']
			},
			tests: {
				files: ['src/**/*-spec.js'],
				tasks: ['jasmine:tests:build']
			}
		},
		clean: {
			dist: ['dist', 'temp/dist'],
			temp: ['temp']
		},
		concurrent: {
			build: ['concat:vendorScripts', 'concat:vendorDevScripts', 'less:app', 'jasmine:tests:build']
		}
	});

	grunt.registerTask('bowerinstall', 'install the backend and frontend dependencies', function () {
		var exec = require('child_process').exec;
		var cb = this.async();
		exec('bower install', {cwd: ''}, function (err, stdout, stderr) {
			console.log(stdout);
			cb();
		});
	});
	grunt.registerTask('lint', 'Runs code quality inspections', ['jshint:src']);
	grunt.registerTask('lintTeamcity', 'Runs code quality inspections and generates reports for teamcity', ['jshint:teamcity']);
	grunt.registerTask('tests', 'Runs jasmine tests', ['concat:distBowerScripts', 'jasmine:tests']);
	grunt.registerTask('debugTests', 'Debugs jasmine tests.', ['build', 'connect:tests', 'watch:tests']);
	grunt.registerTask('dist', [
		'clean:dist',
		'ngAnnotate:dist',
		'uglify:dist',]);
};
