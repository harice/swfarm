define([
	'backbone',
], function(Backbone) {

	var SalesOrderModel = Backbone.Model.extend({
		urlRoot: '/apiv1/salesorder',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
		/*setCancelURL: function () {
			this.urlRoot = '/apiv1/bid/cancelBid';
		},*/
	});
	return SalesOrderModel;
});
