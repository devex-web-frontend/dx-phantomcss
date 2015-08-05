var fs = require('fs');
var system = require('system');
var phantomcss = require('phantomcss');

module.exports = {
	resolveRelative: resolveRelative,
	findRelative: findRelative,
	captureSelector: captureSelector
};

/**
 * Returns absolute path for relative file
 * @param {String} relative
 * @returns {String} absolute
 */
function resolveRelative(relative) {
	var old = fs.workingDirectory;
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
 * Takes screenshot based on selector name and modifier
 * @param {String} selector
 * @param {String} [modifier]
 */
function captureSelector(selector, modifier) {
	modifier = modifier ? ('_' + modifier) : '';
	phantomcss.screenshot(selector, selector.replace(/\W/g, '_') + modifier);
}