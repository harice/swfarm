define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'models/purchaseorder/TruckingRateModel',
	'models/purchaseorder/POScheduleModel',
	'collections/account/AccountTruckerCollection',
	'collections/account/AccountLoaderCollection',
	'collections/product/ProductCollection',
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
			CustomAutoCompleteView,
			TruckingRateModel,
			POScheduleModel,
			AccountTruckerCollection,
			AccountLoaderCollection,
			ProductCollection,
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
			this.truckingRatePerMile = null;
			
			this.options = {
				productFieldClone: null,
			},
			
			this.truckingRateModel = new TruckingRateModel();
			this.truckingRateModel.on('change', function() {
				thisObj.truckingRatePerMile = this.get('truckingrate');
				thisObj.displayForm();
				this.off('change');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				thisObj.displayForm();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			//this.truckingRateModel.runFetch();
			this.productCollection.getAllModel();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				sched_url : '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poid,
				trucker_account_list : '',
				trailer_account_list : '',
				originloader_account_list : '',
				destinationloader_account_list : '',
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
			//this.initAutocomplete();
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
				//this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				//this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}
				
			//this.addValidationToProduct();
			return clone;
		},
		
		getProductDropdown: function () {
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		initAutocomplete: function () {
			var thisObj = this;
			
			//producer
			if(this.accountTruckerAutoCompleteView != null)
				this.accountTruckerAutoCompleteView.deAlloc();
			
			var accountTruckerCollection = new AccountTruckerCollection();
			this.accountTruckerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#trucker'),
				hidden: $('#trucker-id'),
                collection: accountTruckerCollection,
				fields: ['accounttype'],
            });
			
			this.accountTruckerAutoCompleteView.onSelect = function (model) {
				var accountType = model.get('accounttype')[0].name;
				thisObj.toggleTruckingRate(accountType);
			};
			
			this.accountTruckerAutoCompleteView.typeInCallback = function (result) {
				var accountType = result.accounttype[0].name;
				thisObj.toggleTruckingRate(accountType);
			},
			
			this.accountTruckerAutoCompleteView.render();
			
			//Loader Origin
			if(this.accountLoaderOriginAutoCompleteView != null)
				this.accountLoaderOriginAutoCompleteView.deAlloc();
			
			var accountLoaderOriginCollection = new AccountLoaderCollection();
			this.accountLoaderOriginAutoCompleteView = new CustomAutoCompleteView({
                input: $('#originloader'),
				hidden: $('#originloader-id'),
                collection: accountLoaderOriginCollection,
            });
			
			this.accountLoaderOriginAutoCompleteView.render();
			
			//Loader Destination
			if(this.accountLoaderDestinationAutoCompleteView != null)
				this.accountLoaderDestinationAutoCompleteView.deAlloc();
			
			var accountLoaderDestinationCollection = new AccountLoaderCollection();
			this.accountLoaderDestinationAutoCompleteView = new CustomAutoCompleteView({
                input: $('#destinationloader'),
				hidden: $('#destinationloader-id'),
                collection: accountLoaderDestinationCollection,
            });
			
			this.accountLoaderDestinationAutoCompleteView.render();
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
			'blur #truckingrate': 'onBlurTruckingRate',
			'blur #distance': 'onBlurDistance',
			'blur #fuelcharge': 'onBlurFuelCharge',
			'blur .loader': 'onBlurLoader',
			'click #delete-schedule': 'deleteSchedule',
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