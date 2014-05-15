define([
	'backbone',
	'models/account/AccountModel',
	'collections/base/AppCollection',
], function(Backbone, AccountModel, AppCollection){
    
	var AccountAutocompleteCollection = AppCollection.extend({
		url: '/apiv1/account/getAccountsByName',
		model: AccountModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
	});

	return AccountAutocompleteCollection;
});