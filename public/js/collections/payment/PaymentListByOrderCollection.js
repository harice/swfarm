define([
	'backbone',
	'collections/base/AppCollection',
	'models/payment/PaymentListByOrderModel',
], function(Backbone, AppCollection, PaymentListByOrderModel){

	var PaymentListByOrderCollection = AppCollection.extend({
		url: '/apiv1/payment/paymentListOfOrder',
		model: PaymentListByOrderModel,

		initialize: function(id){
			this.url = this.url+'?orderId='+id;
		},
	});

	return PaymentListByOrderCollection;
});
