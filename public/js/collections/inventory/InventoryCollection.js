define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/inventory/InventoryModel',
	'constant',
], function(Backbone, ListViewCollection, InventoryModel, Const){
	var InventoryCollection = ListViewCollection.extend({
		url: '/apiv1/inventory/stackListByProduct',
		model: InventoryModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'created_at',
			sort: {
				created_at: false,
			},
			filters: {
				productId: '',
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
			/*this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);*/
		},
	});

	return InventoryCollection;
});
