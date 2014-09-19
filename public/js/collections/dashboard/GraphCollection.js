define([
	'backbone',
	'models/dashboard/GraphModel',
	'collections/base/AppCollection',
], function(Backbone, GraphModel, AppCollection){
    
	var GraphCollection = AppCollection.extend({
		url: '/apiv1/dashboard',
		model: GraphModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		fetchGraphData: function (graphId, dateFrom, dateTo){
			var params = {};
			
			if(graphId != null)
				params['graphId'] = graphId;
				
			if(dateFrom != null)
				params['dateFrom'] = dateFrom;
				
			if(dateTo != null)
				params['dateTo'] = dateTo;
			
			this.url = this.getDefaultURL() + '?' + $.param(params);			
			this.getModels();			
		},
	});

	return GraphCollection;
});