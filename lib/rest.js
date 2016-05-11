"use strict";

const MW = require( './mw' );
const Log = require( 'debug' )( 'app:lib:rest' );

module.exports = ( modelname, router, name = modelname ) => {

	router.post( `/${name}`,
        MW.create( modelname )
    );
	router.put( `/${name}:id`,
		MW.find( modelname ),
		MW.modify( modelname )
	);
	router.get( `/${name}:id?`,
        MW.find( modelname ),
		MW.respond( modelname )
    );

};
