define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ContactModel = Backbone.Model.extend({
        urlRoot: '',
		defaults: {
            // name: '',
            // account: '',
            // position: '',
            // email: '',
            // phone: '',
            // mobile: '',
        },
		runFetch: function () {
			var thisObj = this;
			this.fetch({
				success: function(model, response, options) {	
					thisObj.trigger('fetch_model_success', model, response, options);	
							
					if(typeof response.error != 'undefined') {											
						//Global.getGlobalVars().app_router.navigate(Const.URL.NOTIFICATIONS, {trigger: true});
					}
				},
				error: function(model, response, options) {                    
					thisObj.trigger('fetch_model_error', model, response, options);
				},
				headers: thisObj.getAuth(),
			});
		},

		getNotificationCount: function(id) {
			this.urlRoot = '/apiv1/notification/getNumberOfNotification/' + id;
			this.runFetch();
		}
	});

	return ContactModel;

});
