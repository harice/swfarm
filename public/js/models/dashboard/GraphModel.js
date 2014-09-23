define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var GraphModel = Backbone.Model.extend({
		urlRoot: '/apiv1/dashboard',
		defaults: {},

		initialize: function() {
			this.defaultURL = this.urlRoot;
		},
		
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
				},
				error: function(model, response, options) {
				},
				headers: thisObj.getAuth(),
			});
		},
		
		fetchGraphData: function (graphId, dateFrom, dateTo){
			var params = {};
			
			if(graphId != null)
				params['graphId'] = graphId;
				
			if(dateFrom != null)
				params['dateFrom'] = dateFrom;
				
			if(dateTo != null)
				params['dateTo'] = dateTo;
			
			this.urlRoot = this.defaultURL + '?' + $.param(params);			
			this.runFetch();			
		},
	});

	return GraphModel;

});