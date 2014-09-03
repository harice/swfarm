define([
	'backbone',
], function(Backbone) {

	var StackLocationModel = Backbone.Model.extend({
		urlRoot: '/apiv1/storagelocation',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.STACKLOCATION, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return StackLocationModel;
});
