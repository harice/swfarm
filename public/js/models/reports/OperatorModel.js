define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var OperatorModel = Backbone.Model.extend({
		
		urlRoot: '/apiv1/report/operator-pay',
		defaults: {

        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Global.getGlobalVars().app_router.navigate(Const.URL.REPORT, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
        
        label: function () {
            return this.get('name');
        }
	});

	return OperatorModel;

});
