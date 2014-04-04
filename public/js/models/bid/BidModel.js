define([
	'backbone',
], function(Backbone) {

	var BidModel = Backbone.Model.extend({
		urlRoot: '/apiv1/bid',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.BID, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return BidModel;
});
