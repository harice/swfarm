define([
	'backbone',
	'bootstrapdatepicker',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/base/ListView',
	'views/autocomplete/AccountTruckerAutoCompleteView',
	'views/autocomplete/AccountLoaderAutoCompleteView',
	'collections/account/AccountTruckerCollection',
	'collections/account/AccountLoaderCollection',
	'collections/purchaseorder/POScheduleCollection',
	'models/purchaseorder/TruckingRateModel',
	'models/purchaseorder/POScheduleModel',
	'text!templates/purchaseorder/purchaseOrderScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddScheduleTemplate.html',
	'text!templates/purchaseorder/purchaseOrderScheduleInnerListTemplate.html',
	'constant',
	'views/weightticket/WeightTicketView',
], function(Backbone,
			DatePicker,
			Validate,
			TextFormatter,
			PhoneNumber,
			ListView,
			AccountTruckerAutoCompleteView,
			AccountLoaderAutoCompleteView,
			AccountTruckerCollection,
			AccountLoaderCollection,
			POScheduleCollection,
			TruckingRateModel,
			POScheduleModel,
			purchaseOrderScheduleTemplate,
			purchaseOrderAddScheduleTemplate,
			purchaseOrderScheduleInnerListTemplate,
			Const,
            WeightTicketView
){
	
	var AddScheduleView = ListView.extend({
		el: "#po-schedule",
		
		initialize: function (option) {
			this.extendListEvents();
			var thisObj = this;
			this.bidId = option.id;
			this.addFieldsClone = null;
			this.truckerAutoCompleteResult = [];
			this.loaderOriginAutoCompleteResult = [];
			this.loaderDestinationAutoCompleteResult = [];
			this.truckingRateEditable = false;
			this.truckingRatePerMile = null;
			this.formContainer = null;
			
			this.truckingRateModel = new TruckingRateModel();
			this.truckingRateModel.on('change', function() {
				thisObj.truckingRatePerMile = this.get('truckingrate');
				this.off('change');
			});
			this.truckingRateModel.runFetch();
			
			this.collection = new POScheduleCollection({id:option.id});
			this.collection.on('sync', function() {
				thisObj.displaySchedule();
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function () {
			this.renderList(1);
		},
		
		displaySchedule: function () {
			var thisObj = this;
			
			var compiledTemplate = _.template(purchaseOrderScheduleTemplate, {});
			this.$el.html(compiledTemplate);
			this.formContainer = $('#po-schedule-form-cont');
		},
		
		displayList: function () {
			
			var data = {
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderScheduleInnerListTemplate, data);
			$("#po-schedule-list tbody").html(innerListTemplate);
			
			//this.generatePagination();
		},
		
		resetAddFields: function () {
			if(this.truckingRatePerMile != null) {
				var addFieldsContainer = this.formContainer;
				addFieldsContainer.empty();
				
				if(this.addFieldsClone == null) {
					var addTemplate = _.template(purchaseOrderAddScheduleTemplate, {});
					addFieldsContainer.html(addTemplate);
					this.populateTimeOPtions();
					this.addFieldsClone = addFieldsContainer.find('> form:first-child').clone();
				}
				else
					addFieldsContainer.html(this.addFieldsClone.clone());
					
				this.initCalendar();
				this.initFormProperties();
				this.initAutocomplete();
			}
			else {
				this.displayGrowl('Fetching data please retry again after a few seconds.', 'info');
			}
		},
		
		populateTimeOPtions: function () {
			var hourOptions = '';
			for(var i=1; i<=12; i++) {
				var hour = i+'';
				hour = (hour.length > 1)? i : '0'+i;
				hourOptions += '<option value="'+i+'">'+hour+'</option>';
			}
			this.$el.find('.hours').html(hourOptions);
			
			var minutesOptions = '';
			for(var i=0; i< 60; i++) {
				var minute = i+'';
				minute = (minute.length > 1)? i : '0'+i;
				minutesOptions += '<option value="'+i+'">'+minute+'</option>';
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
		
		initFormProperties: function () {
			var thisObj = this;
			$('#bid_id').val(this.bidId);
			
			var validate = $('#POScheduleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					console.log(data);
					
					var poScheduleModel = new POScheduleModel(data);
					
					poScheduleModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								thisObj.clearFormContainer();
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
					else {
						error.insertAfter(element);
					}
				},
			});
		},
		
		initAutocomplete: function () {
			var thisObj = this;
			
			//producer
			var accountTruckerCollection = new AccountTruckerCollection();
			this.accountTruckerAutoCompleteView = new AccountTruckerAutoCompleteView({
                input: $('#trucker'),
				hidden: $('#trucker-id'),
                collection: accountTruckerCollection,
            });
			
			this.accountTruckerAutoCompleteView.on('loadResult', function () {
				thisObj.truckerAutoCompleteResult = [];
				_.each(accountTruckerCollection.models, function (model) {
					thisObj.truckerAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountTruckerAutoCompleteView.onSelect = function (model) {
				var accountType = model.get('accounttype')[0].name;
				thisObj.toggleTruckingRate(accountType);
			};
			
			this.accountTruckerAutoCompleteView.render();
			
			//Loader Origin
			var accountLoaderOriginCollection = new AccountLoaderCollection();
			this.accountLoaderOriginAutoCompleteView = new AccountLoaderAutoCompleteView({
                input: $('#originloader'),
				hidden: $('#originloader-id'),
                collection: accountLoaderOriginCollection,
            });
			
			this.accountLoaderOriginAutoCompleteView.on('loadResult', function () {
				thisObj.loaderOriginAutoCompleteResult = [];
				_.each(accountLoaderOriginCollection.models, function (model) {
					thisObj.loaderOriginAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountLoaderOriginAutoCompleteView.render();
			
			//Loader Destination
			var accountLoaderDestinationCollection = new AccountLoaderCollection();
			this.accountLoaderDestinationAutoCompleteView = new AccountLoaderAutoCompleteView({
                input: $('#destinationloader'),
				hidden: $('#destinationloader-id'),
                collection: accountLoaderDestinationCollection,
            });
			
			this.accountLoaderDestinationAutoCompleteView.on('loadResult', function () {
				thisObj.loaderDestinationAutoCompleteResult = [];
				_.each(accountLoaderDestinationCollection.models, function (model) {
					thisObj.loaderDestinationAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountLoaderDestinationAutoCompleteView.render();
		},
		
		toggleTruckingRate: function (accountType) {
			if(Const.PO.SCHEDULE.EDITABLERATE.ACCOUNTTYPE.indexOf(accountType) >= 0) {
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
		
		computeTruckingRate: function () {
			var distanceField = $('#distance');
			var distanceValue = (!isNaN(parseFloat(distanceField.val())))? parseFloat(distanceField.val()) : 0;
			$('#truckingrate').val(parseFloat(distanceValue * this.truckingRatePerMile).toFixed(2));
		},
		
		events: {
			'blur #trucker': 'validateTrucker',
			'blur #originloader': 'validateTrucker',
			'blur #destinationloader': 'validateTrucker',
			'click #add-schedule': 'showAddSchedule',
			'click #cancel-add-weight-info': 'cancelAddSchedule',
			'click #show-weight-info': 'showWeightTicket',
			'blur #truckingrate': 'onBlurTruckingRate',
			'blur #distance': 'onBlurDistance',
			'blur #fuelcharge': 'onBlurFuelCharge',
			'blur .loader': 'onBlurLoader',
		},
		
		validateTrucker: function (ev) {
			var labelField = $(ev.target);
			var labelFieldId = $(ev.target).attr('id');
			var idField = '';
			var account = '';
			var autoCompleteView = null;
			
			switch(labelFieldId) {
				case 'trucker':
					idField = labelField.siblings('#trucker-id');
					autoCompleteView = this.accountTruckerAutoCompleteView;
					break;
				case 'originloader':
					idField = labelField.siblings('#originloader-id');
					autoCompleteView = this.accountLoaderOriginAutoCompleteView;
					break;
				case 'destinationloader':
					idField = labelField.siblings('#destinationloader-id');
					autoCompleteView = this.accountLoaderDestinationAutoCompleteView;
					break;
				default:
					break;
			}
			
			account = this.accountIsInFetchedData(labelField.val(), idField.val(), labelFieldId);
			
			if(!autoCompleteView.$el.is(':hover')) {
				if(account !== false) {
					if(account.id != null) {
						labelField.val(account.name);
						idField.val(account.id);
					}
					else
						labelField.val(account.name);
				}
				else {
					labelField.val('');
					idField.val('');
				}
				labelField.siblings('.autocomplete').hide();
			}
		},
		
		accountIsInFetchedData: function(name, id, type) {
			
			var autoCompleteResult = null;
			
			switch(type) {
				case 'trucker':
					autoCompleteResult = this.truckerAutoCompleteResult;
					break;
				case 'originloader':
					autoCompleteResult = this.loaderOriginAutoCompleteResult;
					break;
				case 'destinationloader':
					autoCompleteResult = this.loaderDestinationAutoCompleteResult;
					break;
				default:
					break;
			}
			
			if(name != null) {
				for(var i = 0; i < autoCompleteResult.length; i++) {
					if(autoCompleteResult[i].name.toLowerCase() == name.toLowerCase()) {
						
						if(id != null && id != '' && parseInt(id) == parseInt(autoCompleteResult[i].id))
							return {name:autoCompleteResult[i].name};
						
						return {name:autoCompleteResult[i].name, id:autoCompleteResult[i].id};
					}
				}
			}
			return false;
		},
		
		showAddSchedule: function () {
			this.resetAddFields();
			console.log('showAddSchedule');
			return false;
		},
		
		cancelAddSchedule: function () {
			this.clearFormContainer();
			console.log('cancelAddSchedule');
			return false;
		},
		
		showWeightTicket: function () {
			console.log('showWeightTicket');
			this.clearFormContainer();
			
            new WeightTicketView({id:1}).render();
            
			return false;
		},
		
		clearFormContainer: function () {
			this.formContainer.empty();
		},
		
		onBlurTruckingRate: function (ev) {
			this.toFixedValue($(ev.target), 2);
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
		
		toFixedValue: function (field, decimal) {
			var value = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()).toFixed(decimal) : '';
			field.val(value);
		}
	});
	
	return AddScheduleView;
});
