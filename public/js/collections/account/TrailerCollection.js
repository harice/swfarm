define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/account/TrailerModel',
	'constant'
], function(Backbone, ListViewCollection, TrailerModel, Const){
	var TrailerCollection = ListViewCollection.extend({
		url: '/apiv1/transportschedule/trailer',
		model: TrailerModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'lastname',
			sort: {
				lastname: true,
						account: true,
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},


		initialize: function(){
			this.setDefaultURL(this.url);
		},
		
		getTrailerByAccountId: function (id) {
			this.url = this.getDefaultURL()+'?accountId='+id;
			this.getModels();
		},
	});

	return TrailerCollection;
});
