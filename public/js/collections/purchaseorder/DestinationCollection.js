define([
	'backbone',
	'collections/base/AppCollection',
	'models/purchaseorder/DestinationModel',
], function(Backbone, AppCollection, BidDestinationModel){
	var DestinationCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getDestinationList',
		model: BidDestinationModel,
		initialize: function(){
			
		},
	});

	return DestinationCollection;
});
