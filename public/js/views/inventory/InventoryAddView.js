define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trucker/TruckerModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trucker/inventoryAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			TruckerModel,
			AccountCollection,
			contentTemplate,
			inventoryAddTemplate,
			Global,
			Const
){

	var InventoryAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.truckerId = null;
			this.h1Title = 'Inventory';
			this.h1Small = 'add';
			
			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.truckerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.truckerAccountCollection.getTrailerAccounts();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {};
			
			if(this.truckerId != null)
				innerTemplateVariables['trucker_id'] = this.truckerId;
			
			var innerTemplate = _.template(inventoryAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.generateTruckerAccount();
			this.focusOnFirstField();
			this.initValidateForm();
			
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#trailerForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//data['rate'] = '0.00';
					//console.log(data);
					var truckerModel = new TruckerModel(data);
					
					truckerModel.save(
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
							headers: truckerModel.getAuth(),
						}
					);
				},
			});
		},
		
		generateTruckerAccount: function () {
			var options = '';
			_.each(this.truckerAccountCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			this.$el.find('#account_id').append(options);
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-trucker': 'showConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker'
		},
		
		deleteTrucker: function () {
			var thisObj = this;
            
            this.model.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
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

	return InventoryAddView;
  
});