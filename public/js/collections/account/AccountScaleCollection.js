define([
	'backbone',
	'models/account/AccountModel',
	'collections/base/AppCollection',
], function(Backbone, AccountModel, AppCollection){
    
	var AccountScaleCollection = AppCollection.extend({
		url: '/apiv1/weightticket/getAllScaleProviderAccount',
		model: AccountModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		formatURL: function (data) {
			this.url = this.getDefaultURL() + '?search=' + data;
		},
	});

	return AccountScaleCollection;
});