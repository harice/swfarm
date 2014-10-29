define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/trucker/TruckerModel',
	'constant'
], function(Backbone, ListViewCollection, TruckerModel, Const){
	var TruckerCollection = ListViewCollection.extend({
		url: '/apiv1/truck',
		model: TruckerModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'trucknumber',
			sort: {
				trucknumber: true,
			},
			filters: {
				type: ''
			},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},

		initialize: function(option){
			this.setDefaultURL(this.url);
		},
		
		getTruckerNumbersByAccount: function (id) {
			this.url = '/apiv1/truck/listByAccount?accountId='+id;
			this.getModels();
		},
	});

	return TruckerCollection;
});
