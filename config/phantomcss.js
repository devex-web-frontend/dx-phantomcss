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
			//this function is a pain in the ass... facepalm, PhantomCSS
			//TODO: reimplement file operations in PhantomCSS
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