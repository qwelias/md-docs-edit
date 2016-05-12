/**
 * @overview Rebuild user relative documentation.
 * @module lib/mkdoc
 * @type {function}
 * @author Elias Baryshnikov <qwelias@gmail.com>
 */

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

mkdirp.sync( path.resolve( config.root, config.doc.path ) );


/**
 * Recursively parse an object structure to a page structure. Is not pure.
 * @param {array} struct - elements of a layer of an object structure
 * @param {array} wo - elements of a layer of a page structure
 */
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


/**
 * Mkdocs rebuild function.
 * Gathers all existing user doc and groups of docs, creates on objects structure from them according to order.
 * Generates a mkdocs.yml config file from
 */
const rebuild = () => {
	const Doc = mongoose.model( 'ddoc' );
	const Group = mongoose.model( 'dgroup' );

	return Promise.all( [ Doc.find().exec(), Group.find().exec() ] ).then( ( [ docs, groups ] ) => {
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

		this.mkdocs.site_dir = path.resolve( config.root, config.doc.path, this.mkdocs.site_dir );
		this.mkdocs.docs_dir = path.resolve( config.root, config.doc.path, this.mkdocs.docs_dir );

		Log( 'CONFIG', YAML.stringify( this.mkdocs ) );

		rimraf.sync( path.resolve( this.mkdocs.docs_dir ) );
		mkdirp.sync( path.resolve( this.mkdocs.docs_dir ) );

		return Promise.all( docs.map( d => {
			return new Promise( ( resolve, reject ) => {
				fs.writeFile(
					path.resolve( this.mkdocs.docs_dir, d.fileName ),
					d.body,
					e => e ? reject( e ) : resolve()
				)
			} )
		} ) );
	} ).then( () => {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile(
				path.resolve( config.root, config.doc.path, 'mkdocs.yml' ),
				YAML.stringify( this.mkdocs ),
				e => e ? reject( e ) : resolve()
			)
		} );
	} ).then( () => {
		return new Promise( ( resolve, reject ) => {
			child.exec( `mkdocs build -q -c -f ${path.resolve( config.root, config.doc.path, 'mkdocs.yml' )}`, ( e, stdo, stde ) => {
				if ( e ) reject( e );
				else resolve();
			} );
		} );
	} ).then( () => {
		return new Promise( ( resolve, reject ) => {
			fs.readFile( path.resolve( this.mkdocs.site_dir, 'mkdocs', 'search_index.json' ), {
				encoding: 'utf-8'
			}, ( e, data ) => e ? reject( e ) : resolve( data ) );
		} );
	} ).then( index => {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile(
				path.resolve( this.mkdocs.site_dir, 'mkdocs', 'search_index.json' ),
				index,
				e => e ? reject( e ) : resolve()
			);
		} );
	} ).catch( e => {
		Log( e.stack || e );
	} );
};

module.exports = rebuild;
