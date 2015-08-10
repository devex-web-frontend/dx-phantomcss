var fs = require('fs');

var count = 0;

//Be carefull setting absolute paths here because of dull replacement in onComplete callback
var config = {
	libraryRoot: './node_modules/phantomcss',
	screenshotRoot: './phantomcss/screenshots',
	failedComparisonsRoot: './phantomcss/failures',
	comparisonResultRoot: './phantomcss/results',
	prefixCount: true,
	addLabelToFailedImage: false,
	fileNameGetter: function fileNameGetter(root, filename) {
		// globally override output filename
		// files must exist under root
		// and use the .diff convention
		//override filename to contain current test suite name
		var name = root + '/' + casper.test.currentSuite.name + '/' + count + '_' + filename;
		count++;
		if (fs.isFile(name + '.png')) {
			return name + '.diff.png'; //this is from PhantomCSS!
		} else {
			return name + '.png';
		}
	},
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