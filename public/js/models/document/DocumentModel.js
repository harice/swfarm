define([
	'backbone',
], function(Backbone) {

	var DocumentModel = Backbone.Model.extend({
		urlRoot: '/apiv1/document',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						//Global.getGlobalVars().app_router.navigate(Const.URL.PO, {trigger: true});
						Backbone.history.history.back();
					}
					console.log('success');
					//window.location = response;
					window.open(response, '_blank');
				},
				error: function(model, response, options) {
					console.log('error');
					//window.location = response;
					window.open(response, '_blank');
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return DocumentModel;
});
