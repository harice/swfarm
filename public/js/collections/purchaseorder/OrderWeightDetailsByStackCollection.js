define([
	'backbone',
	'collections/base/AppCollection',
	'models/purchaseorder/OrderWeightDetailsByStackModel',
], function(Backbone, AppCollection, OrderWeightDetailsByStackModel){
	var OrderWeightDetailsByStackCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getOrderWeightDetailsByStack',
		model: OrderWeightDetailsByStackModel,
		initialize: function(id){
			this.url = this.url+'?order_id='+id;
		},
	});

	return OrderWeightDetailsByStackCollection;
});
