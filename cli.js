#!/usr/bin/env node

var cp = require('child_process');
var path = require('path');
var glob = require('glob');

var root = path.dirname(__filename);
var cwd = process.cwd();

var PHANTOMJS_EXECUTABLE = path.resolve(root, 'node_modules', 'casperjs', 'node_modules', '.bin', 'phantomjs');
process.env['PHANTOMJS_EXECUTABLE'] = PHANTOMJS_EXECUTABLE;

var CASPERJS_EXECUTABLE = path.resolve(root, 'node_modules', '.bin', 'casperjs');
if (process.platform === 'win32') {
	CASPERJS_EXECUTABLE += '.cmd';
}

var argv = process.argv.slice(2);
if (argv.length === 0) {
	throw new Error('Please specify some arguments!');
}
//iterate over argv and expand if glob
argv = argv.map(function(arg) {
	if (glob.hasMagic(arg)) {
		return glob.sync(arg).join(' ');
	} else {
		return arg;
	}
});

cp.execFileSync(CASPERJS_EXECUTABLE, argv, {
	stdio: 'inherit'
});