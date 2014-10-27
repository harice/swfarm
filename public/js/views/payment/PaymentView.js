define([
	'backbone',	
	'views/base/AppView',
	'models/payment/PaymentModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/payment/paymentViewTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	AppView, 
	PaymentModel,
	contentTemplate,
	paymentViewTemplate,
	Global,
	Const
){

	var PaymentView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),		

		initialize: function (option){			
			this.initSubContainer();
			var thisObj = this;							

			this.model = new PaymentModel({id:option.id});
			this.model.on("change", function() {
				if(thisObj.subContainerExist())
					thisObj.displayPayment();
				this.off("change");
			});
		},

		render: function(){	
			this.model.runFetch();			
			Backbone.View.prototype.refreshTitle('Payment','View');
		},	

		displayPayment: function () {
			var innerTemplateVariables = {
				payment:this.model,
				payment_url:'#/'+Const.URL.PAYMENT,
				payment_edit_url:'#/'+Const.URL.PAYMENT+'/'+Const.CRUD.EDIT,
				payment_cancel_url:'#/'+Const.URL.PAYMENT+'/'+Const.PAYMENT.CANCEL,
			}
			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var innerTemplate = _.template(paymentViewTemplate, innerTemplateVariables);

			var variables = {
				h1_title: this.model.get('transactionnumber'),
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);

			this.initConfirmationWindow('Are you sure you want to delete this payment?',
										'confirm-delete-payment',
										'Delete Payment',
										'Delete Payment',
                                        'Delete Payment');
		},

		showDeletePaymentWindow: function (ev) {
			this.showConfirmationWindow();		
		},		

		deletePayment: function () {
			var thisObj = this;
			
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.hideConfirmationWindow('modal-confirm', function (){ 
                    	Backbone.history.history.back(); 
                    });
					thisObj.displayMessage(response);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},	

		events: {
			'click #go-to-previous-page': 'goToPreviousPage',		
			'click #delete-payment': 'showDeletePaymentWindow',
			'click #confirm-delete-payment': 'deletePayment'	
		}
	});

	 return PaymentView;
  
});
