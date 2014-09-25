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
	'models/queue/QueueModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/salesorder/salesOrderViewTemplate.html',
	'text!templates/salesorder/salesOrderViewProductItemTemplate.html',
	'text!templates/salesorder/salesOrderViewSubProductItemTemplate.html',
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
			QueueModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			salesOrderViewTemplate,
			productItemTemplate,
			productSubItemTemplate,
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
				print_url : Const.URL.FILE +'?q='+ Base64.encode(Backbone.View.prototype.serialize({filterId:this.model.id, type:'pdf', model:'order'})),
				reason_others : Const.CANCELLATIONREASON.OTHERS
			};
			
			if(this.model.get('status').name.toLowerCase() == 'open')
				innerTemplateVariables['editable'] = true;
			
			_.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
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
			var products = this.model.get('productsummary');
			
			var totalTons = 0;
			var totalBales = 0;
			var totalTotalPrice = 0;
			
			_.each(products, function (product) {
				var unitprice = (!isNaN(parseFloat(product.unitprice)))? parseFloat(product.unitprice) : 0;
				var tons = (!isNaN(parseFloat(product.tons)))? parseFloat(product.tons) : 0;
				var totalprice = parseFloat(unitprice * tons);
				
				totalTons += tons;
				totalTotalPrice += parseFloat(totalprice);
				totalBales += (!isNaN(parseInt(product.bales)))? parseInt(product.bales) : 0;
				
				var variables = {
					productname: product.productname.name,
					//description: product.description,
					//stacknumber: product.stacknumber,
					unitprice: Backbone.View.prototype.helpers.numberFormat(unitprice),
					tons: Backbone.View.prototype.helpers.numberFormatTons(tons),
					//bales: Backbone.View.prototype.helpers.numberFormatBales(product.bales),
					totalprice: Backbone.View.prototype.helpers.numberFormat(totalprice),
				};
				
				var template = _.template(productItemTemplate, variables);
				thisObj.subContainer.find('#product-list > tbody').append(template);
				
				var subProductTBODY = thisObj.subContainer.find('#product-list > tbody > .product-stack:last tbody');
				
				_.each(product.productorder, function (productSub) {
					var variablesSub = {
						stacknumber: productSub.stacknumber,
						location_from: productSub.sectionfrom.storagelocation.name+' - '+productSub.sectionfrom.name,
						description: productSub.description,
						tons: productSub.tons,
						bales: productSub.bales,
					};
					var templateSub = _.template(productSubItemTemplate, variablesSub);
					subProductTBODY.append(templateSub);
				});
			});
			
			this.subContainer.find('#total-tons').html(Backbone.View.prototype.helpers.numberFormatTons(totalTons));
			this.subContainer.find('#total-bales').html(Backbone.View.prototype.helpers.numberFormatBales(totalBales));
			this.subContainer.find('#total-price').html('$ '+Backbone.View.prototype.helpers.numberFormat(totalTotalPrice));
		},
		
		events:{
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #close-order': 'showCloseOrderConfirmationWindow',
			'click #confirm-close-order': 'closeOrder',
			'click .sendmail':'showSendMailModal',
			'click #btn_sendmail':'sendMail',
		},

		showSendMailModal: function(){
			var thisObj = this;
			this.initSendMailForm(
					'Send Sales Order as pdf',
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