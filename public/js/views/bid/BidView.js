define([
	'backbone',
	'models/bid/BidModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/bid/bidViewTemplate.html',
	'text!templates/bid/bidViewProductItemTemplate.html',
	'global',
	'constant',
], function(backbone,
			BidModel,
			contentTemplate,
			bidViewTemplate,
			bidViewProductItemTemplate,
			Global,
			Const
){

	var BidView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new BidModel({id:option.id});
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
				'bid_url' : '#/'+Const.URL.BID,
			};
			var innerTemplate = _.template(bidViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Bid",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.supplyBidData();
		},
		
		supplyBidData: function () {
			console.log(this.model);
			
			var thisObj = this;
			var producer = this.model.get('account');
			var address = this.model.get('address');
			var bidProducts = this.model.get('bidproduct');
			var date = this.model.get('created_at').split(' ')[0];
			
			this.$el.find('#bidnumber').text(this.model.get('bidnumber'));
			this.$el.find('#status').text(this.model.get('status'));
			this.$el.find('#destination').text(this.model.get('destination').destination);
			this.$el.find('#producername').text(producer.name);
			this.$el.find('#addresstype').text(address.address_type[0].name);
			this.$el.find('#street').text(address.street);
			this.$el.find('#state').text(address.addressstates[0].state);
			this.$el.find('#city').text(address.addresscity[0].city);
			this.$el.find('#zipcode').text(address.zipcode);
			this.$el.find('#date').text(this.model.get('created_at').split(' ')[0]);
			this.$el.find('#notes').html(this.model.get('notes'));
			
			_.each(bidProducts, function (product){
				var bidProductTemplateVar = {
					'product': product.product[0].name,
					'desc': product.description,
					'stacknumber': product.stacknumber,
					'bidprice': parseFloat(product.bidprice).toFixed(2),
					'tons': product.tons,
					'bales': product.bales,
					'unitprice': parseFloat(product.bidprice * product.tons).toFixed(2),
					'holdfortesting': (product.ishold == 0)? 'No' : 'Yes',
				};
				var bidProductTemplate = _.template(bidViewProductItemTemplate, bidProductTemplateVar);
				thisObj.$el.find('#bid-product-list tbody').append(bidProductTemplate);
			});
		},
	});

  return BidView;
  
});