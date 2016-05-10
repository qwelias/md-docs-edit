"use strict";

const express = require( 'express' );
const rest = require( '../lib/rest' );
const models = require( '../requireAll' )( './model' );

const router = express.Router();

Object.keys( models ).map( m => {
	rest( m, router );
} );

module.exports = router;
