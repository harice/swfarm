define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ContactModel = Backbone.Model.extend({
        urlRoot: '/apiv1/contact',
		defaults: {
            name: '',
            account: '',
            position: '',
            email: '',
            phone: '',
            mobile: '',
        },
		runFetch: function () {
			var thisObj = this;
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.CONTACT, {trigger: true});
					}
				},
				error: function(model, response, options) {
                    
				},
				headers: thisObj.getAuth(),
			});
		},
	});

	return ContactModel;

});
