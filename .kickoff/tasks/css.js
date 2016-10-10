/**
 * gulp css
 */

const config = require('../config');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const stylelint = require('gulp-stylelint');
const gulpIf = require('gulp-if');
const banner = require('gulp-banner');
var pkg = require('../../package.json');
var filesizegzip = require('filesizegzip');
var tap = require('gulp-tap');


// PostCSS plugins
const reporter = require('postcss-reporter');
const scss = require('postcss-scss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const bemLinter = require('postcss-bem-linter');
const doiuse = require('doiuse');


gulp.task('css', () => {
	return gulp.src([`./scss/**/*.scss`])
		.pipe(
			gulpIf(process.env.TEST,
				stylelint({
					reporters: [
						{
							formatter: 'string',
							console: true
						}
					]
				})
			)
		)


		.pipe(
			gulpIf(process.env.TEST,
				postcss([
					bemLinter(),
					doiuse({
						browsers: config.css.browsers,
						ignoreFiles: [
							'node_modules/**'
						]
					}),
					reporter({ clearMessages: true })
				],
				{ syntax: scss })
			)
		)

		// Sass Compilation
		.pipe(
			sass({
				importer: require('npm-sass').importer
			}).on('error', sass.logError)
		)

		// PostCSS tasks after Sass compilation
		.pipe(
			postcss([
				autoprefixer({ browsers: config.css.browsers })
			])
		)

		// Compress CSS
		.pipe(
			gulpIf(process.env.RELEASE === 'true',
				postcss([
					cssnano()
				])
			)
		)

		.pipe(banner(config.misc.banner, { pkg: pkg }))

		// Output filesize
		.pipe(
			tap((file, t) => {
				console.log('>>', file.relative, filesizegzip(file.contents, true));
			})
		)

		// Write file
		.pipe( gulp.dest(`.`) );
});

