define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ContactModel = Backbone.Model.extend({
        // urlRoot: '/apiv1/contact',
        url: '/json/contact.json',
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
						alert(response.message);
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
