define([
	'backbone',
], function(Backbone) {

	var TruckerModel = Backbone.Model.extend({
		urlRoot: '/apiv1/trailer',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.TRUCKER, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return TruckerModel;
});
