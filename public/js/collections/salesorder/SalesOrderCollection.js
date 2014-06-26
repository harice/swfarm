define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/salesorder/SalesOrderModel',
	'constant',
], function(Backbone, ListViewCollection, SalesOrderModel, Const){
	var SalesOrderCollection = ListViewCollection.extend({
		url: '/apiv1/salesorder',
		model: SalesOrderModel,
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
			/*this.setSortOptions(
				{
					currentSort: 'created_at',
					sort: {
						created_at: false,
					},
				}
			);
			
			this.listView.filters.location = '';
			this.listView.filters.status = '';
			this.listView.filters.natureofsale = '';
			this.listView.filters.transportstart = '';
			this.listView.filters.transportend = '';*/
		},
	});

	return SalesOrderCollection;
});
