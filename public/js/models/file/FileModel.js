define([
	'backbone',
], function(Backbone) {

	var FileModel = Backbone.Model.extend({
		urlRoot: '/apiv1/file',
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
					window.location = response;
				},
				error: function(model, response, options) {
					console.log('error');
					window.location = response;
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return FileModel;
});
