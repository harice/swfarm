define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
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
			PurchaseOrderModel,
			POScheduleModel,
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
			
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.wiId = null;
			this.type = option.type;
			this.h1Title = 'Weight Info';
			this.h1Small = 'add';
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			
			this.options = {
				routeType: ['pickup', 'dropoff'],
				separator: '-',
				productFieldClass: ['transportScheduleProduct_id', 'bales', 'pounds', 'id'],
				productFieldClassRequired: ['bales', 'pounds'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['fee', 'bales', 'gross', 'tare', 'pounds'],
			};
			
			this.purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
			this.purchaseOrderModel.on('change', function() {
				thisObj.poScheduleModel.runFetch();
				thisObj.off('change');
			});
			
			this.poScheduleModel = new POScheduleModel({id:this.schedId});
			this.poScheduleModel.on('change', function() {
				thisObj.productCollection.getScheduleProducts(thisObj.schedId);
				thisObj.off('change');
			});
			
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
			
			this.scaleCollection = new ScaleCollection();
			this.scaleCollection.on('sync', function() {
				thisObj.generateScales();
			});
			this.scaleCollection.on('error', function(collection, response, options) {
				//
			});
		},
		
		render: function(){
			this.purchaseOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				scaler_account_list: this.getScalerDropDown(),
				cancel_url: (this.wiId == null && this.type != Const.WEIGHTINFO.PICKUP && this.type != Const.WEIGHTINFO.DROPOFF)? '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId : '#/'+Const.URL.POWEIGHTINFO+'/'+this.poId+'/'+this.schedId,
			};
			
			if(this.wiId != null)
				innerTemplateVariables['wiId'] = this.wiId;
			
			if(this.type == Const.WEIGHTINFO.PICKUP || this.type == Const.WEIGHTINFO.DROPOFF)
				innerTemplateVariables['wiType'] = this.type.charAt(0).toUpperCase() + this.type.slice(1);
			
			var innerTemplate = _.template(weightInfoAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			this.supplyPOInfo();
			
			if(this.wiId != null)
				this.supplyWeightInfoData();
			else
				this.addProducts();
		},
		
		supplyPOInfo: function () {
			var dateAndTime = this.convertDateFormat(this.poScheduleModel.get('scheduledate'), this.dateFormatDB, this.dateFormat, '-')
								+' '+this.poScheduleModel.get('scheduletimeHour')
								+':'+this.poScheduleModel.get('scheduletimeMin')
								+' '+this.poScheduleModel.get('scheduletimeAmPm');
			
			this.$el.find('#po-number').val(this.purchaseOrderModel.get('order_number'));
			this.$el.find('#producer').val(this.purchaseOrderModel.get('account').name);
			this.$el.find('#date-and-time').val(dateAndTime);
			
			if(this.wiId != null) {
				this.$el.find('#weight-ticket-no').val(this.model.get('weightTicketNumber'));
				this.$el.find('#loading-ticket-no').val(this.model.get('loadingTicketNumber'));
			}
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#poWeightInfoFrom').validate({
				submitHandler: function(form) {
					
					var dataTemp = thisObj.formatFormField($(form).serializeObject());
					var type = dataTemp.weightinfo_type;
					delete dataTemp.weightinfo_type;
					
					var data = {};
					data[type.toLowerCase()+'_info'] = dataTemp;
					data['transportSchedule_id'] = thisObj.schedId;
					
					if(thisObj.wiId != null)
						data['id'] = thisObj.schedId;
					
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
			var ctr = 0;
			
			_.each(thisObj.productCollection.models, function (model) {
				var templateVariables = {
					schedule_product_id: model.get('id'),
					stock_number: model.get('productorder').stacknumber,
					name: model.get('productorder').product.name,
					net: '0.00',
					number: '.'+ctr++,
				};
				var productItemTemplate = _.template(weightInfoProductItemTemplate, templateVariables);
				thisObj.$el.find('#product-list tbody').append(productItemTemplate);
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
		
		generateScales: function () {
			var dropDown = '';
			_.each(this.scaleCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			this.$el.find('#scales').append(dropDown);
			
			if(typeof this.selectedScaleId != 'undefined' && this.selectedScaleId != null) {
				this.$el.find('#scales').val(this.selectedScaleId).change();
				this.selectedScaleId = null;
			}
			else {
				if(this.scaleCollection.models.length == 1)
					this.$el.find('#scales').val(this.scaleCollection.models[0].get('id')).change();
			}
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
			'change #scaleAccount_id': 'onChangeScaleAccount',
			'change #scales': 'onChangeScales',
			'keyup .mask-bales': 'formatNumber',
			'keyup .gross': 'onKeyUpGross',
			'blur .gross': 'onBlurTon',
			'keyup .tare': 'onKeyUpTare',
			'blur .tare': 'onBlurTon',
			'keyup .product-bales': 'onKeyUpProductBales',
			'keyup .product-pounds': 'onKeyUpPounds',
			'blur .product-pounds': 'onBlurPound',
		},
		
		onChangeScaleAccount: function (ev) {
			this.fetchScale($(ev.currentTarget).val());
		},
		
		fetchScale: function (accountId, scaleId) {
			if(scaleId != null)
				this.selectedScaleId = scaleId;
				
			this.resetSelect($('#scales'));
			this.$el.find('#fee').val('');
			if(accountId != '')
				this.scaleCollection.getScalesByAccount(accountId);
		},
		
		onChangeScales: function (ev) {
			this.$el.find('#fee').val('');
			var scaleId = $(ev.currentTarget).val();
			if(scaleId != '') {
				var scaleModel = this.scaleCollection.get(scaleId);
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
		
		supplyWeightInfoData: function () {},
	});

	return WeightInfoAddView;
});