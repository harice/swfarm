define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/purchaseorder/PurchaseOrderAddView',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountProducerCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/product/ProductCollection',
	'models/purchaseorder/PurchaseOrderModel',
	'models/file/FileModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewSubProductItemTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			PurchaseOrderAddView,
			CustomAutoCompleteView,
			AccountProducerCollection,
			DestinationCollection,
			ProductCollection,
			PurchaseOrderModel,
			FileModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			purchaseOrderAddTemplate,
			productItemTemplate,
			productSubItemTemplate,
			purchaseOrderDestinationTemplate,
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
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 1)}));
			
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
				if(parseInt(this.get('isfrombid')) == 1 && this.get('status').name.toLowerCase() == 'pending') {
					thisObj.isBid = true;
					thisObj.h1Title = 'Bid';
				}
				else
					thisObj.isBid = false;
				
				thisObj.destinationCollection.getModels();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Purchase Order','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO,
				'po_edit_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT+'/'+this.poId,
				po : this.model,
				reason_others : Const.CANCELLATIONREASON.OTHERS,
				_: _
			};
			
			if(this.model.get('status').name.toLowerCase() == Const.STATUS.PENDING ||
				this.model.get('status').name.toLowerCase() == Const.STATUS.OPEN ||
				this.model.get('status').name.toLowerCase() == Const.STATUS.TESTING)
				innerTemplateVariables['editable'] = true;
				
			if(this.isBid)
				innerTemplateVariables['is_bid'] = true;
			
			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
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
					
					if(typeof productSub.upload != 'undefined' && productSub.upload.length > 0) {
						if(typeof productSub.upload[0].files != 'undefined' && productSub.upload[0].files.length > 0)
							variablesSub['file_path'] = '/apiv1/file/'+productSub.upload[0].files[0].auth;
					}
					
					if(thisObj.isBid)
						variablesSub['is_bid'] = true;
					
					var templateSub = _.template(productSubItemTemplate, variablesSub);
					subProductTBODY.append(templateSub);
					
					totalTotalPrice += totalprice;
				});
				thisObj.$el.find('#product-list > tbody > .product-item:last .totalprice').html('$ '+Backbone.View.prototype.helpers.numberFormatTons(totalTotalPrice));
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
			//'click .attach-pdf': 'showPDF',
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
			this.model = new FileModel({id:$(ev.currentTarget).attr('data-id')});
			this.model.on('change', function() {
				
			});
			this.model.runFetch();
			
			return false;
		},
	});

  return PurchaseOrderView;
  
});