define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var CurrentLocationModel = Backbone.Model.extend({		
		urlRoot: 'http://ipinfo.io/json',
		defaults: {
			woeid: ''
                },

                initialize: function(options){
                	this.runFetch();	        	
                },	

                runFetch: function(){
                	var thisObj = this;

                	this.fetch({
                		success: function(model, response, options){        			
                		},
                		error: function(model, response, options){},
                		headers: thisObj.getAuth(),
                	});
                },

	});

	return CurrentLocationModel;

});