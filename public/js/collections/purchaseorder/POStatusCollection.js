define([
	'backbone',
	'collections/base/AppCollection',
	'models/purchaseorder/POStatusModel',
], function(Backbone, AppCollection, POStatusModel){
	var POStatusCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getStatuses',
		model: POStatusModel,
		initialize: function(){
			
		},
	});

	return POStatusCollection;
});
