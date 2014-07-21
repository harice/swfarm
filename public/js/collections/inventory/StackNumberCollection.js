define([
	'backbone',
	'collections/base/AppCollection',
	'models/inventory/StackNumberModel',
], function(Backbone, AppCollection, StackLocationModel){
	var StackNumberCollection = AppCollection.extend({
		url: '/apiv1/inventory/stacklist',
		model: StackLocationModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
	});

	return StackNumberCollection;
});
