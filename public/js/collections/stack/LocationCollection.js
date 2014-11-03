define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/stack/StackLocationModel',
	'constant',
], function(Backbone, ListViewCollection, StackLocationModel, Const){
	var LocationCollection = ListViewCollection.extend({
		url: '/apiv1/storagelocation/locationlist',
		model: StackLocationModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'account_name',
			sort: {
				name: true,
                account_name: true
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

		initialize: function() {
			this.setDefaultURL(this.url);
		},
		
		getLocationByAccount: function (id) {
			this.url = '/apiv1/storagelocation/getByAccount/'+id;
			this.getModels();
		},
		
		getWarehouseLocation: function () {
			this.url = '/apiv1/storagelocation/warehouse';
			this.getModels();
		},

		getLocations: function () {
			this.url = '/apiv1/storagelocation/locations';
			this.getModels();
		},
	});

	return LocationCollection;
});
