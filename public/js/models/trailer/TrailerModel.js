define([
	'backbone',
    'global',
    'constant'
], function(Backbone, Global, Const) {

	var TrailerModel = Backbone.Model.extend({
		urlRoot: '/apiv1/trailer',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error !== 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth()
			});
		}
	});
	return TrailerModel;
});
