define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/account/AccountModel',
	'constant'
], function(Backbone, ListViewCollection, AccountModel, Const){
	var AccountCollection = ListViewCollection.extend({
		url: '/apiv1/account',
		model: AccountModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'name',
			sort: {
				name: true,
				accounttype:true,
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
		initialize: function(){
			this.setDefaultURL('/apiv1/account');			
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
            this.url = '/apiv1/account/customer';
            this.getModels();
        },
		
		getProducerAndWarehouseAccount: function () {
            this.url = '/apiv1/account/getProducerAndWarehouseAccount';
            this.getModels();
        },
	});

	return AccountCollection;
});
