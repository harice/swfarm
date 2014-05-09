define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/order/OrderScheduleVariablesModel',
	'models/purchaseorder/POScheduleModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
	'collections/contact/ContactCollection',
	'collections/account/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			OrderScheduleVariablesModel,
			POScheduleModel,
			ProductCollection,
			AccountCollection,
			AccountTypeCollection,
			ContactCollection,
			TrailerCollection,
			contentTemplate,
			purchaseOrderAddScheduleTemplate,
			purchaseOrderPickUpScheduleProductItemTemplate,
			Global,
			Const
){

	var PickUpScheduleAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		accountTruckerAutoCompleteView: null,
		accountLoaderOriginAutoCompleteView: null,
		accountLoaderDestinationAutoCompleteView: null,
		
		initialize: function(option) {
			var thisObj = this;
			
			this.poid = option.poid;
			this.freightRate = null;
			this.loadingRate = null;
			this.unloadingRate = null;
			this.trailerPercentageRate = null;
			
			this.truckingRateEditable = false;
			
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['productorder_id', 'quantity', 'id'],
				productFieldClassRequired: ['productorder_id', 'quantity'],
				productFieldExempt: [],
				productFieldSeparator: '.',
			};
			
			this.orderScheduleVariablesModel = new OrderScheduleVariablesModel();
			this.orderScheduleVariablesModel.on('change', function() {
				thisObj.freightRate = parseFloat(this.get('freight_rate'));
				thisObj.loadingRate = parseFloat(this.get('loading_rate'));
				thisObj.unloadingRate = parseFloat(this.get('unloading_rate'));
				thisObj.trailerPercentageRate = parseFloat(this.get('trailer_percentage_rate'));
				thisObj.accountTypeCollection.getModels();
				this.off('change');
			});
			
			this.accountTypeCollection = new AccountTypeCollection();
			this.accountTypeCollection.on('sync', function() {
				thisObj.productCollection.getPOProducts(thisObj.poid);
				this.off('sync');
			});
			this.accountTypeCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.trailerAccountCollection.getTrailerAccounts();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.trailerAccountCollection = new AccountCollection();
			this.trailerAccountCollection.on('sync', function() {
				thisObj.loaderAccountCollection.getLoaderAccounts();
				this.off('sync');
			});
			this.trailerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.loaderAccountCollection = new AccountCollection();
			this.loaderAccountCollection.on('sync', function() {
				thisObj.displayForm();
				this.off('sync');
			});
			this.loaderAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.truckerAccountCollection = new AccountCollection();
			this.truckerAccountCollection.on('sync', function() {
				thisObj.generateTruckerDropdown();
			});
			this.truckerAccountCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.trailerCollection = new TrailerCollection();
			this.trailerCollection.on('sync', function() {
				thisObj.generateTrailers();
			});
			this.trailerCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.destinationLoaderContactCollection = new ContactCollection();
			this.destinationLoaderContactCollection.on('sync', function() {
				thisObj.generateDestinationLoaderAccountContacts();
			});
			this.destinationLoaderContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.originLoaderContactCollection = new ContactCollection();
			this.originLoaderContactCollection.on('sync', function() {
				thisObj.generateOriginLoaderAccountContacts();
			});
			this.originLoaderContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.truckerContactCollection = new ContactCollection();
			this.truckerContactCollection.on('sync', function() {
				thisObj.generateTruckerAccountContacts();
			});
			this.truckerContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
		},
		
		render: function(){
			this.orderScheduleVariablesModel.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				sched_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid,
				trucker_account_type_list : this.getTruckerType(),
				trailer_account_list : this.getTrailerDropdown(),
				originloader_account_list : this.getLoaderDropdown(),
				destinationloader_account_list : this.getLoaderDropdown(),
				po_id : this.poid,
			};
			var innerTemplate = _.template(purchaseOrderAddScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Pick Up Schedule",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#POScheduleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					var poScheduleModel = new POScheduleModel(data);
					
					poScheduleModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.poid, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: poScheduleModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.attr('name') == 'scheduledate') {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else if(element.hasClass('monetary-value')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
			
			this.populateTimeOptions();
			this.initCalendar();
			this.addProduct();
		},
		
		populateTimeOptions: function () {
			var hourOptions = '';
			for(var i=1; i<=12; i++) {
				var hour = i+'';
				hour = (hour.length > 1)? i : '0'+i;
				hourOptions += '<option value="'+hour+'">'+hour+'</option>';
			}
			this.$el.find('.hours').html(hourOptions);
			
			var minutesOptions = '';
			for(var i=0; i< 60; i++) {
				var minute = i+'';
				minute = (minute.length > 1)? i : '0'+i;
				minutesOptions += '<option value="'+minute+'">'+minute+'</option>';
			}
			this.$el.find('.minutes').html(minutesOptions);
		},
		
		initCalendar: function () {
			this.$el.find('#po-sched-start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
		},
		
		getTruckerType: function () {
			var dropDown = '';
			_.each(this.accountTypeCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		getTrailerDropdown: function () {
			var dropDown = '';
			_.each(this.trailerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		getLoaderDropdown: function () {
			var dropDown = '';
			_.each(this.loaderAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		generateTruckerDropdown: function () {
			var dropDown = '';
			_.each(this.truckerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			this.$el.find('#truckerAccount_id').append(dropDown);
		},
		
		generateTruckerAccountContacts: function () {
			var dropDown = '';
			_.each(this.truckerContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#trucker_id').append(dropDown);
		},
		
		generateTrailers: function () {
			var dropDown = '';
			_.each(this.trailerCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('number')+'</option>';
			});
			this.$el.find('#trailer_id').append(dropDown);
		},
		
		generateOriginLoaderAccountContacts: function () {
			var dropDown = '';
			_.each(this.originLoaderContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#originloader_id').append(dropDown);
		},
		
		generateDestinationLoaderAccountContacts: function () {
			var dropDown = '';
			_.each(this.destinationLoaderContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#destinationloader_id').append(dropDown);
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				var productTemplate = _.template(purchaseOrderPickUpScheduleProductItemTemplate, productTemplateVars);
				
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
				
			//this.addValidationToProduct();
			return clone;
		},
		
		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		getProductDropdown: function () {
			var dropDown = '<option value="">Select a stack number</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('stacknumber')+'</option>';
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
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			'change .productorder_id': 'onChangeProduct',
			'change #truckerAccountType_id': 'onChangeTruckerType',
			'change #truckerAccount_id': 'onChangeTrucker',
			'change #trailer': 'onChangeTrailer',
			'change #originloader': 'onChangeOriginloader',
			'change #destinationloader': 'onChangeDestinationloader',
			
			'keyup #truckingrate': 'onKeyUpTrackingRate',
			//'blur #truckingrate': 'onBlurTruckingRate',
			'blur #distance': 'onBlurDistance',
			'keyup #distance': 'onBlurDistance',
			'blur #fuelcharge': 'onBlurFuelCharge',
			'blur .loader': 'onBlurLoader',
			'click #delete-schedule': 'deleteSchedule',
		},
		
		onChangeProduct: function (ev) {
			var productId = $(ev.currentTarget).val();
			if(productId != '') {
				var productModel = this.productCollection.get(productId);
				$(ev.currentTarget).closest('tr').find('.product').text(productModel.get('product').name);
			}
		},
		
		onChangeTruckerType: function (ev) {
			var accountTypeId = $(ev.currentTarget).val();
			this.resetSelect($('#truckerAccount_id'));
			this.resetSelect($('#trucker_id'));
			if(accountTypeId != '') {
				var accountTypeModel = this.accountTypeCollection.get(accountTypeId);
				this.toggleTruckingRate(accountTypeModel.get('name'));
				this.truckerAccountCollection.getTruckerAccountsByAccountType(accountTypeId);
			}
			else
				this.toggleTruckingRate('');
		},
		
		onChangeTrucker: function (ev) {
			var accountId = $(ev.currentTarget).val();
			this.resetSelect($('#trucker_id'));
			if(accountId != '')
				this.truckerContactCollection.getContactsByAccountId(accountId);
		},
		
		onChangeTrailer: function (ev) {
			var accountId = $(ev.currentTarget).val();
			this.resetSelect($('#trailer_id'));
			if(accountId != '')
				this.trailerCollection.getTrailerByAccountId(accountId);
		},
		
		onChangeOriginloader: function (ev) {
			var accountId = $(ev.currentTarget).val();
			this.resetSelect($('#originloader_id'));
			if(accountId != '')
				this.originLoaderContactCollection.getContactsByAccountId(accountId);
		},
		
		onChangeDestinationloader: function (ev) {
			var accountId = $(ev.currentTarget).val();
			this.resetSelect($('#destinationloader_id'));
			if(accountId != '')
				this.destinationLoaderContactCollection.getContactsByAccountId(accountId);
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
		
		onBlurTruckingRate: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		onBlurDistance: function () {
			if(!this.truckingRateEditable)
				this.computeTruckingRate();
		},
		
		onBlurFuelCharge: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		onBlurLoader: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		toggleTruckingRate: function (accountType) {
			if(Const.PO.PICKUPSCHEDULE.EDITABLERATE.ACCOUNTTYPE.indexOf(accountType.toLowerCase()) >= 0) {
				this.truckingRateEditable = true;
				$('#truckingrate').attr('readonly', false);
				$('#truckingrate').val('');
			}
			else {
				this.truckingRateEditable = false;
				$('#truckingrate').attr('readonly', true);
				this.computeTruckingRate();
			}
		},
		
		onKeyUpTrackingRate: function (ev) {
			
		},
		
		computeTruckingRate: function () {
			var distanceField = $('#distance');
			var distanceValue = (!isNaN(parseFloat(distanceField.val())))? parseFloat(distanceField.val()) : 0;
			var truckingRate = (distanceValue > 0)? ((this.freightRate * distanceValue) + this.loadingRate + this.unloadingRate).toFixed(2) : ''; //divide by tons
			$('#truckingrate').val(truckingRate);
		},
		
		computeTrailerRent: function (haulingRate) {
			if(!this.truckingRateEditable) {
				
				if(typeof haulingRate == 'undefined')
					haulingRate = (!isNaN(parseFloat($('#truckingrate').val())))? parseFloat($('#truckingrate').val()) : 0;
			
				trailerRent = haulingRate * this.trailerPercentageRate / 100;
				$('#trailer-rent').val(trailerRent.toFixed(2))
			}
		},
		
		deleteSchedule: function () {
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this schedule?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.poid, {trigger: true});
					},
					error: function (model, response, options) {
						thisObj.displayMessage(response);
					},
					wait: true,
					headers: this.model.getAuth(),
				});
			}
			
			return false;
		},
	});

	return PickUpScheduleAddView;
});