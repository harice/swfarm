define([
	'backbone',
	'views/payment/PaymentView',
	'constant',
], function(Backbone, Payment, Const){
	
	function PaymentController () {	
		
		this.setAction = function () {		
			return new Payment();
		};			

	};

	return PaymentController;
});
