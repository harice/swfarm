define([
	'backbone',
	'models/account/AccountModel',
	'collections/base/AppCollection',
], function(Backbone, AccountModel, AppCollection){
    
	var AccountTruckerCollection = AppCollection.extend({
		url: '/apiv1/pickupschedule/getTruckerAccount',
		model: AccountModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		formatURL: function (data) {
			this.url = this.getDefaultURL() + '?search=' + data;
		},
	});

	return AccountTruckerCollection;
});