define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/salesorder/SalesOrderModel',
], function(Backbone, ListViewCollection, SalesOrderModel){
	var SalesOrderCollection = ListViewCollection.extend({
		url: '/apiv1/salesorder',
		model: SalesOrderModel,
		initialize: function(option){
			this.runInit();
			this.setDefaultURL(this.url);
			/*this.setSortOptions(
				{
					currentSort: 'pickupdate',
					sort: {
						pickupdate: false,
					},
				}
			);*/
		},
	});

	return SalesOrderCollection;
});
