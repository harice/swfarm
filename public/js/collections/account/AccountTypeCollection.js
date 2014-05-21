define([
	'backbone',
	'collections/base/AppCollection',
	'models/account/AccountTypeModel',
], function(Backbone, AppCollection, AccountTypeModel){
	var AccountTypeCollection = AppCollection.extend({
		url: '/apiv1/account/truckerAccountTypes',
		model: AccountTypeModel,
		initialize: function(){
			this.setDefaultURL(this.url);
		},
	});

	return AccountTypeCollection;
});
