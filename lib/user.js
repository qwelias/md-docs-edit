"use strict";

const Log = require("debug")("app:user");
const mongoose = require("mongoose");
const config = require('../config');

mongoose.Promise = global.Promise;

const User = mongoose.model(config.db.user.model, {});

module.exports = (req, res, next) => {
	let _id = config.db.user.getID(req.session);
	Log('current', _id);
	if(!_id) return next();

	User.findOne({
		_id: _id
	}).exec()
	.then(user => {
        if(!user) return res.status(400).end();
		if(config.db.user.pass(user)) return next();
		res.status(403).end();
	})
	.catch(e => {
		Log(e.stack || e);
		res.status(500).end();
	});
};
