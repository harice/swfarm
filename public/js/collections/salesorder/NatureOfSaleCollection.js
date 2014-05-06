define([
	'backbone',
	'collections/base/AppCollection',
	'models/salesorder/NatureOfSaleModel',
], function(Backbone, AppCollection, NatureOfSaleModel){
	var NatureOfSaleCollection = AppCollection.extend({
		url: '/apiv1/salesorder/getNatureOfSaleList',
		model: NatureOfSaleModel,
		initialize: function(){
			
		},
	});

	return NatureOfSaleCollection;
});
