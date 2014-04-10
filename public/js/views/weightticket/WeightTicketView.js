define([
	'backbone',
	'models/weightticket/WeightTicketModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddWeightTicketTemplate.html',
	'global',
	'constant'
], function(Backbone, WeightTicketModel, contentTemplate, purchaseOrderAddWeightTicketTemplate, Global, Const){

	var WeightTicketView = Backbone.View.extend({
		el: '#po-schedule-form-cont',
		
		initialize: function(option) {
			var thisObj = this;
			this.bidId = option.id;
			this.isEdit = false;
			
		},
		
		render: function(){
			this.displayWeightTicket();
		},
		
		displayWeightTicket: function () {
			var compiledTemplate = _.template(purchaseOrderAddWeightTicketTemplate, {});
			this.$el.html(compiledTemplate);
		},
		
	});

  return WeightTicketView;
  
});