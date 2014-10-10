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
			this.paymentId = option.id;
			this.h1Title = 'Payment';
			this.h1Small = 'edit';

			this.model = new PaymentModel({id:this.paymentId});
			this.model.on("change", function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyPaymentData();
					thisObj.maskInputs();
				}
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Payments','edit');
		},
		
		supplyPaymentData: function () {
			var thisObj = this;
			$('#id').val(this.model.get('id'));
			$('#transactionnumber').val(this.model.get('transactionnumber'));
			$('#order_id').val(this.model.get('order_id'));	
			$('#po_number').val(this.model.get('order').order_number);	
			$('#account_name').val(this.model.get('account').name);		
			$('#checknumber').val(this.model.get('checknumber'));
			$('#amount').val(this.model.get('amount'));
			$('#notes').val(this.model.get('notes'));
		},
	});

  return PaymentEditView;
  
});