define([
	'backbone',
], function(Backbone) {

	var CommissionModel = Backbone.Model.extend({
		urlRoot: '/apiv1/commission',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.COMMISSION, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return CommissionModel;
});
