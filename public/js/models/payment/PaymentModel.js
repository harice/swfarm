define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var PaymentModel = Backbone.Model.extend({		
		urlRoot: '/apiv1/payment',
		defaults: {
        },

		runFetch: function () {
			var thisObj = this;            
						
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.PAYMENT, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
			
		},
	});

	return PaymentModel;

});