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
		bootstrapvalidator: 'libs/bootstrap/bootstrap-validator',
		jqueryflot: 'libs/jquery.flot/jquery.flot',
		jqueryflotresize: 'libs/jquery.flot/jquery.flot.resize.min',
		jqueryflotlabels: 'libs/jquery.flot/jquery.flot.labels',
		jqueryflotstackpercent: 'libs/jquery.flot/jquery.flot.stackpercent',
		jqueryflotbarnumbers: 'libs/jquery.flot/jquery.flot.barnumbers',
		bootstrapmultiselect: 'libs/bootstrap.multiselect/js/bootstrap-multiselect',
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
        throbber: 'libs/jquery.throbber/jquery.throbber',

		templates: '../templates'
	},
	shim: {
		'base64': {
			deps:['jquery'],
			exports: 'Base64'
		},
		'backbone': {
			deps: ['underscore', 'jquery', 'bootstrap', 'growl', 'jquerygritter', 'jqueryselect', 'icheck', 'jquerypushmenu','jquerynanoscroller','behaviourcore', 'maskedinput'],
			exports: 'Backbone'
		},		

		'jqueryflot': {
			deps: ['jquery'],
			exports: 'Flot'
		},

		'jqueryflotresize': {
			deps: ['jquery', 'jqueryflot'],
			exports: 'FlotResize'
		},

		'jqueryflotlabels': {
			deps: ['jquery', 'jqueryflot'],
			exports: 'FlotLabels'
		},	

		'jqueryflotstackpercent': {
			deps: ['jquery', 'jqueryflot'],
			exports: 'FlotStackPercent',
		},	

		'jqueryflotbarnumbers': {
			deps: ['jquery', 'jqueryflot'],
			exports: 'FlotBarNumbers'
		},		

		'bootstrapvalidator': {
			deps: ['jquery', 'bootstrap'],
			exports: 'DateValidator',
		},

		'bootstrapdatepicker': {
			deps: ['jquery', 'bootstrap', 'bootstrapvalidator'],
			exports: 'DatePicker',
		},		

		'bootstrapmultiselect': {
			deps: ['jquery', 'bootstrap'],
			exports: 'bootstrapMultiSelect',
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
        'throbber': {
			deps: ['jquery'],
			exports: 'Throbber',
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