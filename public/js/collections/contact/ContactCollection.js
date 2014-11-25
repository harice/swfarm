define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/contact/ContactModel',
	'constant'
], function(Backbone, ListViewCollection, ContactModel, Const){
	var ContactCollection = ListViewCollection.extend({
        url: '/apiv1/contact',
		model: ContactModel,
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
			this.setDefaultURL('/apiv1/contact');			
		},
		
		getContactsByAccountId: function (id) {
			this.url = '/apiv1/account/contact?accountId='+id;			
			this.getModels();			
		},

		getContactsByAccountType: function (id) {
			this.url = '/apiv1/contact?accountType='+ id + '&paginated=false';
			this.getModels();
		},
		
	});

	return ContactCollection;
});
