define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/stack/StackLocationModel',
	'constant',
], function(Backbone, ListViewCollection, StackLocationModel, Const){
	var StackLocationCollection = ListViewCollection.extend({
		url: '/apiv1/storagelocation',
		model: StackLocationModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'created_at',
			sort: {
				created_at: false,
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},
			collapseId: null,
			collapseLatestId: null,
			searchURLForFilter: true,
			otherData:{},
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

	return StackLocationCollection;
});
