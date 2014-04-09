define([
	'backbone',
	'models/account/AccountModel',
	'collections/base/AppCollection',
], function(Backbone, AccountModel, AppCollection){
    
	var AccountLoaderCollection = AppCollection.extend({
		url: '/apiv1/pickupschedule/getLoaderAccount',
		model: AccountModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
		formatURL: function (data) {
			this.url = this.getDefaultURL() + '?search=' + data;
		},
	});

	return AccountLoaderCollection;
});