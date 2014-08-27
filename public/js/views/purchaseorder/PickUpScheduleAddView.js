define([
	'backbone',
	'views/base/AppView',
	'views/base/GoogleMapsView',
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
	'collections/trucker/TruckerCollection',
	'collections/stack/LocationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderPickUpScheduleProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			GoogleMapsView,
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
			TruckerCollection,
			LocationCollection,
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
			this.initSubContainer();
			this.poId = option.poId;
			this.schedId = null;
			this.h1Title = 'Pick Up Schedule';
			this.h1Small = 'add';
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			this.freightRate = null;
			this.loadingRate = null;
			this.unloadingRate = null;
			this.trailerPercentageRate = null;
			this.fuelRate = null
			
			this.truckingRateEditable = false;
			this.hasFuelCharge = false;
			
			this.distanceMarkers = [];
			/*this.distanceMarkers.push({
				distance:0.53,
				isLoadedDistance:0,
				latitudeFrom:33.39511751728097,
				latitudeTo:33.39110448743527,
				longitudeFrom:-112.33581232998404,
				longitudeTo:-112.33130621883902,
			});
			this.distanceMarkers.push({
				distance:0.84,
				isLoadedDistance:1,
				latitudeFrom:33.39110448743527,
				latitudeTo:	33.394902538236444,
				longitudeFrom:-112.33130621883902,
				longitudeTo:-112.32263731930288,
			});
			this.distanceMarkers.push({
				distance:1.46,
				isLoadedDistance:0,
				latitudeFrom:33.394902538236444,
				latitudeTo:33.39443674848234,
				longitudeFrom:-112.32263731930288,
				longitudeTo:-112.306629895902,
			});*/
			
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['productorder_id', 'sectionto_id', 'quantity', 'id'],
				productFieldClassRequired: ['productorder_id', 'sectionto_id', 'quantity'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['originloaderfee',
							'destinationloaderfee', 
							'distance',
							'fuelcharge',
							'truckingrate',
							'trailerrate',
							'quantity'],
			};
			
			this.orderScheduleVariablesModel = new OrderScheduleVariablesModel();
			this.orderScheduleVariablesModel.on('change', function() {
				thisObj.freightRate = parseFloat(this.get('freight_rate'));
				thisObj.loadingRate = parseFloat(this.get('loading_rate'));
				thisObj.unloadingRate = parseFloat(this.get('unloading_rate'));
				thisObj.trailerPercentageRate = parseFloat(this.get('trailer_percentage_rate'));
				thisObj.fuelRate = parseFloat(this.get('fuel_rate'));
				thisObj.accountTypeCollection.getModels();
				this.off('change');
			});
			
			this.accountTypeCollection = new AccountTypeCollection();
			this.accountTypeCollection.on('sync', function() {
				thisObj.productCollection.getOrderProducts(thisObj.poId);
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
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				this.off('sync');
			});
			this.loaderAccountCollection.on('error', function(collection, response, options) {
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
			
			this.trailerCollection = new TrailerCollection();
			this.trailerCollection.on('sync', function() {
				thisObj.generateTrailers();
                thisObj.hideFieldThrobber();
			});
			this.trailerCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.destinationLoaderContactCollection = new ContactCollection();
			this.destinationLoaderContactCollection.on('sync', function() {
				thisObj.generateDestinationLoaderAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.destinationLoaderContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.originLoaderContactCollection = new ContactCollection();
			this.originLoaderContactCollection.on('sync', function() {
				thisObj.generateOriginLoaderAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.originLoaderContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.truckerContactCollection = new ContactCollection();
			this.truckerContactCollection.on('sync', function() {
				thisObj.generateTruckerAccountContacts();
                thisObj.hideFieldThrobber();
			});
			this.truckerContactCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.truckerNumberCollection = new TruckerCollection();
			this.truckerNumberCollection.on('sync', function() {
				thisObj.generateTruckerNumbers();
                thisObj.hideFieldThrobber();
			});
			this.truckerNumberCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.locationCollection = new LocationCollection();
			this.locationCollection.on('sync', function() {
				thisObj.orderScheduleVariablesModel.runFetch();
				this.off('sync');
			});
			this.locationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.locationCollection.getWarehouseLocation();
			//this.orderScheduleVariablesModel.runFetch();
			Backbone.View.prototype.refreshTitle('Pickup Schedule','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				sched_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
				trucker_account_type_list : this.getTruckerType(),
				trailer_account_list : this.getTrailerDropdown(),
				originloader_account_list : this.getLoaderDropdown(),
				destinationloader_account_list : this.getLoaderDropdown(),
				po_id : this.poId,
			};
			
			if(this.schedId != null)
				innerTemplateVariables['sched_id'] = this.schedId
			
			var innerTemplate = _.template(purchaseOrderAddScheduleTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.googleMaps = new GoogleMapsView();
			this.googleMaps.initMapGetDestinationDistance(function (data) {
				
				var distanceMarker = '';
				thisObj.distanceMarkers = [];
				if(typeof data.destinationLeg !== 'undefined' && data.destinationLeg != null) {
					var distance = 0;
					var loadedDistance = 0;
					for(var i = 0; i < data.destinationLeg.length; i++) {
						thisObj.distanceMarkers.push({
							longitudeFrom:data.destinationLeg[i].origin.lng(),
							latitudeFrom:data.destinationLeg[i].origin.lat(),
							longitudeTo:data.destinationLeg[i].destination.lng(),
							latitudeTo:data.destinationLeg[i].destination.lat(),
							distance:data.destinationLeg[i].distance,
							isLoadedDistance:(data.destinationLeg[i].loaded)? 1 : 0,
						});
						
						distance += parseFloat(data.destinationLeg[i].distance);
						if(data.destinationLeg[i].loaded)
							loadedDistance += parseFloat(data.destinationLeg[i].distance);
					}
					
					thisObj.subContainer.find('#distance').val(this.addCommaToNumber(distance.toFixed(2)));
					thisObj.subContainer.find('#distance-loaded').val(this.addCommaToNumber(loadedDistance.toFixed(2)));
					
					if(thisObj.hasFuelCharge)
						thisObj.computeFuelCharge();
				}
				else {
					thisObj.subContainer.find('#distance').val('');
					thisObj.subContainer.find('#distance-loaded').val('');
					thisObj.subContainer.find('#fuelcharge').val('');
				}
			});
			
			this.initValidateForm();
			
			this.populateTimeOptions();
			this.initCalendar();
			this.addProduct();
			
			this.postDisplayForm();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#POScheduleForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					data['scheduledate'] = thisObj.convertDateFormat(data['scheduledate'], thisObj.dateFormat, thisObj.dateFormatDB, '-');
					data['scheduleMap'] = thisObj.distanceMarkers;
					
					var poScheduleModel = new POScheduleModel(data);
					
					poScheduleModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.poId, {trigger: true});
								Backbone.history.history.back();
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
			this.$el.find('#po-sched-start-date .input-group.date').datepicker({
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
			else {
				if(this.truckerAccountCollection.models.length == 1)
					this.$el.find('#truckerAccount_id').val(this.truckerAccountCollection.models[0].get('id')).change();
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
			else {
				if(this.truckerContactCollection.models.length == 1)
					this.$el.find('#trucker_id').val(this.truckerContactCollection.models[0].get('id')).change();
			}
		},
		
		generateTruckerNumbers: function () {
			var dropDown = '';
			_.each(this.truckerNumberCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('trucknumber')+'</option>';
			});
			this.$el.find('#truck_id').append(dropDown);
			
			if(typeof this.selectedTruckerNumber != 'undefined' && this.selectedTruckerNumber != null) {
				this.$el.find('#truck_id').val(this.selectedTruckerNumber);
				this.selectedTruckerNumber = null;
			}
			else {
				if(this.truckerNumberCollection.models.length == 1)
					this.$el.find('#truck_id').val(this.truckerNumberCollection.models[0].get('id')).change();
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
			else {
				if(this.trailerCollection.models.length == 1)
					this.$el.find('#trailer_id').val(this.trailerCollection.models[0].get('id')).change();
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
			else {
				if(this.originLoaderContactCollection.models.length == 1)
					this.$el.find('#originloader_id').val(this.originLoaderContactCollection.models[0].get('id')).change();
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
			else {
				if(this.destinationLoaderContactCollection.models.length == 1)
					this.$el.find('#destinationloader_id').val(this.destinationLoaderContactCollection.models[0].get('id')).change();
			}
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
					locationto_list:this.getLocationToDropdown(),
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
			
			//this.addValidationToProduct(clone);
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
		
		getLocationToDropdown: function () {
			var dropdown = '<option value="">Select a stack location</option>';
			_.each(this.locationCollection.models, function (model) {
				var locationName = model.get('name');
				
				_.each(model.get('section'), function (section) {
					dropdown += '<option value="'+section.id+'">'+locationName+' - '+section.name+'</option>';
				});
			});
			
			return dropdown;
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
					
					if(arrayKey.length < 2) {
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
					}
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									
									if(!(productFieldClass[i] == 'id' && fieldValue == '')) {
										if(this.options.removeComma.indexOf(productFieldClass[i]) < 0)
											arrayProductFields[productFieldClass[i]] = fieldValue;
										else
											arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
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
			'blur #truckingrate': 'onBlurMoney',
			'change #has-fuel-charge': 'changeHasFuelCharge',
			'keyup .loader': 'formatMoney',
			'blur .loader': 'onBlurMoney',
			'keyup .quantity': 'onKeyUpQuantity',
			'blur .quantity': 'onBlurTon',
			'click #delete-schedule': 'deleteSchedule',
			
			'click #map': 'showMap',
		},
		
		onChangeProduct: function (ev) {
			$(ev.currentTarget).closest('tr').find('.product').text('');
			var productId = $(ev.currentTarget).val();
			if(productId != '') {
				var productModel = this.productCollection.get(productId);
				$(ev.currentTarget).closest('tr').find('.product').text(productModel.get('product').name);
			}
		},
		
		onChangeTruckerType: function (ev) {
			this.fetchTruckerAccounts($(ev.currentTarget).val());
		},
		
		fetchTruckerAccounts: function (accountTypeId, accountId, contactId, truckerNumberId, truckingRate) {
			if(accountId != null)
				this.selectedTruckerAccountId = accountId;
			
			if(truckingRate != null)
				this.selectedTruckingRate = truckingRate;
			
			this.resetSelect($('#truckerAccount_id'));
			this.resetSelect($('#trucker_id'));
			this.resetSelect($('#truck_id'));
			
			if(accountTypeId != '') {
				this.showFieldThrobber('#truckerAccount_id');
				this.truckerAccountCollection.getTruckerAccountsByAccountType(accountTypeId);
			}
			
			this.toggleTruckingRate(accountTypeId);
			
			if(contactId != null)
				this.fetchTruckerContacts(accountId, contactId);
				
			if(truckerNumberId != null)
				this.fetchTruckerNumber(accountId, truckerNumberId);
		},
		
		onChangeTrucker: function (ev) {
			var id = $(ev.currentTarget).val();
			this.fetchTruckerContacts(id);
			this.fetchTruckerNumber(id);
		},
		
		fetchTruckerContacts: function(accountId, contactId) {
			if(contactId != null)
				this.selectedTruckerContactId = contactId;
		
			this.resetSelect($('#trucker_id'));
			if(accountId != '') {
                this.showFieldThrobber('#trucker_id');
				this.truckerContactCollection.getContactsByAccountId(accountId);
			}
		},
		
		fetchTruckerNumber: function(accountId, truckerNumberId) {
			if(truckerNumberId != null)
				this.selectedTruckerNumber = truckerNumberId;
		
			this.resetSelect($('#truck_id'));
			if(accountId != '') {
                this.showFieldThrobber('#truck_id');
				this.truckerNumberCollection.getTruckerNumbersByAccount(accountId);
			}
		},
		
		onChangeTrailer: function (ev) {
			this.fetchTrailer($(ev.currentTarget).val());
		},
		
		fetchTrailer: function (accountId, trailerId) {
			if(trailerId != null)
				this.selectedTrailerId = trailerId;
				
			this.resetSelect($('#trailer_id'));
			if(accountId != '') {
                this.showFieldThrobber('#trailer_id');
				this.trailerCollection.getTrailerByAccountId(accountId);
			}
		},
		
		onChangeOriginLoader: function (ev) {
			this.fetchOriginLoaderContacts($(ev.currentTarget).val());
		},
		
		fetchOriginLoaderContacts: function(accountId, contactId) {
			if(contactId != null)
				this.selectedOriginLoaderContactId = contactId;
		
			this.resetSelect($('#originloader_id'));
			if(accountId != '') {
                this.showFieldThrobber('#originloader_id');
				this.originLoaderContactCollection.getContactsByAccountId(accountId);
			}
		},
		
		onChangeDestinationLoader: function (ev) {
			this.fetchDestinationLoaderContacts($(ev.currentTarget).val());
		},
		
		fetchDestinationLoaderContacts: function (accountId, contactId) {
			if(contactId != null)
				this.selectedDestinationLoaderContactId = contactId;
			
			this.resetSelect($('#destinationloader_id'));
			if(accountId != '') {
                this.showFieldThrobber('#destinationloader_id');
				this.destinationLoaderContactCollection.getContactsByAccountId(accountId);
			}
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
		
		onKeyUpTrackingRate: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			this.computeTrailerRent(this.removeCommaFromNumber($(ev.target).val()));
		},
		
		onKeyUpDistance: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			this.computeTruckingRate();
		},
		
		onKeyUpQuantity: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			this.computeTotalQuantity();
		},
		
		computeTotalQuantity: function () {
			var thisObj = this;
			var total = 0;
			this.$el.find('.quantity').each(function (index, element) {
				var value = thisObj.removeCommaFromNumber($(element).val());
				if(!isNaN(value) && value != '') {
					total += parseFloat(value);
				}
			});
			
			if(total != 0)
				$('#total-quantity').val(this.addCommaToNumber(total.toFixed(4)));
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
						$('#truckingrate').val(this.addCommaToNumber(this.selectedTruckingRate));
					
					this.computeTrailerRent();
				}
				else {
					this.truckingRateEditable = false;
					$('#truckingrate').attr('readonly', true);
					this.computeTruckingRate();
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
				var distance = this.getFloatValueFromField(this.subContainer.find('#distance'));
				var totalQuantity = this.getFloatValueFromField(this.subContainer.find('#total-quantity'));
				
				var truckingRate = (distance > 0 && totalQuantity > 0)? (((this.freightRate * distance) + this.loadingRate + this.unloadingRate) / totalQuantity).toFixed(2) : ''; //divide by tons
				this.subContainer.find('#truckingrate').val(this.addCommaToNumber(truckingRate));
				
				if(truckingRate != '')
					this.subContainer.find('#trailerrate').val(this.addCommaToNumber((truckingRate * this.trailerPercentageRate / 100).toFixed(2)));
				else
					this.subContainer.find('#trailerrate').val('0.00');
			}
		},
		
		computeTrailerRent: function (haulingRate) {
			if(this.truckingRateEditable) {
				if(typeof haulingRate === 'undefined')
					haulingRate = this.getFloatValueFromField(this.subContainer.find('#truckingrate'));
				
				if(!isNaN(haulingRate) && haulingRate != 0) {
					trailerRent = haulingRate * this.trailerPercentageRate / 100;
					this.subContainer.find('#trailerrate').val(this.addCommaToNumber(trailerRent.toFixed(2)));
				}
				else
					this.subContainer.find('#trailerrate').val('0.00');
			}
		},
		
		deleteSchedule: function () {
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this schedule?');
			if(verifyDelete) {
				this.model.destroy({
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						//Global.getGlobalVars().app_router.navigate(Const.URL.PICKUPSCHEDULE+'/'+thisObj.poId, {trigger: true});
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
		
		showMap: function () {
			this.googleMaps.showModalGetDestinationDistance(this.distanceMarkers);
			return false;
		},
		
		changeHasFuelCharge: function (ev) {
			if($(ev.currentTarget).is(':checked')) {
				this.hasFuelCharge = true;
				this.computeFuelCharge();
			}
			else {
				this.hasFuelCharge = false;
				this.subContainer.find('#fuelcharge').val('');
			}
		},
		
		computeFuelCharge: function () {
			var fuelRate = (this.fuelRate != null)? this.fuelRate : 0;
			var loadedDistance = this.getFloatValueFromField(this.subContainer.find('#distance-loaded'));
			var fuelCharge = fuelRate * loadedDistance;
			this.subContainer.find('#fuelcharge').val(this.addCommaToNumber(fuelCharge.toFixed(2)));
		},
		
		postDisplayForm: function () {},
		
		destroySubViews: function () {
			if(this.googleMaps != null)
				this.googleMaps.destroyView();
		},
	});

	return PickUpScheduleAddView;
});