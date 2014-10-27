define([
	'backbone',
], function(Backbone){
    
	var WeatherCollection = Backbone.Collection.extend({
		query: 'select item from weather.forecast where woeid in (select woeid from geo.places where text=',
		url: 'http://query.yahooapis.com/v1/public/yql',
		format: 'json',
		timeout: 10000,
		dataType: 'jsonp',	

		initialize: function(options){			
			var city = '';
			var region = '';

			if(options.city != null){
				city = options.city + ' ';
			}

			if(options.region != null)
				region = options.region + ' ';

			var address = city + region + options.country;
			
			
			this.query += '\"' + address + '\"' + ') and u="c"';
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