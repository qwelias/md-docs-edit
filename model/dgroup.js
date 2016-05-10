"use strict";

const mongoose = require( "mongoose" );
const createdModifiedPlugin = require( 'mongoose-createdmodified' ).createdModifiedPlugin;

mongoose.Promise = global.Promise;

const groupSchema = new mongoose.Schema( {
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true
	},
	order: {
		type: Number,
		min: 0
	}
} );

groupSchema.plugin(createdModifiedPlugin, {index: true});

const Group = mongoose.model('dgroup', groupSchema);

module.exports = Group;
