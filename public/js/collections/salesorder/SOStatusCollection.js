define([
	'backbone',
	'collections/base/AppCollection',
	'models/salesorder/SOStatusModel',
], function(Backbone, AppCollection, SOStatusModel){
	var SOStatusCollection = AppCollection.extend({
		url: '/apiv1/salesorder/getStatuses',
		model: SOStatusModel,
		initialize: function(){
			
		},
	});

	return SOStatusCollection;
});
