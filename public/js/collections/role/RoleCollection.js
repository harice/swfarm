define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/role/RoleModel',
	'constant'
], function(Backbone, ListViewCollection, RoleModel, Const){
	var RoleCollection = ListViewCollection.extend({
		url: '/apiv1/roles',
		model: RoleModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'name',
			sort: {
				name: true,
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},
		initialize: function(){
			this.setDefaultURL('/apiv1/roles');
		},
		
		getAllModels: function () {
			var thisObj = this;
			this.setGetAllURL();
			this.fetch({
				success: function (collection, response, options) {
				},
				error: function (collection, response, options) {
					if(typeof response.responseJSON.error == 'undefined')
						alert(response.responseJSON);
					else
						alert(response.responseText);
				},
				headers: thisObj.getAuth(),
			})
		},
		
		setGetAllURL: function () {
			this.url = this.getDefaultURL()+'/all';
		},
	});

	return RoleCollection;
});
