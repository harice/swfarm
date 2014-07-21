define([
	'backbone',
], function(Backbone) {

	var TruckerModel = Backbone.Model.extend({
		urlRoot: '/apiv1/truck',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						Backbone.history.history.back();
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return TruckerModel;
});
