define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/account/AccountModel',
], function(Backbone, ListViewCollection, AccountModel){
	var AccountCollection = ListViewCollection.extend({
		url: '/apiv1/account',
		model: AccountModel,
		
		initialize: function(){
			this.runInit();
			this.addDefaultURL('/apiv1/account');
			this.setSortOptions(
				{
					currentSort: 'name',
					sort: {
						name: true,
						accounttype:true,
					},
				}
			);
		},
	});

	return AccountCollection;
});
