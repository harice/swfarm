define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var AccountModel = Backbone.Model.extend({
		urlRoot: '/apiv1/account',
		defaults: {
            name: '',
            accounttype: [],
			website: '',
			description: '',
			phone: '',
			address: '',
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
        
        label: function () {
            return this.get('name');
        }
	});

	return AccountModel;

});
