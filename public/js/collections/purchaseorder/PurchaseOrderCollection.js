define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/PurchaseOrderModel',
], function(Backbone, ListViewCollection, PurchaseOrderModel){
	var PurchaseOrderCollection = ListViewCollection.extend({
		url: '/apiv1/purchaseorder',
		model: PurchaseOrderModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);
		},
	});

	return PurchaseOrderCollection;
});
