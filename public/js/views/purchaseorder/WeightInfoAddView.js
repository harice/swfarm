define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/scale/ScaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/weightInfoAddTemplate.html',
	'text!templates/purchaseorder/weightInfoProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			ProductCollection,
			AccountCollection,
			ScaleCollection,
			contentTemplate,
			weightInfoAddTemplate,
			weightInfoProductItemTemplate,
			Global,
			Const
){

	var WeightInfoAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'add';
			
			this.options = {
				routeType: ['pickup', 'dropoff'],
				productFieldClassRequired: ['bales', 'pounds'],
				separator: '-',
			};
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.scaleAccountCollection.getScalerAccounts();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.scaleAccountCollection = new AccountCollection();
			this.scaleAccountCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.scaleAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.pickupScaleCollection = new ScaleCollection();
			this.pickupScaleCollection.on('sync', function() {
				thisObj.generatePickupScales();
			});
			this.pickupScaleCollection.on('error', function(collection, response, options) {
				//
			});
			
			this.dropoffScaleCollection = new ScaleCollection();
			this.dropoffScaleCollection.on('sync', function() {
				thisObj.generateDropoffScales();
			});
			this.dropoffScaleCollection.on('error', function(collection, response, options) {
				//
			});
		},
		
		render: function(){
			this.productCollection.getScheduleProducts(this.schedId);
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				scaler_account_list: this.getScalerDropDown(),
			};
			
			var innerTemplate = _.template(weightInfoAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			this.addProducts();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poWeightInfoFrom').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
				},
			});
		},
		
		getScalerDropDown: function () {
			var dropDown = '';
			_.each(this.scaleAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		addProducts: function () {
			var thisObj = this;
			
			_.each(this.options.routeType, function (type) {
				var ctr = 0;
				_.each(thisObj.productCollection.models, function (model) {
					var templateVariables = {
						id: model.get('transportschedule_id'),
						stock_number: model.get('productorder').stacknumber,
						name: model.get('productorder').product.name,
						net: '0.00',
						route_type: type+thisObj.options.separator,
						number: '.'+ctr++,
					};
					var productItemTemplate = _.template(weightInfoProductItemTemplate, templateVariables);
					thisObj.$el.find('#'+type+'-product-list tbody').append(productItemTemplate);
				});
			});
			
			this.addValidationToProduct();
		},
		
		addValidationToProduct: function () {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				this.$el.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		generatePickupScales: function () {
			var dropDown = '';
			_.each(this.pickupScaleCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			this.$el.find('#pickup-scales').append(dropDown);
			
			if(typeof this.selectedPickupScaleId != 'undefined' && this.selectedPickupScaleId != null) {
				this.$el.find('#pickup-scales').val(this.selectedPickupScaleId);
				this.selectedPickupScaleId = null;
			}
		},
		
		generateDropoffScales: function () {
			var dropDown = '';
			_.each(this.dropoffScaleCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			this.$el.find('#dropoff-scales').append(dropDown);
			
			if(typeof this.selectedDropoffScaleId != 'undefined' && this.selectedDropoffScaleId != null) {
				this.$el.find('#dropoff-scales').val(this.selectedDropoffScaleId);
				this.selectedDropoffScaleId = null;
			}
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'change #pickup-scaleAccount_id': 'onChangePickupScaleAccount',
			'change #dropoff-scaleAccount_id': 'onChangeDropoffScaleAccount',
		},
		
		onChangePickupScaleAccount: function (ev) {
			this.fetchPickupScale($(ev.currentTarget).val());
		},
		
		fetchPickupScale: function (accountId, scaleId) {
			if(scaleId != null)
				this.selectedPickupScaleId = scaleId;
				
			this.resetSelect($('#pickup-scales'));
			if(accountId != '')
				this.pickupScaleCollection.getScalesByAccount(accountId);
		},
		
		onChangeDropoffScaleAccount: function (ev) {
			this.fetchDropoffScale($(ev.currentTarget).val());
		},
		
		fetchDropoffScale: function (accountId, scaleId) {
			if(scaleId != null)
				this.selectedDropoffScaleId = scaleId;
				
			this.resetSelect($('#dropoff-scales'));
			if(accountId != '')
				this.dropoffScaleCollection.getScalesByAccount(accountId);
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
	});

	return WeightInfoAddView;
});