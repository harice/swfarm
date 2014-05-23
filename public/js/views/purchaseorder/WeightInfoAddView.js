define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/POWeightInfoModel',
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
			POWeightInfoModel,
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
				separator: '-',
				productFieldClass: ['transportScheduleProduct_id', 'bales', 'pounds'],
				productFieldClassRequired: ['bales', 'pounds'],
				productFieldExempt: [],
				productFieldSeparator: '.',
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
				previous_po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
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
			//this.maskInputs();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poWeightInfoFrom').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					//var data = thisObj.formatFormField($(form).serializeObject());
					console.log(data);
					
					data = thisObj.segregateFormField(data);
					data['transportSchedule_id'] = thisObj.schedId;
					console.log(data);
					
					var poWeightInfoModel = new POWeightInfoModel(data);
					
					poWeightInfoModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								//Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: poWeightInfoModel.getAuth(),
						}
					);
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
						id: model.get('id'),
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
		
		segregateFormField: function (data) {
			var formData = {};
			
			var segregatedData = [];
			for(var i = 0; i < this.options.routeType.length; i++) {
				var obj = {};
				segregatedData.push(obj);
			}
			
			//console.log(segregatedData);
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.separator);
					var typeIndex = this.options.routeType.indexOf(arrayKey[0])
					
					//console.log('type:'+arrayKey[0]);
					//console.log('typeIndex:'+typeIndex);
					
					if(typeIndex !== -1 && arrayKey.length > 1) {
						arrayKey.shift();
						var k = arrayKey.join(this.options.separator); //console.log(k);
						segregatedData[typeIndex][k] = value; //console.log(value);
					}
				}
			}
			
			for(var i = 0; i < this.options.routeType.length; i++) {
				formData[this.options.routeType[i]+'_info'] = this.formatFormField(segregatedData[i]);
			}
			
			return formData;
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
							var arrayBidProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									arrayBidProductFields[productFieldClass[i]] = fieldValue;
								}
							}
								
							formData.products.push(arrayBidProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'change #pickup-scaleAccount_id': 'onChangePickupScaleAccount',
			'change #dropoff-scaleAccount_id': 'onChangeDropoffScaleAccount',
			'change #pickup-scales': 'onChangePickupScales',
			'change #dropoff-scales': 'onChangeDropoffScales',
			'keyup .mask-bales': 'formatNumber',
			'keyup .gross': 'onKeyUpGross',
			'blur .gross': 'onBlurTon',
			'keyup .tare': 'onKeyUpTare',
			'blur .tare': 'onBlurTon',
			'keyup .product-bales': 'onKeyUpProductBales',
			'keyup .product-pounds': 'onKeyUpPounds',
			'blur .product-pounds': 'onBlurPound',
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
		
		onChangePickupScales: function (ev) {
			var scaleId = $(ev.currentTarget).val();
			if(scaleId != '') {
				var scaleModel = this.pickupScaleCollection.get(scaleId);
				$(ev.currentTarget).closest('tr').find('.fee').val(this.addCommaToNumber(scaleModel.get('rate')));
			}
		},
		
		onChangeDropoffScales: function (ev) {
			var scaleId = $(ev.currentTarget).val();
			if(scaleId != '') {
				var scaleModel = this.dropoffScaleCollection.get(scaleId);
				$(ev.currentTarget).closest('tr').find('.fee').val(this.addCommaToNumber(scaleModel.get('rate')));
			}
		},
		
		onKeyUpGross: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			
			var gross = this.removeCommaFromNumber($(ev.target).val());
			gross = (isNaN(gross))? 0 : gross;
			var tare = this.removeCommaFromNumber($(ev.target).closest('tr').find('.tare').val());
			tare = (isNaN(tare))? 0 : tare;
			var net = gross - tare;
			
			$(ev.target).closest('tr').find('.net').text(this.addCommaToNumber(net.toFixed(4), 4));
		},
		
		onKeyUpTare: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			
			var tare = this.removeCommaFromNumber($(ev.target).val());
			tare = (isNaN(tare))? 0 : tare;
			var gross = this.removeCommaFromNumber($(ev.target).closest('tr').find('.gross').val());
			gross = (isNaN(gross))? 0 : gross;
			var net = gross - tare;
			
			$(ev.target).closest('tr').find('.net').text(this.addCommaToNumber(net.toFixed(4), 4));
		},
		
		onKeyUpProductBales: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target);
			
			var thisObj = this;
			var totalBales = 0;
			$(ev.target).closest('tbody').find('.product-bales').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				totalBales += (isNaN(value))? 0 : value;
			});
			
			$(ev.target).closest('table').find('tfoot .total-bales').text(this.addCommaToNumber(totalBales.toString()));
		},
		
		onKeyUpPounds: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target);
			var pound = this.removeCommaFromNumber($(ev.target).val());
			pound = (isNaN(pound))? 0 : pound;
			$(ev.target).closest('tr').find('.product-net').text(this.addCommaToNumber((pound * Const.LB2TON).toFixed(4)));
			
			var thisObj = this;
			var totalPounds = 0;
			$(ev.target).closest('tbody').find('.product-pounds').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).val());
				totalPounds += (isNaN(value))? 0 : value;
			});
			
			$(ev.target).closest('table').find('tfoot .total-pounds').text(this.addCommaToNumber(totalPounds.toFixed(2)));
			
			this.computeTotalProductNetTon($(ev.target).closest('table').find('tfoot .total-net-tons'));
		},
		
		computeTotalProductNetTon: function (field) {
			var thisObj = this;
			var totalNet = 0;
			field.closest('table').find('.product-net').each(function () {
				var value = thisObj.removeCommaFromNumber($(this).text());
				totalNet += (isNaN(value))? 0 : value;
			});
			
			field.text(this.addCommaToNumber(totalNet.toFixed(4)));
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
	});

	return WeightInfoAddView;
});