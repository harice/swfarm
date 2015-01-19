define([
	'backbone',
], function(Backbone){
    
	var WeatherCollection = Backbone.Collection.extend({
		query: 'select item from weather.forecast where woeid =',
		url: 'https://query.yahooapis.com/v1/public/yql',
		format: 'json',
		timeout: 10000,
		dataType: 'jsonp',	

		initialize: function(options){						

			this.query += options.woeid;			
		},		

		fetch: function (options) {	
			options = options ? _.clone(options) : {};
			options.data = options.data ? _.clone(options.data) : {};

			if (!options.data.q) {
				options.data.q = _.result(this, 'query');
			}
			if (!options.data.format) {
				options.data.format = _.result(this, 'format');
			}			

			return Backbone.Collection.prototype.fetch.call(this, options);
		},

		sync: function(method, model, options){
			options.timeout = _.result(this, 'timeout');
			options.dataType = _.result(this, 'dataType');

			return Backbone.sync(method, model, options);
		},

		parse: function(response) {
			return response;
		},		
				
	});

	return WeatherCollection;
});