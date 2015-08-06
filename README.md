# dx-phantomcss

[CasperJS](http://casperjs.org/) and [PhantomCSS](https://github.com/Huddle/PhantomCSS) wrapper for NodeJS environment 

Provides simple cli proxying everything to `casperjs` launched via `child_process.execFile`.
Supports fileglobs as `casperjs` test files.
Includes basic `phantomcss` config for integration with TeamCity

## Installation

```console
$ npm install --save devex-web-frontend/dx-phantomcss
```

## CLI

### Configuration --includes

Provide configuration override for phantomcss (will be fixed as soon as [#127](https://github.com/Huddle/PhantomCSS/pull/127) is merged):

```js
//includes.js
var fs = require('fs');

//FIXME after PR merge in Huddle/PhantomCSS
var libraryRoot = fs.absolute(fs.workingDirectory + '/node_modules/dx-phantomcss/node_modules/phantomcss');
var phantomcss = require(libraryRoot);

var phantomcssConfig = require('dx-phantomcss/config/phantomcss.js');
phantomcssConfig.libraryRoot = libraryRoot;
phantomcss.init(phantomcssConfig);
```

Basic configuration `config/phantomcss.js`:
```js
var fs = require('fs');

//Be carefull setting absolute paths here because of dull replacement in onComplete callback
var config = {
	libraryRoot: './node_modules/phantomcss',
	screenshotRoot: './phantomcss/screenshots',
	failedComparisonsRoot: './phantomcss/failures',
	comparisonResultRoot: './phantomcss/results',
	prefixCount: true,
	addLabelToFailedImage: false,
	onComplete: function onComplete(tests) {
		tests.forEach(function(test) {
			var diff = fs.absolute(test.filename.replace(/\.png$/, '.diff.png'));
			var overwrite = fs.absolute(test.filename.replace(this.comparisonResultRoot, this.screenshotRoot));
			if (fs.exists(diff)) {
				if (fs.exists(overwrite)) {
					fs.remove(overwrite);
				}
				fs.copy(diff, overwrite);
			}
		});
	}
};

module.exports = config;
```

Run with command:

```sh
dx-phantomcss test test/**/*.casper.js --includes=includes.js
```

Or add to package.json scripts section
```json
{
	"scripts": {
		"test": "dx-phantomcss test test/**/*.casper.js --includes=includes.js"
	}
}
```

### Commands

#### `test`
Runs CasperJS test command.
According to basic configuration and test suits `phantomcss/screenshots` directory is created on the first run containing screenshots from test suits.
All next runs will compare new screenshots with baselines in `phantomcss/screenshots`. All failures are registered in `phantomcss/failures` directory.

#### `*`
Everything rest is proxied to casperjs

## API
API can be accessed via `require('dx-phantomcss')` in test files;

### Methods
#### `resolveRelative(relative)` Returns absolute path for relative file
	*Parameters*
		`relative {String}` relative path from current executed test suit
	*Returns*
		`{String}` absolute path

#### `findRelative(relative)` Acts similar to resolveRealtive, but checks if file exists and adds `file:///` protocol
	*Parameters*
		`relative {String}` relative path from current executed test suit
	*Returns*
		`{String}` absolute path with `file:///` protocol
	*Throws*
		`Error`
#### `stripSelector(selector, modifier)` Gets file name from selector replacing non-word characters
	*Parameters*
		`selector {String}` any css-selector
		`[modifier] {String}` optional modifier which will be added to the end of result string
	*Returns*
		`{String}` filename with all non-word characters replaced with '_'
		
## Usage

Example of test suit:
```js
var phantomcss = require('dx-phantomcss/node_modules/phantomcss'); //FIXME after PR merge in Huddle/PhantomCSS
var dxphantomcss = require('dx-phantomcss');

var buttons = [
	'.button-trade',
	'.button-trade.button-sell',
	'.button-trade.button-buy',
	'.button-primary',
	'.button-secondary',
	'.button-primary.button-sell',
	'.button-primary.button-buy',
	'.button-primary.button-warning',
	'.button-disabled'
];

var container = '.test--block-extraLarge';

casper.test.begin('Button', function(test) {
	var testFile = dxphantomcss.findRelative('./compiled/button.html');
	casper.start(testFile);
	casper.viewport(1024, 768);
	phantomcss.turnOffAnimations();

	buttons.forEach(function(selector) {
		selector = container + ' ' + selector;
		casper
			.then(function() {
				phantomcss.screenshot(selector, dxphantomcss.stripSelector(selector));
			})
			.then(function() {
				this.mouse.move(selector);
			})
			.then(function() {
				phantomcss.screenshot(selector, dxphantomcss.stripSelector(selector, 'hover'));
			})
			.then(function() {
				this.mouse.down(selector);
			})
			.then(function() {
				phantomcss.screenshot(selector, dxphantomcss.stripSelector(selector, 'active'));
			})
			.then(function() {
				this.mouse.up(selector);
			});
	});

	casper.then(function() {
		phantomcss.compareAll();
	});
	casper.run(function() {
		test.done();
	});
});
```