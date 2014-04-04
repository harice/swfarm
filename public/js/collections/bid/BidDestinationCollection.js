define([
	'backbone',
	'collections/base/AppCollection',
	'models/bid/BidDestinationModel',
], function(Backbone, AppCollection, BidDestinationModel){
	var BidDestinationCollection = AppCollection.extend({
		url: '/apiv1/bid/getDestination',
		model: BidDestinationModel,
		initialize: function(){
			
		},
	});

	return BidDestinationCollection;
});
