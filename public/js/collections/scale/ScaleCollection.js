define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/scale/ScaleModel',
	'constant'
], function(Backbone, ListViewCollection, ScaleModel, Const){
	var ScaleCollection = ListViewCollection.extend({
		url: '/apiv1/scale',
		model: ScaleModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'name',
			sort: {
				name: true,
                account_name: true
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},

		initialize: function(option){
			this.setDefaultURL(this.url);			
		},
		
		getScalesByAccount: function (id) {
			this.url = '/apiv1/account/getScaleList?accountId='+id;
			this.getModels();
		},
	});

	return ScaleCollection;
});
