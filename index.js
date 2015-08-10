var fs = require('fs');
var system = require('system');
var phantomcss = require('phantomcss');

module.exports = {
	resolveRelative: resolveRelative,
	findRelative: findRelative,
	stripSelector: stripSelector
};

/**
 * Returns absolute path for relative file
 * @param {String} relative
 * @returns {String} absolute
 */
function resolveRelative(relative) {
	var old = fs.workingDirectory;
	//FIXME!!! research how to get current test script path! now it can be easily broken if you change args order
	//TODO: take path from casper.test.currentTestFile
	var current = fs.absolute(system.args[4]); //do not change arguments order to casperjs!
	current = current.substr(0, current.lastIndexOf('/')); //do not use fs.separator
	fs.changeWorkingDirectory(current);
	var result = fs.absolute(relative);
	fs.changeWorkingDirectory(old);
	return result;
}

/**
 * Acts similar to resolveRealtive, but checks if file exists and adds file:/// protocol
 * @param {String} relative
 * @returns {String} file
 */
function findRelative(relative) {
	var result = resolveRelative(relative);
	if (!fs.exists(result)) {
		throw new Error('Path ' + result + ' does not exist!');
	}
	return 'file:///' + result;
}

/**
 * Gets file name from selector replacing non-word characters
 * @param {String} selector
 * @param {String} [modifier]
 * @returns {String} filename
 */
function stripSelector(selector, modifier) {
	modifier = modifier ? ('_' + modifier) : '';
	return selector.replace(/\W/g, '_') + modifier;
}