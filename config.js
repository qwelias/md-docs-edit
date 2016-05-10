module.exports = Object.freeze({
    root: __dirname,
    PORT: process.env.PORT || 3300,
    session: {
    	secret: process.env.SESSION_SECRET || 'test secret',
    	key: process.env.SESSION_KEY || 'test.sid',
    	cookie: {
    		path: '/',
    		httpOnly: true,
            domain: process.env.DOMAIN || '.test.com',
    		maxAge: 24*60*60*1000
    	},
    	maxAge: 24*60*60*1000,
    	secure: true,
    	store: null,
    	saveUninitialized: false,
    	resave: false
    },
    db:{
        url: process.env.DB_URL || 'mongodb://localhost/test',
        user:{
            model: 'user',
            pass: (user) => {
                return true;
            },
            getID: function(session){
                return session && session.passport && session.passport[this.model];
            }
        }
    },
    doc: {
        def: {
            site_name: 'Test',
            theme: 'readthedocs',
            site_dir: '../docs'
        },
        path: './public/mkdsrc'
    }
});
