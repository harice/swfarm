define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/trucker/TruckerModel',
	'collections/account/AccountCollection',
	'collections/product/ProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/inventory/inventoryAddTemplate.html',
	'text!templates/inventory/inventoryProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			TruckerModel,
			AccountCollection,
			ProductCollection,
			contentTemplate,
			inventoryAddTemplate,
			inventoryProductItemTemplate,
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
			
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'stacknumber', 'location_from', 'location_to', 'tons', 'unitprice', 'id'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'tons', 'unitprice'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['unitprice', 'tons'],
			};
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				thisObj.productCollection.getAllModel();
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
			this.addProduct();
			
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
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				var productTemplate = _.template(inventoryProductItemTemplate, productTemplateVars);
				
				this.$el.find('#product-list tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = productItem.clone();
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}
				
			this.addValidationToProduct();
			return clone;
		},
		
		getProductDropdown: function () {
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		addIndexToProductFields: function (bidProductItem) {
			var productFieldClass = this.options.productFieldClass;
			for(var i=0; i < productFieldClass.length; i++) {
				var field = bidProductItem.find('.'+productFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.productFieldSeparator + this.options.productFieldCounter);
			}
			
			this.options.productFieldCounter++;
		},
		
		addValidationToProduct: function (clone) {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				var rules = {};
				
				if(productFieldClassRequired[i] == 'rfv')
					rules = {require_rfv: true};
				else
					rules = {required: true};
				
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', rules);
				});
			}
		},
		
		generateTruckerAccount: function () {
			var options = '';
			_.each(this.truckerAccountCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			this.$el.find('#account_id').append(options);
		},
		
		events: {
			'click #add-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-trucker': 'showConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker'
		},
		
		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
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