define([
	'backbone',
], function(Backbone) {

	var InventoryModel = Backbone.Model.extend({
		urlRoot: '/apiv1/inventory',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Backbone.history.history.back();
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
	});
	return InventoryModel;
});
