define([
	'backbone',
	'views/base/AppView',
	'models/order/OrderScheduleVariablesModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/settings/settingsAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			OrderScheduleVariablesModel,
			contentTemplate,
			trailerAddTemplate,
			Global,
			Const
){

	var SettingsEditView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.h1Title = 'Settings';
			this.h1Small = 'edit';
			
			this.model = new OrderScheduleVariablesModel();
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplySettingsData();
					thisObj.maskInputs();
				}
				
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Settings','manage');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {};
			
			var innerTemplate = _.template(trailerAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
            // this.maskInputs();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#sheduleSettingsForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject(); //console.log(data);
					
					/*var trailerModel = new TrailerModel(data);
					
					trailerModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.TRAILER, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: trailerModel.getAuth(),
						}
					);*/
					
					return false;
				},
			});
		},
		
		supplySettingsData: function () {
			this.$el.find('#freight_rate').val(this.model.get('freight_rate'));
			this.$el.find('#loading_rate').val(this.model.get('loading_rate'));
			this.$el.find('#unloading_rate').val(this.model.get('unloading_rate'));
			this.$el.find('#trailer_percentage_rate').val(this.model.get('trailer_percentage_rate'));
		},
	});

	return SettingsEditView;
  
});