define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'models/order/OrderScheduleVariablesModel',
	'models/salesorder/SOScheduleModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/account/AccountTypeCollection',
	'collections/contact/ContactCollection',
	'collections/account/TrailerCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/deliveryScheduleAddTemplate.html',
	'text!templates/salesorder/deliveryScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			OrderScheduleVariablesModel,
			SOScheduleModel,
			ProductCollection,
			AccountCollection,
			AccountTypeCollection,
			ContactCollection,
			TrailerCollection,
			contentTemplate,
			deliveryScheduleAddTemplate,
			deliveryScheduleProductItemTemplate,
			Global,
			Const
){

	var DeliveryScheduleAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		accountTruckerAutoCompleteView: null,
		accountLoaderOriginAutoCompleteView: null,
		accountLoaderDestinationAutoCompleteView: null,
		
		initialize: function(option) {
			this.soId = option.soId;
			this.schedId = null;
			this.h1Title = 'Delivery Schedule';
			this.h1Small = 'add';
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
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
				thisObj.productCollection.getPOProducts(thisObj.soId);
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
				sched_url : '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId,
				trucker_account_type_list : this.getTruckerType(),
				trailer_account_list : this.getTrailerDropdown(),
				originloader_account_list : this.getLoaderDropdown(),
				destinationloader_account_list : this.getLoaderDropdown(),
				so_id : this.soId,
			};
			
			if(this.schedId != null)
				innerTemplateVariables['sched_id'] = this.schedId;
			
			var innerTemplate = _.template(deliveryScheduleAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initValidateForm();
			
			this.populateTimeOptions();
			this.initCalendar();
			this.addProduct();
			
			this.postDisplayForm();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#SOScheduleForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					data['scheduledate'] = thisObj.convertDateFormat(data['scheduledate'], thisObj.dateFormat, thisObj.dateFormatDB, '-');
					data['type'] = 2;
					//console.log(data);
					
					var soScheduleModel = new SOScheduleModel(data);
					
					soScheduleModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.soId, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: soScheduleModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.attr('name') == 'scheduledate') {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else if(element.hasClass('monetary-value') || element.hasClass('quantity')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
		},
		
		populateTimeOptions: function () {
			var hourOptions = '';
			for(var i=1; i<=12; i++) {
				var hour = i+'';
				hour = (hour.length > 1)? i : '0'+i;
				hourOptions += '<option value="'+hour+'">'+hour+'</option>';
			}
			this.$el.find('#scheduletimeHour').html(hourOptions);
			
			var minutesOptions = '';
			for(var i=0; i< 60; i++) {
				var minute = i+'';
				minute = (minute.length > 1)? i : '0'+i;
				minutesOptions += '<option value="'+minute+'">'+minute+'</option>';
			}
			this.$el.find('#scheduletimeMin').html(minutesOptions);
		},
		
		initCalendar: function () {
			this.$el.find('#so-sched-start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: this.dateFormat,
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
			
			if(typeof this.selectedTruckerAccountId != 'undefined' && this.selectedTruckerAccountId != null) {
				this.$el.find('#truckerAccount_id').val(this.selectedTruckerAccountId);
				this.selectedTruckerAccountId = null;
			}
		},
		
		generateTruckerAccountContacts: function () {
			var dropDown = '';
			_.each(this.truckerContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#trucker_id').append(dropDown);
			
			if(typeof this.selectedTruckerContactId != 'undefined' && this.selectedTruckerContactId != null) {
				this.$el.find('#trucker_id').val(this.selectedTruckerContactId);
				this.selectedTruckerContactId = null;
			}
		},
		
		generateTrailers: function () {
			var dropDown = '';
			_.each(this.trailerCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('number')+'</option>';
			});
			this.$el.find('#trailer_id').append(dropDown);
			
			if(typeof this.selectedTrailerId != 'undefined' && this.selectedTrailerId != null) {
				this.$el.find('#trailer_id').val(this.selectedTrailerId);
				this.selectedTrailerId = null;
			}
		},
		
		generateOriginLoaderAccountContacts: function () {
			var dropDown = '';
			_.each(this.originLoaderContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#originloader_id').append(dropDown);
			
			if(typeof this.selectedOriginLoaderContactId != 'undefined' && this.selectedOriginLoaderContactId != null) {
				this.$el.find('#originloader_id').val(this.selectedOriginLoaderContactId);
				this.selectedOriginLoaderContactId = null;
			}
		},
		
		generateDestinationLoaderAccountContacts: function () {
			var dropDown = '';
			_.each(this.destinationLoaderContactCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('lastname')+', '+model.get('firstname')+'</option>';
			});
			this.$el.find('#destinationloader_id').append(dropDown);
			
			if(typeof this.selectedDestinationLoaderContactId != 'undefined' && this.selectedDestinationLoaderContactId != null) {
				this.$el.find('#destinationloader_id').val(this.selectedDestinationLoaderContactId);
				this.selectedDestinationLoaderContactId = null;
			}
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
				};
				var productTemplate = _.template(deliveryScheduleProductItemTemplate, productTemplateVars);
				
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
				
			this.computeTotalQuantity();
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
		
		formatFormField: function (data) {
			var formData = {products:[]};
			var productFieldClass = this.options.productFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.productFieldSeparator);
					
					if(arrayKey.length < 2)
						formData[key] = value;
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									if(!(productFieldClass[i] == 'id' && fieldValue == ''))
										arrayProductFields[productFieldClass[i]] = fieldValue;
								}
							}
								
							formData.products.push(arrayProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #add-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			'change .productorder_id': 'onChangeProduct',
			'change #truckerAccountType_id': 'onChangeTruckerType',
			'change #truckerAccount_id': 'onChangeTrucker',
			'change #trailer': 'onChangeTrailer',
			'change #originloader': 'onChangeOriginLoader',
			'change #destinationloader': 'onChangeDestinationLoader',
			
			'keyup #truckingrate': 'onKeyUpTrackingRate',
			'blur #truckingrate': 'onBlurTruckingRate',
			'blur #distance': 'onBlurDistance',
			'keyup #distance': 'onBlurDistance',
			'blur #fuelcharge': 'onBlurFuelCharge',
			'blur .loader': 'onBlurLoader',
			'keyup .quantity': 'onKeyUpQuantity',
			'blur .quantity': 'onBlurQuantity',
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
			this.fetchTruckerAccounts($(ev.currentTarget).val());
		},
		
		fetchTruckerAccounts: function (accountTypeId, accountId, contactId, truckingRate) {
			if(accountId != null)
				this.selectedTruckerAccountId = accountId;
			
			if(truckingRate != null)
				this.selectedTruckingRate = truckingRate;
			
			this.resetSelect($('#truckerAccount_id'));
			this.resetSelect($('#trucker_id'));
			this.truckerAccountCollection.getTruckerAccountsByAccountType(accountTypeId);
			this.toggleTruckingRate(accountTypeId);
			
			if(contactId != null)
				this.fetchTruckerContacts(accountId, contactId);
		},
		
		onChangeTrucker: function (ev) {
			this.fetchTruckerContacts($(ev.currentTarget).val());
		},
		
		fetchTruckerContacts: function(accountId, contactId) {
			if(contactId != null)
				this.selectedTruckerContactId = contactId;
		
			this.resetSelect($('#trucker_id'));
			if(accountId != '')
				this.truckerContactCollection.getContactsByAccountId(accountId);
		},
		
		onChangeTrailer: function (ev) {
			this.fetchTrailer($(ev.currentTarget).val());
		},
		
		fetchTrailer: function (accountId, trailerId) {
			if(trailerId != null)
				this.selectedTrailerId = trailerId;
				
			this.resetSelect($('#trailer_id'));
			if(accountId != '')
				this.trailerCollection.getTrailerByAccountId(accountId);
		},
		
		onChangeOriginLoader: function (ev) {
			this.fetchOriginLoaderContacts($(ev.currentTarget).val());
		},
		
		fetchOriginLoaderContacts: function(accountId, contactId) {
			if(contactId != null)
				this.selectedOriginLoaderContactId = contactId;
		
			this.resetSelect($('#originloader_id'));
			if(accountId != '')
				this.originLoaderContactCollection.getContactsByAccountId(accountId);
		},
		
		onChangeDestinationLoader: function (ev) {
			this.fetchDestinationLoaderContacts($(ev.currentTarget).val());
		},
		
		fetchDestinationLoaderContacts: function (accountId, contactId) {
			if(contactId != null)
				this.selectedDestinationLoaderContactId = contactId;
			
			this.resetSelect($('#destinationloader_id'));
			if(accountId != '')
				this.destinationLoaderContactCollection.getContactsByAccountId(accountId);
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
		
		onKeyUpTrackingRate: function (ev) {
			this.computeTrailerRent(parseFloat($(ev.target).val()));
		},
		
		onBlurTruckingRate: function (ev) {
			this.toFixedValue($(ev.target), 2);
			this.computeTrailerRent(parseFloat($(ev.target).val()));
		},
		
		onBlurDistance: function () {
			this.computeTruckingRate();
		},
		
		onBlurFuelCharge: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		onBlurLoader: function (ev) {
			this.toFixedValue($(ev.target), 2);
		},
		
		onKeyUpQuantity: function (ev) {
			this.computeTotalQuantity();
		},
		
		onBlurQuantity: function (ev) {
			this.toFixedValue($(ev.target), 4);
			this.computeTotalQuantity();
		},
		
		computeTotalQuantity: function () {
			var total = 0;
			this.$el.find('.quantity').each(function (index, element) {
				var value = $(element).val();
				if(!isNaN(value) && value != '') {
					total += parseFloat(value);
				}
			});
			
			if(total != 0)
				$('#total-quantity').val(total.toFixed(4));
			else
				$('#total-quantity').val('');
				
			this.computeTruckingRate();
		},
		
		toggleTruckingRate: function (accountTypeId) {
			if(accountTypeId != '') {
				var accountTypeModel = this.accountTypeCollection.get(accountTypeId);
				var accountType = accountTypeModel.get('name');
				
				if(Const.PO.PICKUPSCHEDULE.EDITABLERATE.ACCOUNTTYPE.indexOf(accountType.toLowerCase()) >= 0) {
					this.truckingRateEditable = true;
					$('#truckingrate').attr('readonly', false);
					$('#truckingrate').val('');
					
					if(typeof this.selectedTruckingRate != 'undefined' && this.selectedTruckingRate != null)
						$('#truckingrate').val(this.selectedTruckingRate).blur();
					
					this.computeTrailerRent();
				}
				else {
					this.truckingRateEditable = false;
					$('#truckingrate').attr('readonly', true);
					this.computeTruckingRate();
					$('#trailerrate').val('0.00');
				}
				
				this.selectedTruckingRate = null;
			}
			else {
				this.truckingRateEditable = false;
				$('#truckingrate').attr('readonly', true);
				$('#truckingrate').val('0.00');
				$('#trailerrate').val('0.00');
			}
		},
		
		computeTruckingRate: function () {
			if(!this.truckingRateEditable && $('#truckerAccountType_id').val() != '') {
				var distanceField = $('#distance');
				var distanceValue = (!isNaN(parseFloat(distanceField.val())))? parseFloat(distanceField.val()) : 0;
				var totalQuantity = (!isNaN(parseFloat($('#total-quantity').val())))? parseFloat($('#total-quantity').val()) : 0;
				var truckingRate = (distanceValue > 0 && totalQuantity > 0)? (((this.freightRate * distanceValue) + this.loadingRate + this.unloadingRate) / totalQuantity).toFixed(2) : ''; //divide by tons
				$('#truckingrate').val(truckingRate);
			}
		},
		
		computeTrailerRent: function (haulingRate) {
			if(this.truckingRateEditable) {
				if(typeof haulingRate == 'undefined')
					haulingRate = (!isNaN(parseFloat($('#truckingrate').val())))? parseFloat($('#truckingrate').val()) : 0;
				
				if(!isNaN(haulingRate) && haulingRate != 0) {
					trailerRent = haulingRate * this.trailerPercentageRate / 100;
					$('#trailerrate').val(trailerRent.toFixed(2))
				}
				else
					$('#trailerrate').val('');
			}
		},
		
		deleteSchedule: function () {
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this schedule?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						//Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.soId, {trigger: true});
						Backbone.history.history.back();
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
		
		postDisplayForm: function () {},
	});

	return DeliveryScheduleAddView;
});