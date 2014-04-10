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
	'text!templates/purchaseorder/purchaseOrderViewScheduleTemplate.html',
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
			purchaseOrderViewScheduleTemplate,
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
			this.viewFieldsClone = null;
			this.truckerAutoCompleteResult = [];
			this.loaderOriginAutoCompleteResult = [];
			this.loaderDestinationAutoCompleteResult = [];
			this.truckingRateEditable = false;
			this.truckingRatePerMile = null;
			this.formContainer = null;
			this.schedTableElement = null;
			this.activeModel = null;
			this.weightTicketView = null;
			
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
			this.schedTableElement = $('#po-schedule-list');
		},
		
		displayList: function () {
			
			var data = {
				schedules: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderScheduleInnerListTemplate, data);
			this.schedTableElement.find('tbody').html(innerListTemplate);
			
			//this.generatePagination();
		},
		
		resetViewFields: function () {
			var clone = null;
			
			var viewFieldsContainer = this.formContainer;
			viewFieldsContainer.empty();
			
			if(this.viewFieldsClone == null) {
				var viewTemplate = _.template(purchaseOrderViewScheduleTemplate, {});
				viewFieldsContainer.html(viewTemplate);
				clone = viewFieldsContainer.find('> form:first-child');
				this.viewFieldsClone = clone.clone();
			}
			else {
				clone = this.viewFieldsClone;
				viewFieldsContainer.html(clone);
			}
			
			return clone;
		},
		
		resetAddFields: function () {
			var clone = null;
			
			if(this.truckingRatePerMile != null) {
				var addFieldsContainer = this.formContainer;
				addFieldsContainer.empty();
				
				if(this.addFieldsClone == null) {
					var addTemplate = _.template(purchaseOrderAddScheduleTemplate, {});
					addFieldsContainer.html(addTemplate);
					this.populateTimeOPtions();
					clone = addFieldsContainer.find('> form:first-child');
					this.addFieldsClone = clone.clone();
				}
				else {
					clone = this.addFieldsClone.clone();
					addFieldsContainer.html(clone);
				}
					
				this.initCalendar();
				this.initFormProperties();
				this.initAutocomplete();
			}
			else {
				this.displayGrowl('Fetching data please retry again after a few seconds.', 'info');
			}
			
			return clone;
		},
		
		populateTimeOPtions: function () {
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
		
		initFormProperties: function () {
			var thisObj = this;
			$('#bid_id').val(this.bidId);
			this.truckerAutoCompleteResult = [];
			this.loaderOriginAutoCompleteResult = [];
			this.loaderDestinationAutoCompleteResult = [];
			
			var validate = $('#POScheduleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					var poScheduleModel = new POScheduleModel(data);
					
					poScheduleModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								thisObj.clearFormContainer();
								thisObj.renderList(1);
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
		
		populateScheduleData: function (schedId, form, type) {
			this.activeModel = this.collection.get(schedId);
			
			if(type == 'edit') {
				form.find('#bid_id').before('<input id="schedId" type="hidden" name="id" value="'+this.activeModel.get('id')+'" />');
				form.find('#po-sched-start-date input').val(this.activeModel.get('scheduledate'));
				
				this.truckerAutoCompleteResult = [{name:this.activeModel.get('trucker')[0].name, id:this.activeModel.get('trucker')[0].id}];
				this.toggleTruckingRate(this.activeModel.get('trucker')[0].accounttype[0].name);
				this.loaderOriginAutoCompleteResult = [{name:this.activeModel.get('origin_loader')[0].name,id:this.activeModel.get('origin_loader')[0].id}];
				this.loaderDestinationAutoCompleteResult = [{name:this.activeModel.get('destination_loader')[0].name,id:this.activeModel.get('destination_loader')[0].id}];
				
				form.find('#trucker').val(this.activeModel.get('trucker')[0].name);
				form.find('#trucker-id').val(this.activeModel.get('trucker')[0].id);
				
				form.find('#originloader').val(this.activeModel.get('origin_loader')[0].name);
				form.find('#originloader-id').val(this.activeModel.get('origin_loader')[0].id);
				
				form.find('#destinationloader').val(this.activeModel.get('destination_loader')[0].name);
				form.find('#destinationloader-id').val(this.activeModel.get('destination_loader')[0].id);
				form.find('#delete-schedule').show();
			}
			else {
				form.find('#schedId').val(this.activeModel.get('id'));
				form.find('#po-sched-start-date').val(this.activeModel.get('scheduledate'));
				form.find('#truckerview').val(this.activeModel.get('trucker')[0].name);
				form.find('#originloaderview').val(this.activeModel.get('origin_loader')[0].name);
				form.find('#destinationloaderview').val(this.activeModel.get('destination_loader')[0].name);
			}
			
			form.find('.hours').val(this.activeModel.get('scheduletimeHour'));
			form.find('.minutes').val(this.activeModel.get('scheduletimeMin'));
			form.find('.ampm').val(this.activeModel.get('scheduletimeAmPm'));
			form.find('#distance').val(this.activeModel.get('distance'));
			form.find('#fuelcharge').val(this.activeModel.get('fuelcharge')).blur();
			form.find('#truckingrate').val(this.activeModel.get('truckingrate')).blur();
			form.find('#originloadersfee').val(this.activeModel.get('originloadersfee')).blur();
			form.find('#destinationloadersfee').val(this.activeModel.get('destinationloadersfee')).blur();
			form.find('#show-weight-info').show();
		},
		
		showViewForm: function (schedId) {
			console.log('showViewForm');
			var form = this.resetViewFields();
			this.populateScheduleData(schedId, form, 'view');
		},
		
		showEditForm: function (schedId) {
			var form = this.resetAddFields();
			this.populateScheduleData(schedId, form, 'edit');
		},
		
		toggleTruckingRate: function (accountType) {
			if(Const.PO.PICKUPSCHEDULE.EDITABLERATE.ACCOUNTTYPE.indexOf(accountType) >= 0) {
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
			'click #edit-schedule': 'showEditSchedule',
			'click #delete-schedule': 'deleteSchedule',
			'click #cancel-add-schedule': 'cancelAddSchedule',
			'click #back-to-view': 'backToViewSchedule',
			'click #show-weight-info': 'showWeightTicket',
			'blur #truckingrate': 'onBlurTruckingRate',
			'blur #distance': 'onBlurDistance',
			'blur #fuelcharge': 'onBlurFuelCharge',
			'blur .loader': 'onBlurLoader',
			'click #po-schedule-list tbody tr': 'selectSchedule',
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
			this.removeListActive();
			this.resetAddFields();
			return false;
		},
		
		deleteSchedule: function () {
			var thisObj = this;
			
			var verifyDelete = confirm('Are you sure you want to delete this schedule?');
			if(verifyDelete) {
				this.activeModel.destroy({
					success: function (model, response, options) {
						thisObj.displayMessage(response);
						thisObj.renderList(1);
						this.activeModel = null;
					},
					error: function (model, response, options) {
						thisObj.displayMessage(response);
					},
					wait: true,
					headers: this.activeModel.getAuth(),
				});
			}
			
			return false;
		},
		
		cancelAddSchedule: function () {
			this.clearFormContainer();
			this.removeListActive();
			return false;
		},
		
		showWeightTicket: function () {
			this.clearFormContainer();
            this.weightTicketView = new WeightTicketView({id:this.bidId}).render();
			return false;
		},
		
		clearFormContainer: function () {
			this.formContainer.empty();
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
		
		toFixedValue: function (field, decimal) {
			var value = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()).toFixed(decimal) : '';
			field.val(value);
		},
		
		selectSchedule: function (ev) {
			$(ev.target).closest('tr').addClass('active').siblings('tr').removeClass('active');
			var schedId = $(ev.target).closest('tr').find('.schedId').val();
			this.showViewForm(schedId);
		},
		
		showEditSchedule: function (ev) {
			var schedId = $(ev.target).closest('form').find('#schedId').val();
			this.showEditForm(schedId);
			return false;
		},
		
		backToViewSchedule: function (ev) {
			var schedId = $(ev.target).closest('form').find('#schedId').val();
			this.showViewForm(schedId);
			return false;
		},
		
		removeListActive: function () {
			this.schedTableElement.find('tbody tr.active').removeClass('active');
			this.activeModel = null;
		},
	});
	
	return AddScheduleView;
});
