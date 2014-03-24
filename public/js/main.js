// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
	paths: {
		jquery: 'libs/jquery/jquery-min',
		jqueryvalidate: 'libs/jquery/jquery.validate.min',
		jquerytextformatter: 'libs/jquery/jquery.textformatter',
		jqueryphonenumber: 'libs/jquery/jquery.phonenumber',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		underscore: 'libs/underscore/underscore-min',
		backbone: 'libs/backbone/backbone-min',
		base64: 'libs/base64/base64.min',
    growl: 'libs/bootstrap-growl/jquery.bootstrap-growl.min',
		templates: '../templates'
	},
	shim: {
		'base64': {
			deps:['jquery'],
			exports: 'Base64'
		},
		'backbone': {
			deps: ['underscore', 'jquery', 'bootstrap', 'growl'],
			exports: 'Backbone'
		},
		'bootstrap': {
			deps: ['jquery'],
			exports: 'Bootstrap'
		},
		'growl': {
			deps: ['jquery', 'bootstrap'],
			exports: 'Growl'
		},
		'underscore': {
			exports: '_'
		},
		'jqueryvalidate': {
			deps: ['jquery'],
			exports: 'Validate',
		},
		'jquerytextformatter': {
			deps: ['jquery'],
			exports: 'TextFormatter',
		},
		'jqueryphonenumber': {
			deps: ['jquery'],
			exports: 'PhoneNumber',
		},
		'jquery': {
			exports: '$'
		},
	},
});

require([
	// Load our app module and pass it to our definition function
	'app',

], function(App){
	// The "app" dependency is passed in as "App"
	// Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
	App.initialize();
});
