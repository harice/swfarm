// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
	paths: {
		jquery: 'libs/jquery/jquery-min',
		jqueryui: 'libs/jquery/jquery-ui.custom.min',
		jqueryvalidate: 'libs/jquery/jquery.validate.min',
		jquerytextformatter: 'libs/jquery/jquery.textformatter',
		jqueryphonenumber: 'libs/jquery/jquery.phonenumber',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		bootstrapdatepicker: 'libs/bootstrap/bootstrap-datepicker',
		underscore: 'libs/underscore/underscore-min',
		backbone: 'libs/backbone/backbone-min',
        autocomplete: 'libs/fatiherikli/backbone-autocomplete/src/backbone.autocomplete',
		base64: 'libs/base64/base64.min',
        growl: 'libs/bootstrap-growl/jquery.bootstrap-growl.min',

        behaviourcore: 'libs/behaviour/core',
        jqueryparsley: 'libs/jquery.parsley/parsley',
        jquerypushmenu: 'libs/jquery.pushmenu/js/jPushMenu',
        jquerynanoscroller: 'libs/jquery.nanoscroller/jquery.nanoscroller',
		jquerysparkline: 'libs/jquery.sparkline/jquery.sparkline.min',
		jquerygritter: 'libs/jquery.gritter/js/jquery.gritter',
        jqueryselect: 'libs/jquery.select2/select2.min',
        icheck: 'libs/jquery.icheck/icheck.min',
        maskedinput: 'libs/jquery.maskedinput/jquery.maskedinput',
        nanoscroller: 'libs/jquery.nanoscroller/jquery.nanoscroller',

		templates: '../templates'
	},
	shim: {
		'base64': {
			deps:['jquery'],
			exports: 'Base64'
		},
		'backbone': {
			deps: ['underscore', 'jquery', 'bootstrap', 'growl', 'jquerygritter', 'jqueryselect', 'icheck', 'jquerypushmenu','jquerynanoscroller','behaviourcore', 'maskedinput', 'nanoscroller'],
			exports: 'Backbone'
		},
		'bootstrapdatepicker': {
			deps: ['jquery'],
			exports: 'DatePicker',
		},

		'behaviourcore': {
			deps: ['jquery','bootstrap'],
			exports: 'BehaviourCore'
		},
		'jqueryparsley': {
			deps: ['jquery'],
			exports: 'Parsley'
		},
		'jquerypushmenu': {
			deps: ['jquery'],
			exports: 'PushMenu'
		},
		'jquerynanoscroller': {
			deps: ['jquery'],
			exports: 'NanoScroller'
		},
		'jquerysparkline': {
			deps: ['jquery'],
			exports: 'SparkLine'
		},
		'jquerygritter': {
			deps: ['jquery'],
			exports: 'Gritter'
		},

		'bootstrap': {
			deps: ['jquery'],
			exports: 'Bootstrap'
		},
        'growl': {
			deps: ['jquery', 'bootstrap'],
			exports: 'Growl'
		},
        'autocomplete': {
            deps: ['backbone'],
            exports: 'AutoComplete'
        },
		'underscore': {
			exports: '_'
		},
		'jqueryui': {
			deps: ['jquery'],
			exports: 'JqueryUI',
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
        'jqueryselect': {
			deps: ['jquery'],
			exports: 'Select 2',
		},
        'icheck': {
			deps: ['jquery'],
			exports: 'iCheck',
		},
        'maskedinput': {
			deps: ['jquery'],
			exports: 'MackedInput',
		},
        'nanoscroller': {
			deps: ['jquery'],
			exports: 'Nano Scroller',
		},
		'jquery': {
			exports: '$'
		},
	},
	waitSeconds: 0
});

require([
	// Load our app module and pass it to our definition function
	'app',

], function(App){
	// The "app" dependency is passed in as "App"
	// Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
	(function($){
		$(document).ready(function(){
			App.initialize();
		});
	})(jQuery);
});