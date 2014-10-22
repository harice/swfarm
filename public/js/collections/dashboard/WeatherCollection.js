define([
	'backbone',
], function(Backbone){
    
	var WeatherCollection = Backbone.Collection.extend({
		query: 'select item.condition from weather.forecast where location="90210"',
		url: 'http://query.yahooapis.com/v1/public/yql',
		format: 'json',
		timeout: 10000,
		dataType: 'jsonp',

		initialize: function() {
			
		},

		fetch: function (options) {
			options = options ? _.clone(options) : {};
			options.data = options.data ? _.clone(options.data) : {};

			if (!options.data.q) {
				options.data.q = _.result(this, 'query')
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
			return response.query.results.channel.item.condition.text;
		},

		getLocation: function() {
			if(navigator.geolocation){
	            navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {timeout: 7000});//cache it for 10 minutes
	        }
	        else{
	            this.showError('Geo location not supported');
	        }
		},

		showError: function(msg) {
         if(msg.code){
            //this is a geolocation error
            switch(msg.code){
	            case 1:
	               console.log('Permission Denied');
	               break;
	            case 2:
	               console.log('Position Unavailable');
	               break;
	            case 3:
	               GETZIP.index++;
	               console.log('Timeout... Trying again');
	               navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {timeout: 7000});
	               break;
	            default:
	               //nothing
	        }
         }
         else{
           console.log("Failed");
         }
 
      },


				
	});

	return WeatherCollection;
});