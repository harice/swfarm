define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/scale/ScaleModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/scale/scaleAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			ScaleModel,
			AccountCollection,
			contentTemplate,
			scaleAddTemplate,
			Global,
			Const
){

	var ScaleAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.scaleId = null;
			this.h1Title = 'Scale';
			this.h1Small = 'add';
			
			this.scalerAccountCollection = new AccountCollection();
			this.scalerAccountCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.scalerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.scalerAccountCollection.getScalerAccounts();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {};
			
			if(this.scaleId != null)
				innerTemplateVariables['scale_id'] = this.scaleId;
			
			var innerTemplate = _.template(scaleAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.generateScalerAccount();
			this.focusOnFirstField();
			this.initValidateForm();
			this.maskInputs();
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#scalerForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					data['rate'] = thisObj.removeCommaFromNumber(data['rate']);
					
					var scaleModel = new ScaleModel(data);
					
					scaleModel.save(
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
							headers: scaleModel.getAuth(),
						}
					);
				},
			});
		},
		
		generateScalerAccount: function () {
			var options = '';
			_.each(this.scalerAccountCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			this.$el.find('#account_id').append(options);
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-scale': 'showConfirmationWindow',
			'click #confirm-delete-scale': 'deleteTrailer',
			'keyup #rate': 'formatMoney',
			'blur #rate': 'onBlurMoney',
		},
		
		deleteTrailer: function () {
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    //Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
					Backbone.history.history.back();
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: thisObj.model.getAuth(),
            });
		},
		
		otherInitializations: function () {},
	});

	return ScaleAddView;
  
});