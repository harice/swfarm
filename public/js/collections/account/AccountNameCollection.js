define([
	'backbone',
	'models/account/AccountNameModel',
], function(Backbone, AccountNameModel){
    
	var AccountNameCollection = Backbone.Collection.extend({
		url: '/apiv1/account/getAccountsByName',
		model: AccountNameModel,
	});

	return AccountNameCollection;
});
