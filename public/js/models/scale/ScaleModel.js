define([
	'backbone',
], function(Backbone) {

	var ScaleModel = Backbone.Model.extend({
		urlRoot: '/apiv1/scale',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return ScaleModel;
});
