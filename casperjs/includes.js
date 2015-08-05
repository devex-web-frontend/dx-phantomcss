var fs = require('fs');
var phantomcss = require('phantomcss');
var system = require('system');

var libraryRoot = './node_modules/phantomcss';
var screenshotRoot = './phantomcss/screenshots';
var failedComparisonsRoot = './phantomcss/failures';
var comparisonResultRoot = './phantomcss/results';

phantomcss.init({
	libraryRoot: libraryRoot,
	screenshotRoot: screenshotRoot,
	failedComparisonsRoot: failedComparisonsRoot,
	comparisonResultRoot: comparisonResultRoot,
	prefixCount: true,
	addLabelToFailedImage: false,
	onComplete: function onComplete(tests) {
		tests.forEach(function(test) {
			//this function is a pain in the ass... facepalm, PhantomCSS
			var diff = fs.absolute(test.filename.replace(/\.png$/, '.diff.png'));
			var overwrite = fs.absolute(test.filename.replace(comparisonResultRoot, screenshotRoot));
			if (fs.exists(diff)) {
				if (fs.exists(overwrite)) {
					fs.remove(overwrite);
				}
				fs.copy(diff, overwrite);
			}
		});
	}
});

casper.on('remote.message', function(msg) {
	this.echo(msg);
});

casper.on('error', function(err) {
	this.die('PhantomJS has errored: ' + err);
});

casper.on('resource.error', function(err) {
	casper.log('Resource load error: ' + err, 'warning');
});