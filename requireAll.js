"use strict";

const path = require("path");
const fs = require("fs");

module.exports = (dir) => {
	dir = path.resolve(dir);
	let classes = {};
	fs.readdirSync(dir).map((file) => {
		classes[file.split('.')[0]] = require(path.join(dir,file));
	});
	return classes;
};
