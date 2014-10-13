define([
	'backbone',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'bootstrapmultiselect',
	'models/payment/PaymentModel',
	'collections/payment/PaymentCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/payment/paymentAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			Validate,
			TextFormatter,
			PhoneNumber,
			bootstrapMultiSelect,
			PaymentModel,
			PaymentCollection,
			contentTemplate,
			paymentAddTemplate,
			Global,
			Const
){

	var PaymentAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;
			this.paymentId = null;
			this.h1Title = 'Account';
			this.h1Small = 'add';
			this.orderId = option.orderId;

			this.options ={
				removeComma: ['amount']
			}

			this.model = new PaymentModel();

			this.collection = new PaymentCollection();
			this.collection.on('sync', function(){
				thisObj.displayForm();
				this.off('sync');
			});
			
		},
		
		render: function(){	
			this.collection.getPaymentByPurchaseOrder();
			Backbone.View.prototype.refreshTitle('Payments','add');
		},	

		getCurdate: function() {
			var today = new Date();
		    var dd = today.getDate();
		    var mm = today.getMonth()+1; //January is 0!

		    var yyyy = today.getFullYear();
		    if(dd<10){
		        dd='0'+dd
		    } 
		    if(mm<10){
		        mm='0'+mm
		    } 
		    var today = yyyy+'-'+mm+'-'+ dd;

		    return today;
		},
		
		displayForm: function () {
			var thisObj = this;

			if(thisObj.orderId != null)
				thisObj.model = this.collection.get({id: thisObj.orderId});

			var innerTemplateVariables = {
				'payment_url': '#/'+Const.URL.PAYMENT,
				'order_id': this.orderId,
				'payment': thisObj.model,
			};
			
			if(this.paymentId != null)
				innerTemplateVariables['payment_id'] = this.paymentId;
			
			var innerTemplate = _.template(paymentAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.focusOnFirstField();
			this.$el.find('.capitalize').textFormatter({type:'capitalize'});
			this.$el.find('.lowercase').textFormatter({type:'lowercase'});
			this.maskInputs();
			
			this.initValidateForm();
			$('.form-button-container').show();

			this.initConfirmationWindow('Are you sure you want to cancel this payment?',
										'confirm-cancel-payment',
										'Cancel Payment',
                                        'Cancel Payment');
		},
		
		initValidateForm: function () {
			var thisObj = this;			
			
			var validate = $('#addPaymentForm').validate({
				submitHandler: function(form) {						
					var data = $(form).serializeObject();
					var paymentModel = new PaymentModel(data);					
					paymentModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);	
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: paymentModel.getAuth(),
						}
					);
				},
				
			});
		},

		showCancelPaymentWindow: function (ev) {
			this.showConfirmationWindow();		
		},		

		cancelPayment: function () {
			var thisObj = this;			
			var data = $("#addPaymentForm").serializeObject();
					
			var paymentModel = new PaymentModel(data);
				
			paymentModel.setCancelURL();		
			paymentModel.save(
				null, 
				{
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						thisObj.hideConfirmationWindow('modal-with-form-confirm');
						Backbone.history.history.back();
					},
					error: function (model, response, options) {
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: paymentModel.getAuth(),
				}
			);
		},
		
		events: {
			'keyup #amount': 'formatMoney',
			'blur #amount': 'onBlurMoney',
			'click #cancel-payment': 'showCancelPaymentWindow',
			'click #confirm-cancel-payment': 'cancelPayment'
		},		
	});

  return PaymentAddView;
  
});