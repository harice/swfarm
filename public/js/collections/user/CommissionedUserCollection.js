define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/user/UserModel',
	'constant',
], function(Backbone, ListViewCollection, UserModel, Const){

	var CommissionedUserCollection = ListViewCollection.extend({
		url: '/apiv1/commission/users',
		model: UserModel,
		
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'lastname',
			sort: {
				firstname: true,
				lastname: true,
				email: true,
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
		
		initialize: function(){
			this.setDefaultURL(this.url);
		},
	});

	return CommissionedUserCollection;
});
