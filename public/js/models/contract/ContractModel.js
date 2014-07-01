define([
	'backbone',
], function(Backbone) {

	var ContractModel = Backbone.Model.extend({
		urlRoot: '/apiv1/contract',
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
		},
        
        setCloseURL: function() {
            this.urlRoot = '/apiv1/contract/close';
        },
        
        setOpenURL: function() {
            this.urlRoot = '/apiv1/contract/open';
        }
	});
	return ContractModel;
});
