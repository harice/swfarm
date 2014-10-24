define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var WoeIdModel = Backbone.Model.extend({		
		urlRoot: '',
		defaults: {
			woeid: ''
                },

                initialize: function(options){
                	var address = options.city + ' ' + options.country;
                        var url = 'http://query.yahooapis.com/v1/public/yql?q=';
                        var query = 'select * from geo.placefinder where text=' +"\'" + address + "\'" + '&format=json&diagnostics=true&callback=';   	

                        this.urlRoot = url + query;
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

	return WoeIdModel;

});