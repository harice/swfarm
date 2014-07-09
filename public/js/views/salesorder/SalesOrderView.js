define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/salesorder/SalesOrderAddView',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/salesorder/salesOrderViewTemplate.html',
	'text!templates/salesorder/salesOrderViewProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			SalesOrderAddView,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			OriginCollection,
			NatureOfSaleCollection,
			ProductCollection,
			SalesOrderModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			salesOrderViewTemplate,
			productItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Global,
			Const
){

	var SalesOrderView = SalesOrderAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		customerAutoCompleteView: null,
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.soId = option.id;
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generateSOTabs(this.soId, 1)}));
			
			this.model = new SalesOrderModel({id:this.soId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayForm();
					thisObj.supplySOData();
				}
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Sales Order','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.SO,
				'so_edit_url' : '#/'+Const.URL.SO+'/'+Const.CRUD.EDIT+'/'+this.soId,
				so : this.model,
				reason_others : Const.CANCELLATIONREASON.OTHERS
			};
			
			if(this.model.get('status').name.toLowerCase() == 'open')
				innerTemplateVariables['editable'] = true;
			
			var innerTemplate = _.template(salesOrderViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: 'Sales Order',
				h1_small: '',
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		supplySOData: function () {
			var thisObj = this;
			var products = this.model.get('productorder');
			
			var totalTons = 0;
			var totalBales = 0;
			var totalUnitPrice = 0;
			var totalTotalPrice = 0;
			
			_.each(products, function (product) {
				var unitprice = (!isNaN(parseFloat(product.unitprice)))? parseFloat(product.unitprice) : 0;
				var tons = (!isNaN(parseFloat(product.tons)))? parseFloat(product.tons) : 0;
				var totalprice = parseFloat(unitprice * tons).toFixed(2);
				
				totalTons += tons;
				totalUnitPrice += unitprice;
				totalTotalPrice += parseFloat(totalprice);
				totalBales += (!isNaN(parseInt(product.bales)))? parseInt(product.bales) : 0;
				
				var variables = {
					productname: product.product.name,
					description: product.description,
					stacknumber: product.stacknumber,
					unitprice: thisObj.addCommaToNumber(parseFloat(unitprice).toFixed(2)),
					tons: thisObj.addCommaToNumber(parseFloat(tons).toFixed(4)),
					bales: thisObj.addCommaToNumber(product.bales),
					totalprice: thisObj.addCommaToNumber(totalprice),
				};
				
				var template = _.template(productItemTemplate, variables);
				thisObj.$el.find('#product-list tbody').append(template);
			});
			
			this.subContainer.find('#total-tons').html(this.addCommaToNumber(parseFloat(totalTons).toFixed(4)));
			this.subContainer.find('#total-bales').html(this.addCommaToNumber(totalBales));
			this.subContainer.find('#total-unitprice').html('$ '+this.addCommaToNumber(parseFloat(totalUnitPrice).toFixed(2)));
			this.subContainer.find('#total-price').html('$ '+this.addCommaToNumber(parseFloat(totalTotalPrice).toFixed(2)));
		},
		
		events:{
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #close-order': 'showCloseOrderConfirmationWindow',
			'click #confirm-close-order': 'closeOrder'
		},
		
		showCloseOrderConfirmationWindow: function () {
			this.initConfirmationWindow('Are you sure you want to close this sales order?',
										'confirm-close-order',
										'Close Sales Order',
										'Close Sales Order',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
		
		closeOrder: function (ev) {
			var thisObj = this;
			
			var salesOrderModel = new SalesOrderModel({id:this.soId});
			salesOrderModel.setCloseURL();
			salesOrderModel.save(
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
					headers: salesOrderModel.getAuth(),
				}
			);
			
			return false;
		},
	});

  return SalesOrderView;
  
});