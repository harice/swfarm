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
			this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);
			
			this.listView.filters.location = '';
			this.listView.filters.status = '';
			this.listView.filters.transportstart = '';
			this.listView.filters.transportend = '';
		},
	});

	return SalesOrderCollection;
});
