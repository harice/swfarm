define([
	'backbone',
	'views/autocomplete/AccountScaleAutoCompleteView',
	'models/weightticket/WeightTicketModel',
	'collections/account/AccountScaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddWeightTicketTemplate.html',
	'global',
	'constant'
], function(Backbone,
			AccountScaleAutoCompleteView,
			WeightTicketModel,
			AccountScaleCollection,
			contentTemplate,
			purchaseOrderAddWeightTicketTemplate,
			Global,
			Const
){

	var WeightTicketView = Backbone.View.extend({
		el: '#po-schedule-form-cont',
		
		initialize: function(option) {
			var thisObj = this;
			this.bidId = option.id;
			this.scaleOriginAutoCompleteResult = [];
			this.scaleDestinationAutoCompleteResult = [];
			
		},
		
		render: function(){
			this.displayWeightTicket();
		},
		
		displayWeightTicket: function () {
			var compiledTemplate = _.template(purchaseOrderAddWeightTicketTemplate, {});
			this.$el.html(compiledTemplate);
			
			this.initAutocomplete();
		},
		
		initAutocomplete: function () {
			//Scale Origin
			var accountScaleOriginCollection = new AccountScaleCollection();
			this.accountScaleOriginAutoCompleteView = new AccountScaleAutoCompleteView({
                input: $('#originscale'),
				hidden: $('#originscale-id'),
                collection: accountScaleOriginCollection,
            });
			
			this.accountScaleOriginAutoCompleteView.on('loadResult', function () {
				thisObj.scaleOriginAutoCompleteResult = [];
				_.each(accountScaleOriginCollection.models, function (model) {
					thisObj.scaleOriginAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountScaleOriginAutoCompleteView.render();
			
			//Scale Destination
			var accountScaleDestinationCollection = new AccountScaleCollection();
			this.accountScaleDestinationAutoCompleteView = new AccountScaleAutoCompleteView({
                input: $('#destinationscale'),
				hidden: $('#destinationscale-id'),
                collection: accountScaleDestinationCollection,
            });
			
			this.accountScaleDestinationAutoCompleteView.on('loadResult', function () {
				thisObj.scaleDestinationAutoCompleteResult = [];
				_.each(accountScaleDestinationCollection.models, function (model) {
					thisObj.scaleDestinationAutoCompleteResult.push({id:model.get('id'), name:model.get('name')});
				});
			});
			
			this.accountScaleDestinationAutoCompleteView.render();
		},
	});

  return WeightTicketView;
  
});