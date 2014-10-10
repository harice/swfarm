define([
	'backbone',
	'views/payment/PaymentAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'bootstrapmultiselect',
	'models/payment/PaymentModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/payment/paymentAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			PaymentAddView,
			Validate,
			TextFormatter,
			PhoneNumber,
			bootstrapMultiSelect,
			PaymentModel,
			contentTemplate,
			paymentAddTemplate,
			Global,
			Const
){

	var PaymentEditView = PaymentAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			
		},
		
		render: function(){
			Backbone.View.prototype.refreshTitle('Payments','edit');
		},
		
		supplyPaymentData: function () {
			var thisObj = this;
		},
	});

  return PaymentEditView;
  
});