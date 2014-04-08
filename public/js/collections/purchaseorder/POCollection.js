define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POModel',
	'collections/bid/BidCollection',
], function(Backbone, ListViewCollection, POModel, BidCollection){
	var POCollection = BidCollection.extend({
		url: '/apiv1/bid/getPurchaseOrder',
		model: POModel,
		initialize: function(){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'po_date',
					sort: {
						bidnumber: true,
						po_date: false,
						producer: true,
					},
				}
			);
			
			this.listView.filters.destination = '';
			this.listView.filters.status = '';
		},
	});

	return POCollection;
});
