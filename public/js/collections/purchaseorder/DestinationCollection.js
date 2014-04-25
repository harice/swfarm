define([
	'backbone',
	'collections/base/AppCollection',
	'models/purchaseorder/DestinationModel',
], function(Backbone, AppCollection, DestinationModel){
	var DestinationCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getDestinationList',
		model: DestinationModel,
		initialize: function(){
			
		},
	});

	return DestinationCollection;
});
