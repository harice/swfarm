define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'constant',
], function(Backbone, ListViewCollection, PurchaseOrderModel, Const){
	var PurchaseOrderCollection = ListViewCollection.extend({
		url: '/apiv1/purchaseorder',
		model: PurchaseOrderModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: '',
			sort: {},
			filters: {
				location: '',
				status: '',
				transportstart: '',
				transportend: '',
			},
			filter: '',
			date: '',
			lookUpIds: {},
			collapseId: null,
			collapseLatestId: null,
		},
		initialize: function(option){
			//this.runInit();
			this.setDefaultURL(this.url);
			this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);
			
			/*this.listView.filters.location = '';
			this.listView.filters.status = '';
			this.listView.filters.transportstart = '';
			this.listView.filters.transportend = '';*/
		},
	});

	return PurchaseOrderCollection;
});
