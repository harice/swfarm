define([
	'backbone',
	'views/base/AppView',
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
			AppView,
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

	var PaymentAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.paymentId = null;
			this.h1Title = 'Account';
			this.h1Small = 'add';
		},
		
		render: function(){
			this.displayForm();
			Backbone.View.prototype.refreshTitle('Payments','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'payment_url': '#/'+Const.URL.PAYMENT,
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
		},
		
		initValidateForm: function () {
			var thisObj = this;			
			
			var validate = $('#addPaymentForm').validate({
				submitHandler: function(form) {						
					var data = thisObj.formatFormField($(form).serializeObject());

					var accountModel = new AccountModel(data);					
					accountModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);	
								console.log(data);							
								//Global.getGlobalVars().app_router.navigate(Const.URL.ACCOUNT, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: accountModel.getAuth(),
						}
					);
				},
				
			});
		},
		
		events: {
		},		
	});

  return PaymentAddView;
  
});