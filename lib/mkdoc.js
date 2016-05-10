"use strict";

const mongoose = require( 'mongoose' );
const config = require( '../config' );
const child = require( "child_process" );
const rimraf = require( "rimraf" );
const mkdirp = require( "mkdirp" );
const path = require( "path" );
const fs = require( "fs" );
const YAML = require( "yamljs" );
const Log = require( 'debug' )( 'app:lib:mkdoc' );

mongoose.Promise = global.Promise;

const Doc = mongoose.model( 'ddoc' );
const Group = mongoose.model( 'dgroup' );

mkdirp.sync( path.resolve( config.root, config.doc.path ) );

Promise.all( [ Doc.find().exec(), Group.find().exec() ] ).then( ( [ docs, groups ] ) => {
	const struct = groups.concat(
		docs.filter( d => !d.group )
	).sort( ( a, b ) => a.order === undefined || a.order - b.order ).map( o => {
		if ( o.constructor.modelName == 'dgroup' ) {
			o.docs = docs.filter( d => String( d.group ) === String( o._id ) );
		}
		return o;
	} );

	const pages = [];
	rStruct( struct, pages );

	this.mkdocs = Object.assign( {}, config.doc.def, {
		pages
	} );

	Log( 'CONFIG', YAML.stringify( this.mkdocs ) );

	rimraf.sync( path.resolve( config.root, config.doc.path, 'docs' ) );
	mkdirp.sync( path.resolve( config.root, config.doc.path, 'docs' ) );

	return Promise.all( docs.map( d => {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile(
				path.resolve( config.root, config.doc.path, 'docs', d.fileName ),
				d.body,
				e => e ? reject( e ) : resolve()
			)
		} )
	} ) );
} ).then(() => {
	return new Promise( ( resolve, reject ) => {
		fs.writeFile(
			path.resolve( config.root, config.doc.path, 'mkdocs.yml' ),
			YAML.stringify( this.mkdocs ),
			e => e ? reject( e ) : resolve()
		)
	} )
}).then(() => {
	Log( 'DONE' );
}).catch( ( e ) => {
	Log( e.stack || e );
} );

const rStruct = ( struct, wo ) => {
	struct.map( o => {
		let el = {};
		if ( o.constructor.modelName == 'dgroup' ) {
			el[ o.name ] = [];
			wo.push( el );
			rStruct( o.docs, el[ o.name ] );
		} else {
			el[ o.name ] = o.fileName;
			wo.push( el );
		}
	} )
};
