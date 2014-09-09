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
	});

	return GraphCollection;
});