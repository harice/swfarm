define([
	'backbone',
	'collections/base/AppCollection',
	'models/purchaseorder/CancellingReasonModel',
], function(Backbone, AppCollection, CancellingReasonModel){
	var CancellingReasonCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getCancellingReasonList',
		model: CancellingReasonModel,
		initialize: function(){
			
		},
	});

	return CancellingReasonCollection;
});
