define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'text!templates/layout/contentTemplate.html',
	'text!templates/bid/bidAddTemplate.html',
	'text!templates/bid/bidProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone, Validate, TextFormatter, PhoneNumber, contentTemplate, bidAddTemplate, bidProductItemTemplate, Global, Const){

	var BidAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			
			/*this.collection = new RoleCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.displayRoles();
				this.off('sync');
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
			
			this.events = _.extend({}, Backbone.View.prototype.inputFormattingEvents, this.events);
			this.delegateEvents();*/
		},
		
		render: function(){
			var thisObj = this;
			
			var innerTemplateVariables = {
				'bid_url' : '#/'+Const.URL.BID
			};
			var innerTemplate = _.template(bidAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Bid",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		events: {
			'click #add-bid-product': 'addBidProduct',
			'click .remove-bid-product': 'removeBidProduct',
		},
		
		addBidProduct: function () {
			var bidProductTemplate = _.template(bidProductItemTemplate, {});
			
			if(!this.hasProduct())
				this.$el.find('#bid-product-list tbody').empty();
			
			this.$el.find('#bid-product-list tbody').append(bidProductTemplate);
		},
		
		removeBidProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.$el.find('#bid-product-list tbody').append('<tr><td colspan="8">No products added.</td></tr>');
		},
		
		hasProduct: function () {
			return (this.$el.find('#bid-product-list tbody .product-item').length)? true : false;
		},
	});

  return BidAddView;
  
});