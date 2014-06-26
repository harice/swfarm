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
			this.setDefaultURL('/apiv1/account');
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
		
		getTruckerAccountsByAccountType: function (id) {
			this.url = '/apiv1/account/accountsByType?accountTypeId='+id;
			this.getModels();
		},
		
		getTrailerAccounts: function () {
			this.url = '/apiv1/account/trailer';
			this.getModels();
		},
		
		getLoaderAccounts: function () {
			this.url = '/apiv1/account/loader';
			this.getModels();
		},
		
		getScalerAccounts: function () {
			this.url = '/apiv1/account/scaler';
			this.getModels();
		},
                
        getCustomerAccounts: function () {
            this.url = '/apiv1/account?type=customer';
            this.getModels();
        }
	});

	return AccountCollection;
});
