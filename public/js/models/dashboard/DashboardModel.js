define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var DashboardModel = Backbone.Model.extend({
		
		urlRoot: '',
		defaults: {
        },

		runFetch: function () {
			var thisObj = this;            
						
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.DASHBOARD, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
			
		},


		fetchTotalPurchase: function (){
			this.urlRoot = '';
        	this.runFetch();
		}
	});

	return DashboardModel;

});