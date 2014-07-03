define([
	'backbone',
	'collections/base/AppCollection',
	'models/contract/SalesOrderDetailsByProductModel',
], function(Backbone, AppCollection, SalesOrderDetailsByProductModel){
	var SalesOrderDetailsByProductCollection = AppCollection.extend({
		url: '/apiv1/purchaseorder/getOrderWeightDetailsByStack',
		model: SalesOrderDetailsByProductModel,
		initialize: function(id){
			this.url = this.url+'?order_id='+id;
		},
	});

	return SalesOrderDetailsByProductCollection;
});
