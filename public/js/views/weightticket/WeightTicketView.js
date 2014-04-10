define([
	'backbone',
	'views/autocomplete/AccountScaleAutoCompleteView',
	'models/weightticket/WeightTicketModel',
	'collections/account/AccountScaleCollection',
	'collections/product/BidProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddWeightTicketTemplate.html',
	'global',
	'constant'
], function(Backbone,
			AccountScaleAutoCompleteView,
			WeightTicketModel,
			AccountScaleCollection,
			BidProductCollection,
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
			
			this.bidProductcollection = new BidProductCollection();
			this.bidProductcollection.on('sync', function() {
				thisObj.displayWeightTicket();
			});
			this.bidProductcollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.bidProductcollection.fetchBidProducts(this.bidId);
		},
		
		displayWeightTicket: function () {
			var compiledTemplate = _.template(purchaseOrderAddWeightTicketTemplate, {});
			this.$el.html(compiledTemplate);
			
			this.initAutocomplete();
		},
		
		initAutocomplete: function () {
			var thisObj = this;
			
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
		
		events: {
			'blur #originscale': 'validateAccount',
			'blur #destinationscale': 'validateAccount',
		},
		
		validateAccount: function (ev) {
			var labelField = $(ev.target);
			var labelFieldId = $(ev.target).attr('id');
			var idField = '';
			var account = '';
			var autoCompleteView = null;
			
			switch(labelFieldId) {
				case 'originscale':
					idField = labelField.siblings('#originscale-id');
					autoCompleteView = this.accountScaleOriginAutoCompleteView;
					break;
				case 'destinationscale':
					idField = labelField.siblings('#destinationscale-id');
					autoCompleteView = this.accountScaleDestinationAutoCompleteView;
					break;
				default:
					break;
			}
			
			account = this.accountIsInFetchedData(labelField.val(), idField.val(), labelFieldId);
			
			if(!autoCompleteView.$el.is(':hover')) {
				if(account !== false) {
					if(account.id != null) {
						labelField.val(account.name);
						idField.val(account.id);
					}
					else
						labelField.val(account.name);
				}
				else {
					labelField.val('');
					idField.val('');
				}
				labelField.siblings('.autocomplete').hide();
			}
		},
		
		accountIsInFetchedData: function(name, id, type) {
			
			var autoCompleteResult = null;
			
			switch(type) {
				case 'originscale':
					autoCompleteResult = this.scaleOriginAutoCompleteResult;
					break;
				case 'destinationscale':
					autoCompleteResult = this.scaleDestinationAutoCompleteResult;
					break;
				default:
					break;
			}
			
			if(name != null) {
				for(var i = 0; i < autoCompleteResult.length; i++) {
					if(autoCompleteResult[i].name.toLowerCase() == name.toLowerCase()) {
						
						if(id != null && id != '' && parseInt(id) == parseInt(autoCompleteResult[i].id))
							return {name:autoCompleteResult[i].name};
						
						return {name:autoCompleteResult[i].name, id:autoCompleteResult[i].id};
					}
				}
			}
			return false;
		},
	});

  return WeightTicketView;
  
});