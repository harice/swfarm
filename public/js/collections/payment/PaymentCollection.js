define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/payment/PaymentModel',
], function(Backbone, ListViewCollection, PaymentModel){

	var PaymentCollection = ListViewCollection.extend({
		url: '/apiv1/payment',
		model: PaymentModel,
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/payment');
		},
		
		getPaymentByPurchaseOrder: function () {
			this.url = '/apiv1/payment/purchaseOrderList';
			this.getModels();
		},

			
	});

	return PaymentCollection;
});
