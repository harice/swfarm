define([
	'backbone',
	'models/purchaseorder/POModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewTemplate.html',
	'text!templates/purchaseorder/purchaseOrderViewProductItemTemplate.html',
	'global',
	'constant',
], function(
			Backbone,
			POModel,
			contentTemplate,
			purchaseOrderViewTemplate,
			purchaseOrderViewProductItemTemplate,
			Global,
			Const
){

	var PurchaseOrderView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new POModel({id:option.id});
			this.model.on("change", function() {
				thisObj.displayForm();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO
			};
			var innerTemplate = _.template(purchaseOrderViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Purchase Order",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.supplyPOData();
		},
		
		supplyPOData: function () {
			var thisObj = this;
			var address = this.model.get('address');
			var bidProducts = this.model.get('bidproduct');
			
			this.$el.find('#po-number').text(this.model.get('ponumber'));
			this.$el.find('#po-status').text(this.model.get('po_status'));
			this.$el.find('#po-destination').text(this.model.get('destination').destination);
			this.$el.find('#po-producer').text(this.model.get('account').name);
			this.$el.find('#po-address-type').text(address.address_type[0].name);
			this.$el.find('#po-address-street').text(address.street);
			this.$el.find('#po-address-state').text(address.addressstates[0].state);
			this.$el.find('#po-address-city').text(address.addresscity[0].city);
			this.$el.find('#po-address-zip-code').text(address.zipcode);
			this.$el.find('#po-date').text(this.model.get('po_date').split(' ')[0]);
			if(this.model.get('purchaseorder')) {
				this.$el.find('#po-pickup-start').text(this.model.get('purchaseorder').pickupstart.split(' ')[0]);
				this.$el.find('#po-pickup-end').text(this.model.get('purchaseorder').pickupend.split(' ')[0]);
			}
			
			var totalAmount = parseFloat(0);
			_.each(bidProducts, function (bidProduct) {
				var up = (bidProduct.unitprice)? parseFloat(bidProduct.unitprice).toFixed(2) : 0.00;
				var amount = parseFloat(bidProduct.tons * up);
				totalAmount += amount;
				var poProductTemplateVar = {
					'product': bidProduct.product[0].name,
					'desc': thisObj.nlToBr(bidProduct.description),
					'stacknumber': bidProduct.stacknumber,
					'tons': bidProduct.tons,
					'bales': bidProduct.bales,
					'unitprice': up,
					'amount': parseFloat(amount).toFixed(2),
				};
				var poProductTemplate = _.template(purchaseOrderViewProductItemTemplate, poProductTemplateVar);
				thisObj.$el.find('#bid-product-list tbody').append(poProductTemplate);
			});
			
			this.$el.find('.amounttotal').text(parseFloat(totalAmount).toFixed(2));
			this.$el.find('.notes').val(this.model.get('notes'));
		},
	});

  return PurchaseOrderView;
  
});