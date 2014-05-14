define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/contact/ContactModel',
], function(Backbone, ListViewCollection, ContactModel){
	var ContactCollection = ListViewCollection.extend({
        url: '/apiv1/contact',
		model: ContactModel,
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/contact');
			this.setSortOptions(
				{
					currentSort: 'lastname',
					sort: {
						lastname: true,
						account: true,
					},
				}
			);
		},
		
		getContactsByAccountId: function (id) {
			this.url = '/apiv1/account/contact?accountId='+id;
			this.getModels();
		},
	});

	return ContactCollection;
});
