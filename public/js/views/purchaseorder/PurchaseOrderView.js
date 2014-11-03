define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'base64',
	'views/purchaseorder/PurchaseOrderAddView',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountProducerCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/product/ProductCollection',
	'collections/purchaseorder/CancellingReasonCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'models/queue/QueueModel',
	'models/document/DocumentModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewSubProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/reasonForCancellationOptionTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			Base64,
			PurchaseOrderAddView,
			CustomAutoCompleteView,
			AccountProducerCollection,
			DestinationCollection,
			ProductCollection,
			CancellingReasonCollection,
			PurchaseOrderModel,
			QueueModel,
			DocumentModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			purchaseOrderDestinationTemplate,
			reasonForCancellationOptionTemplate,
			Global,
			Const
){

	var PurchaseOrderView = PurchaseOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		producerAutoCompleteView: null,
		
		initialize: function(option) {
			this.initSubContainer();

			var thisObj = this;
			this.poId = option.id;
			this.isBid = false;
			this.h1Title = 'Purchase Order';
			this.h1Small = 'view';
								
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'stacknumber', 'unitprice', 'tons', 'bales', 'ishold'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldExempt: [],
				productFieldSeparator: '.',
			};
			
			this.destinationCollection = new DestinationCollection();
			this.destinationCollection.on('sync', function() {	
				thisObj.productCollection.getModels();
				this.off('sync');
			});
			
			this.destinationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				_.each(this.models, function (productModels) {
					thisObj.productAutoCompletePool.push({
						label:productModels.get('name'),
						value:productModels.get('name'),
						id:productModels.get('id'),
						desc:productModels.get('description'),
					});
				});
				
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplyPOData();
				}
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.model = new PurchaseOrderModel({id:this.poId});
			this.model.on('change', function() {
				//if(parseInt(this.get('isfrombid')) == 1 && this.get('status').name.toLowerCase() == 'pending') {
				if(parseInt(this.get('isfrombid')) == 1) {
					thisObj.isBid = true;
					thisObj.h1Title = 'Bid';
					Backbone.View.prototype.refreshTitle(thisObj.h1Title,'view');
				}
				else{
					thisObj.isBid = false;
					Backbone.View.prototype.refreshTitle("Purchase Order",'view');
				}
				
				thisObj.destinationCollection.getModels();
				this.off('change');
			});

			this.cancellingReasonCollection = new CancellingReasonCollection();
			this.cancellingReasonCollection.on('sync', function() {	
				thisObj.destinationCollection.getModels();
				this.off('sync');
			});
			
			this.cancellingReasonCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.model.runFetch();
			this.cancellingReasonCollection.getModels();						
		},		
		
		displayForm: function () {
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 1, this.model.get('location_id'))}));

			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO,
				'po_edit_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT+'/'+this.poId,
				po : this.model,
				print_url : Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.model.id, type:'pdf', model:'order'})),
				reason_others : Const.CANCELLATIONREASON.OTHERS,
				_: _
			};
			
			if(this.model.get('status').id == Const.STATUSID.PENDING ||
				this.model.get('status').id == Const.STATUSID.OPEN ||
				this.model.get('status').id == Const.STATUSID.TESTING)
				innerTemplateVariables['editable'] = true;
				
			if(this.isBid)
				innerTemplateVariables['is_bid'] = true;
			
			if(!this.isBid) {
				if(this.model.get('location').id == Const.PO.DESTINATION.DROPSHIP && this.model.get('status').id == Const.STATUSID.CLOSED) {
					if(this.model.get('salesorder_id')) {
						this.gotoDropshipSO = function () {
							Backbone.history.navigate(Const.URL.SO+'/'+thisObj.model.get('salesorder_id'), {trigger: true});
						};
						innerTemplateVariables['so_link_label'] = 'View So';
					}
					else {
						this.gotoDropshipSO = function () {
							Global.getGlobalVars().fromPOId = thisObj.model.get('id');
							Backbone.history.navigate(Const.URL.SO+'/'+Const.CRUD.ADD, {trigger: true});
						};
						innerTemplateVariables['so_link_label'] = 'Add So';
					}
				}
				else if(this.model.get('location').id == Const.PO.DESTINATION.SWFARMS)
					innerTemplateVariables['swfarm_located'] = true;
			}
			
			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);

			this.initCancelWindow();			
		},

		initCancelWindow: function (){
			var thisObj = this;
			var options = '';

			_.each(this.cancellingReasonCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('reason')+'</option>';
			});
			var form = _.template(reasonForCancellationOptionTemplate, {'reasons': options});
			
			var modalTitle = "Cancel Purchase Order";
			var entity = "PO";
			var buttonId = "confirm-cancel-po";
			
			if(thisObj.model.get('isfrombid')){
				modalTitle = "Cancel BID";
				entity = "BID";
				buttonId = "confirm-cancel-bid";
			}

			this.initConfirmationWindowWithForm('Are you sure you want to cancel this '+ entity +'?',
										buttonId,
										'Yes',
										form,
										modalTitle);
										
			var validate = $('#cancellationReasonForm').validate({
				submitHandler: function(form) {
					
					var data = $(form).serializeObject();
					
					var purchaseOrderModel = new PurchaseOrderModel(data);
						
					purchaseOrderModel.setCancelURL();		
					purchaseOrderModel.save(
						null, 
						{
							success: function (model, response, options) {								
								thisObj.hideConfirmationWindow('modal-with-form-confirm', function(){
									thisObj.displayMessage(response);																
									Backbone.history.history.back();
								});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: purchaseOrderModel.getAuth(),
						}
					);
				},
				rules: {
					others: {
						require_reason_others: true,
					},
				},
			});
		},
		
		supplyPOData: function () {
			var thisObj = this;
			
			var products = this.model.get('productsummary');
			
			var totalTons = 0;
			var totalTotalTotalPrice = 0;
			
			_.each(products, function (product) {
				var unitprice = (!isNaN(product.unitprice))? product.unitprice : 0;
				var tons = (!isNaN(parseFloat(product.tons)))? parseFloat(product.tons) : 0;
				var totalprice = parseFloat(unitprice * tons);
				
				totalTons += tons;
				
				var variables = {
					productname: product.productname.name,
					tons: Backbone.View.prototype.helpers.numberFormatTons(tons),
				};
				
				if(thisObj.isBid)
					variables['is_bid'] = true;
				
				var template = _.template(productItemTemplate, variables);
				thisObj.$el.find('#product-list > tbody').append(template);
				
				var subProductTBODY = thisObj.subContainer.find('#product-list > tbody > .product-stack:last tbody');
				
				var totalTotalPrice = 0;
				_.each(product.productorder, function (productSub) {
					var unitprice = parseFloat(productSub.unitprice);
					var tons = parseFloat(productSub.tons);
					var totalprice = unitprice * tons;
					var variablesSub = {
						stacknumber: productSub.stacknumber,
						location_from: productSub.sectionfrom.storagelocation.name+' - '+productSub.sectionfrom.name,
						description: productSub.description,
						unitprice: Backbone.View.prototype.helpers.numberFormat(unitprice),
						tons: Backbone.View.prototype.helpers.numberFormatTons(tons),
						bales: productSub.bales,
						totalprice: Backbone.View.prototype.helpers.numberFormat(totalprice),
						ishold: productSub.ishold,
						rfv: productSub.rfv,
					};
					
					if(productSub.document != null) {
						var dl = {id:productSub.document.id, type:'doc'};
						variablesSub['file_path'] = Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize(dl));
					}
					
					if(thisObj.isBid)
						variablesSub['is_bid'] = true;

					var templateSub = _.template(productSubItemTemplate, variablesSub);
					subProductTBODY.append(templateSub);
					
					totalTotalPrice += totalprice;
				});
				thisObj.$el.find('#product-list > tbody > .product-item:last .totalprice').html('$ '+Backbone.View.prototype.helpers.numberFormat(totalTotalPrice));
				totalTotalTotalPrice += totalTotalPrice;
				
			});
			
			this.subContainer.find('#total-tons').html(Backbone.View.prototype.helpers.numberFormatTons(totalTons));
			this.subContainer.find('#total-price').html('$ '+Backbone.View.prototype.helpers.numberFormat(totalTotalTotalPrice));
		},
		
		events:{
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #close-order': 'showCloseOrderConfirmationWindow',
			'click #confirm-close-order': 'closeOrder',
			'click #checkin-stack': 'showCheckinStackConfirmationWindow',
			'click #confirm-checkin-stack': 'checkinStack',
			'click #create-dropship-so': 'createDropshipSO',
			'click .sendmail':'showSendMailModal',
			'click #btn_sendmail':'sendMail',
			//'click .attach-pdf': 'showPDF',
			'click .cancel-po': 'preShowConfirmationWindow',
			'click .cancel-bid': 'preShowConfirmationWindow',
			'click #confirm-cancel-po': 'cancelPO',
			'click #confirm-cancel-bid': 'cancelPO',
			'change #reason': 'onChangeReason',			
		},		

		preShowConfirmationWindow: function (ev) {
			this.$el.find('#cancellationReasonForm #cancelled-order-id').val(this.poId);
			
			this.showConfirmationWindow('modal-with-form-confirm');
			return false;
		},
		
		cancelPO: function (ev) {
			$('#cancellationReasonForm').submit();
			return false;
		},

		onChangeReason: function (ev) {
			var field = $(ev.target);
			
			if(field.val() == Const.CANCELLATIONREASON.OTHERS)
				$('#cancellation-others-text').show();
			else
				$('#cancellation-others-text').hide();
		},

		showSendMailModal: function(){
			var thisObj = this;
			var modalTitle = "Send Purchase Order as pdf";

			if(thisObj.model.get('isfrombid')){
				modalTitle = "Send BID as pdf";
			}

			this.initSendMailForm(
					modalTitle,
					'btn_sendmail',
					'Send',
					this.model.get('order_number'),
					'order',
					'pdf',
					this.model.get('id')
				);
			
			var validate = $('#sendmail-form').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					var queue = new QueueModel(data);
					queue.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								$('#mdl_sendmail').modal('hide');
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: queue.getAuth(),
						}
					);
				},
				rules: {
					recipients: {
						multiemail: true,
					},
				}
			});

			this.showModalForm('mdl_sendmail');
			return false;
		},

		sendMail: function() {
			$('#sendmail-form').submit();
			return false;
		},
		
		showCloseOrderConfirmationWindow: function () {
			this.initConfirmationWindow('Are you sure you want to close this purchase order?',
										'confirm-close-order',
										'Close Purchase Order',
										'Close Purchase Order',
										false);

			this.showConfirmationWindow();
			
			return false;
		},
		
		closeOrder: function (ev) {
			var thisObj = this;
			
			var purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
			purchaseOrderModel.setCloseURL();
			purchaseOrderModel.save(
				null,
				{
					success: function (model, response, options) {
						thisObj.hideConfirmationWindow('modal-confirm', function () {
							thisObj.subContainer.find('.editable-button').remove();
						});
						thisObj.displayMessage(response);
					},
					error: function (model, response, options) {
						thisObj.hideConfirmationWindow();
						if(typeof response.responseJSON.error == 'undefined')
							alert(response.responseJSON);
						else
							thisObj.displayMessage(response);
					},
					headers: purchaseOrderModel.getAuth(),
				}
			);
			
			return false;
		},
		
		showCheckinStackConfirmationWindow: function (ev) {
			this.initConfirmationWindow('Are you sure you want to check-in stack?',
										'confirm-checkin-stack',
										'Check-in Stack',
										'Check-in Stack',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		checkinStack: function () {
			this.hideConfirmationWindow();
			return false;
		},
		
		showPDF: function (ev) {
			// console.log('showPDF');
			this.model = new DocumentModel({id:$(ev.currentTarget).attr('data-id')});
			this.model.on('change', function() {
				
			});
			this.model.runFetch();
			
			return false;
		},
		
		createDropshipSO: function () {
			
			this.gotoDropshipSO();
			
			return false;
		},
		
		gotoDropshipSO: function () {},
	});

  return PurchaseOrderView;
  
});