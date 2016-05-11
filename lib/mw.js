"use strict";

const mongoose = require( 'mongoose' );
const Log = require( 'debug' )( 'app:lib:mw' );

const create = ( modelname ) => {
	const model = mongoose.model( modelname );
	return ( req, res, next ) => {
		model.create( req.body ).then( ( doc ) => {
			res.status( 200 ).end();
		} ).catch( ( e ) => {
			Log( e.stack || e );
			res.status( 400 ).end();
		} );
	};
};

const find = ( modelname ) => {
	const model = mongoose.model( modelname );
	return ( req, res, next ) => {
		let q = req.params.id;
		if ( q ) q = {
			_id: q
		};
		else q = null;
		model.find( q ).then( ( doc ) => {
			if ( !doc ) return res.status( 404 ).end();
			req.locals[ modelname ] = doc;
			next();
		} ).catch( ( e ) => {
			Log( e.stack || e );
			res.status( 400 ).end();
		} );
	};
};

const modify = ( modelname ) => {
	return ( req, res, next ) => {
		let doc = req.locals[ modelname ];
		Object.assign( doc, req.body );
		doc.save().then( ( doc ) => {
			res.status( 200 ).end();
		} ).catch( ( e ) => {
			Log( e.stack || e );
			res.status( 400 ).end();
		} );
	};
};

const respond = ( modelname ) => {
	return ( req, res, next ) => {
		res.json( {
			result: modelname ? req.locals[ modelname ] : req.locals
		} )
	};
};

module.exports = {
	create,
	modify,
	find,
	respond
};
