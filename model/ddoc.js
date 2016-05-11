"use strict";

const mongoose = require( "mongoose" );
const mkdRebuild = require( "../lib/mkdoc" );
const createdModifiedPlugin = require( 'mongoose-createdmodified' ).createdModifiedPlugin;

mongoose.Promise = global.Promise;

const docSchema = new mongoose.Schema( {
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'dgroup'
	},
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true
	},
	file: {
		type: String,
		required: false,
		trim: true,
		unique: true,
		index: true
	},
	body: {
		type: String,
		required: true,
		trim: true,
		text: true
	},
	order: {
		type: Number,
		min: 0
	}
} );

docSchema.set( 'toJSON', {
	virtuals: true
} );
docSchema.set( 'toObject', {
	virtuals: true
} );

docSchema.virtual( 'fileName' ).get( function () {
	return this.file || `${this.name.split(' ').join('_')}.md`.toLowerCase();
} );

docSchema.plugin( createdModifiedPlugin, {
	index: true
} );

docSchema.post('save', mkdRebuild);

const Doc = mongoose.model( 'ddoc', docSchema );

module.exports = Doc;
