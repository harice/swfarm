define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var WoeIdModel = Backbone.Model.extend({		
		urlRoot: 'https://query.yahooapis.com/v1/public/yql',               
		query: 'select * from geo.placefinder where text="', 
                format: 'json',
                timeout: 10000,
                dataType: 'jsonp',      

                initialize: function(options){ 

                        this.coord = options.latitude + ',' + options.longitude;
                        this.query += this.coord +'" and gflags="R"';     
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

                        return Backbone.Model.prototype.fetch.call(this, options);
                },

                sync: function(method, model, options){
                        options.timeout = _.result(this, 'timeout');
                        options.dataType = _.result(this, 'dataType');

                        return Backbone.sync(method, model, options);
                },               

        });

	return WoeIdModel;

});