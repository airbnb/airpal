# JavaScript

## Gulp
The frontend application uses Gulp for automation of some frontend stuff like
compiling the browserify code and for reloading the browser while developing.

To run the default configuration/tasks of gulp, just run `gulp` and you'll be
fine. If you want to build the JavaScript, just run simply `gulp build` (this
is also what the `pom.xml` does when running `mvn clean package`).

## Adding new gulp tasks
If you want to add more tasks, add them to the `gulp/tasks` folder and
don't forget to add the configuration in the `gulp/config.js` file.

More information about this gulp setup: [Gulp starter](https://github.com/greypants/gulp-starter).

# Stylesheet
The CSS files are following the CSS guidelines of Harry Roberts and can be
found at: http://cssguidelin.es

## Theming
It's possible to add your own theme (which probably will be based on bootstrap,
since it's used in the project).

It's recommended to use pure CSS instead of SASS, because it's very low level
and understood by everyone. But at the end: it's your own choice while
developing your own theme for Airpal.

To keep your code clean it's recommended to add your theme to the `stylesheets/
themes/` folder, but feel free to change it for your own needs.
