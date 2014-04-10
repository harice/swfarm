define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POScheduleModel',
	'collections/bid/BidCollection',
], function(Backbone, ListViewCollection, POScheduleModel, BidCollection){
	var POScheduleCollection = BidCollection.extend({
		url: '/apiv1/pickupschedule',
		model: POScheduleModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'pickupdate',
					sort: {
						pickupdate: true,
					},
				}
			);
			this.listView.lookUpIds.bidId = option.id;
		},
	});

	return POScheduleCollection;
});
