define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trucker/TruckerModel',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/trucker/truckerAddTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			TruckerModel,
			AccountCollection,
			AccountTypeCollection,
			contentTemplate,
			truckerAddTemplate,
			Global,
			Const
){

	var TruckerAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.truckerId = null;
			this.h1Title = 'Trucker';
			this.h1Small = 'add';
			
			this.accountTypeCollection = new AccountTypeCollection();
			this.accountTypeCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.accountTypeCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				thisObj.generateTruckerDropdown();
                thisObj.hideFieldThrobber();
			});
			this.truckerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
		},
		
		render: function(){
			this.accountTypeCollection.getTruckType();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				trucker_account_type_list : this.getTruckerType(),
			};
			
			if(this.truckerId != null)
				innerTemplateVariables['trucker_id'] = this.truckerId;
			
			var innerTemplate = _.template(truckerAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.focusOnFirstField();
			this.initValidateForm();
			
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#TruckerForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					data['fee'] = thisObj.removeCommaFromNumber(data['fee']);
					console.log(data);
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
		
		getTruckerType: function () {
			var dropDown = '';
			_.each(this.accountTypeCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		events: {
			'change #truckerAccountType_id': 'onChangeTruckerType',
			'keyup #fee': 'formatMoney',
			'blur #fee': 'onBlurMoney',
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-trucker': 'showConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker'
		},
		
		onChangeTruckerType: function (ev) {
			this.fetchTruckerAccounts($(ev.currentTarget).val());
		},
		
		fetchTruckerAccounts: function (accountTypeId, accountId) {
			if(accountId != null)
				this.selectedTruckerAccountId = accountId;
			
			this.resetSelect($('#account_id'));
			
			if(accountTypeId != '') {
				this.showFieldThrobber('#account_id');
				this.truckerAccountCollection.getTruckerAccountsByAccountType(accountTypeId);
			}
		},
		
		generateTruckerDropdown: function () {
			var dropDown = '';
			_.each(this.truckerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			this.$el.find('#account_id').append(dropDown);
			
			if(typeof this.selectedTruckerAccountId != 'undefined' && this.selectedTruckerAccountId != null) {
				this.$el.find('account_id').val(this.selectedTruckerAccountId);
				this.selectedTruckerAccountId = null;
			}
			else {
				if(this.truckerAccountCollection.models.length == 1)
					this.$el.find('#account_id').val(this.truckerAccountCollection.models[0].get('id')).change();
			}
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

	return TruckerAddView;
  
});