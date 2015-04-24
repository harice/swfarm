define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/salesorder/SalesOrderModel',
	'models/salesorder/SOScheduleModel',
	'models/salesorder/SOWeightInfoModel',
	'models/document/DocumentModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/scale/ScaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/layout/tabsContentTemplate.html',
	'text!templates/salesorder/weightInfoAddTemplate.html',
	'text!templates/salesorder/weightInfoProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			SalesOrderModel,
			SOScheduleModel,
			SOWeightInfoModel,
			DocumentModel,
			ProductCollection,
			AccountCollection,
			ScaleCollection,
			contentTemplate,
			tabsContentTemplate,
			weightInfoAddTemplate,
			weightInfoProductItemTemplate,
			Global,
			Const
){

	var WeightInfoAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			this.soId = option.soId;
			this.schedId = option.schedId;
			this.wiId = null;
			this.type = option.type;
			this.h1Title = 'Weight Info';
			this.h1Small = 'add';
			this.inits();
		},
		
		inits: function () {
			var thisObj = this;
			
			this.subContainer.html(_.template(tabsContentTemplate, {'tabs':this.generateSOTabs(this.soId, 3)}));

			this.options = {
				routeType: ['pickup', 'dropoff'],
				separator: '-',
				productFieldClass: ['transportScheduleProduct_id', 'bales', 'pounds', 'id'],
				productFieldClassRequired: [],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['fee', 'bales', 'gross', 'tare', 'pounds'],
				fileFileClone: null,
			};
			
			this.salesOrderModel = new SalesOrderModel({id:this.soId});
			this.salesOrderModel.on('change', function() {
				thisObj.soScheduleModel.runFetch();
				thisObj.off('change');
			});
			
			this.soScheduleModel = new SOScheduleModel({id:this.schedId});
			this.soScheduleModel.on('change', function() {
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
			this.salesOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','add');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				scaler_account_list: this.getScalerDropDown(),
				cancel_url: (this.wiId == null && this.type != Const.WEIGHTINFO.PICKUP && this.type != Const.WEIGHTINFO.DROPOFF)? '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId : '#/'+Const.URL.SOWEIGHTINFO+'/'+this.soId+'/'+this.schedId,
				so: this.salesOrderModel,
				schedule: this.soScheduleModel,
			};
			
			if(this.wiId != null)
				innerTemplateVariables['wiId'] = this.wiId;
			
			if(this.type == Const.WEIGHTINFO.PICKUP || this.type == Const.WEIGHTINFO.DROPOFF)
				innerTemplateVariables['wiType'] = this.type;
			
			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);

			var innerTemplate = _.template(weightInfoAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
			// this.subContainer.html(compiledTemplate);
			
			this.initValidateForm();
			this.supplySOInfo();
			this.initPDFUpload();
			this.options.fileFileClone = $('#pdf-file').clone(true);
			
			if(this.wiId != null)
				this.supplyWeightInfoData();
			else
				this.addProducts();
		},
		
		supplySOInfo: function () {
			this.$el.find('#so-number').val(this.salesOrderModel.get('order_number'));
			this.$el.find('#producer').val(this.salesOrderModel.get('account').name);
			
			if(this.wiId != null) {
				this.$el.find('#weight-ticket-no').val(this.model.get('weightTicketNumber'));
				this.$el.find('#loading-ticket-no').val(this.model.get('loadingTicketNumber'));
			}
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#soWeightInfoFrom').validate({
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
					
					var soWeightInfoModel = new SOWeightInfoModel(data);
					
					soWeightInfoModel.save(
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
							headers: soWeightInfoModel.getAuth(),
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
					
					if(arrayKey.length < 2) {
						if(this.options.removeComma.indexOf(key) < 0 || value == '')
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
										if(this.options.removeComma.indexOf(productFieldClass[i]) < 0 || fieldValue == '')
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
			
			'click .attach-pdf': 'attachPDF',
			'change #pdf-file': 'readFile',
			'click #remove-pdf-filename': 'resetImageField',
			'click #undo-remove': 'undoRemove',
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
				this.$el.find('.fee').val(this.addCommaToNumber(scaleModel.get('rate')));
			}
		},
		
		onKeyUpGross: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 3);
			
			var gross = this.removeCommaFromNumber($(ev.target).val());
			gross = (isNaN(gross))? 0 : gross;
			var tare = this.removeCommaFromNumber(this.$el.find('.tare').val());
			tare = (isNaN(tare))? 0 : tare;
			var net = gross - tare;
			
			this.$el.find('.net').text(this.addCommaToNumber(net.toFixed(3), 3));
		},
		
		onKeyUpTare: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 3);
			
			var tare = this.removeCommaFromNumber($(ev.target).val());
			tare = (isNaN(tare))? 0 : tare;
			var gross = this.removeCommaFromNumber(this.$el.find('.gross').val());
			gross = (isNaN(gross))? 0 : gross;
			var net = gross - tare;
			
			this.$el.find('.net').text(this.addCommaToNumber(net.toFixed(3), 3));
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
			$(ev.target).closest('tr').find('.product-net').text(this.addCommaToNumber((pound * Const.LB2TON).toFixed(3)));
			
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
			
			field.text(this.addCommaToNumber(totalNet.toFixed(3)));
		},
		
		resetSelect: function (select) {
			select.find('option:gt(0)').remove();
		},
		
		initPDFUpload: function () {
			var thisObj = this;
			this.initAttachPDFWindow();
			
			this.$el.find('#modal-attach-pdf').on('hidden.bs.modal', function (e) {
				var field = thisObj.subContainer.find('#uploadedfile');
				
				if(thisObj.$el.find('#upload-field-cont').css('display') != 'none') {
					//console.log('empty');
					field.val('');
					field.attr('data-filename', '');
					thisObj.subContainer.find('#attach-pdf').addClass('no-attachment');
				}
				else {
					//console.log('not empty');
					var pdfFilenameElement = thisObj.subContainer.find('#pdf-filename');
					field.val(pdfFilenameElement.attr('data-id'));
					field.attr('data-filename', pdfFilenameElement.text());
					thisObj.subContainer.find('#attach-pdf').removeClass('no-attachment');
				}
			});
		},
		
		attachPDF: function (ev) {
			var field = this.subContainer.find('#uploadedfile');
			
			var clone = this.options.fileFileClone.clone(true);
			this.subContainer.find('#pdf-file').replaceWith(clone);
			
			if(field.val() == '') {
				this.subContainer.find('#pdf-icon-cont').hide();
				this.subContainer.find('#undo-remove').hide();
				this.subContainer.find('#upload-field-cont').show();
			}
			else {
				this.subContainer.find('#upload-field-cont').hide();
				this.subContainer.find('#pdf-icon-cont').show();
				this.subContainer.find('#pdf-filename').text(field.attr('data-filename'));
				this.subContainer.find('#pdf-filename').attr('data-id', field.val());
				
				this.subContainer.find('#previous-upload').val(field.attr('data-filename'));
				this.subContainer.find('#previous-upload').attr('data-id', field.val());
			}
			
			this.subContainer.find('#upload-error').hide();
			this.showConfirmationWindow('modal-attach-pdf');
			return false;
		},
		
		readFile: function (ev) {
			this.subContainer.find('#upload-error').hide();
			
			var thisObj = this;
			var file = ev.target.files[0];
			
			if(file.type != Const.MIMETYPE.PDF) {
				var clone = this.options.fileFileClone.clone(true);
				this.subContainer.find('#pdf-file').replaceWith(clone);
				this.subContainer.find('#upload-error').text('only upload a PDF file').show();
			}
			else {
				var reader = new FileReader();
				reader.onload = function (event) {
					//console.log('onload');
					//console.log(event);
					
					thisObj.uploadFile({
						type: file.type,
						size: file.size,
						name: file.name,
						content: event.target.result
					});
				};
				reader.readAsDataURL(file);
			}
		},
		
		uploadFile: function (data) {
			this.disableCloseButton('modal-attach-pdf');
			this.showFieldThrobber('#pdf-file');
			
			var thisObj = this;
			var fileModel = new DocumentModel(data);
			fileModel.save(
				null, 
				{
					success: function (model, response, options) {
						data['id'] = response;
						//console.log(response);
						thisObj.generatePDFIcon(data);
						thisObj.enableCloseButton('modal-attach-pdf');
						thisObj.hideFieldThrobber();
					},
					error: function (model, response, options) {
						thisObj.enableCloseButton('modal-attach-pdf');
						if(typeof response.responseJSON.error == 'undefined')
							validate.showErrors(response.responseJSON);
						else
							thisObj.displayMessage(response);
						thisObj.hideFieldThrobber();
					},
					headers: fileModel.getAuth(),
				}
			);
		},
		
		generatePDFIcon: function (data) {
			var clone = this.options.fileFileClone.clone(true);
			this.subContainer.find('#pdf-file').replaceWith(clone);
			this.subContainer.find('#pdf-filename').text(data.name);
			this.subContainer.find('#pdf-filename').attr('data-id', data.id);
			
			this.subContainer.find('#previous-upload').val(data.name);
			this.subContainer.find('#previous-upload').attr('data-id', data.id);
			
			this.subContainer.find('#upload-field-cont').hide();
			this.subContainer.find('#pdf-icon-cont').show();
		},
		
		resetImageField: function () {
			var clone = this.options.fileFileClone.clone(true);
			this.subContainer.find('#pdf-file').replaceWith(clone);
			
			this.subContainer.find('#pdf-icon-cont').hide();
			this.subContainer.find('#undo-remove').show();
			this.subContainer.find('#upload-field-cont').show();
			
			return false;
		},
		
		undoRemove: function () {
			var field = this.subContainer.find('#previous-upload');
			
			this.subContainer.find('#pdf-filename').text(field.val());
			this.subContainer.find('#pdf-filename').attr(field.attr('data-id'));
			
			this.subContainer.find('#upload-field-cont').hide();
			this.subContainer.find('#pdf-icon-cont').show();
			
			return false;
		},
		
		supplyWeightInfoData: function () {},
	});

	return WeightInfoAddView;
});