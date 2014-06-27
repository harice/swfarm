define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/POWeightInfoModel',
], function(Backbone, ListViewCollection, POWeightInfoModel){
	var POWeightInfoCollection = ListViewCollection.extend({
		url: '/apiv1/weightticket/getAllWeightticketOfOrder',
		model: POWeightInfoModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'date',
					sort: {
						date: false,
					},
				}
			);
			this.listView.lookUpIds.order_id = option.id;
		},
	});

	return POWeightInfoCollection;
});
