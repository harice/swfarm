define([
	'backbone',
	'collections/base/AppCollection',
	'models/salesorder/CancellingReasonModel',
], function(Backbone, AppCollection, CancellingReasonModel){
	var CancellingReasonCollection = AppCollection.extend({
		url: '/apiv1/salesorder/getCancellingReasonList',
		model: CancellingReasonModel,
		initialize: function(){
			
		},
	});

	return CancellingReasonCollection;
});
