define([
	'backbone',
	'collections/base/AppCollection',
	'models/inventory/LocationTransactionTypeModel',
], function(Backbone, AppCollection, StackLocationModel){
	var LocationTransactionTypeCollection = AppCollection.extend({
		url: '/apiv1/inventory/transactiontype',
		model: StackLocationModel,
		initialize: function() {
			this.setDefaultURL(this.url);
		},
	});

	return LocationTransactionTypeCollection;
});
