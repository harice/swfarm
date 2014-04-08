define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/ListView',
	'models/bid/BidModel',
	'collections/bid/BidCollection',
	'collections/bid/BidDestinationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/bid/bidListTemplate.html',
	'text!templates/bid/bidDestinationTemplate.html',
	'text!templates/bid/bidInnerListTemplate.html',
	'constant',
], function(Backbone, DatePicker, ListView, BidModel, BidCollection, BidDestinationCollection, contentTemplate, bidListTemplate, bidDestinationTemplate, bidInnerListTemplate, Const){

	var BidListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			
			var thisObj = this;
			
			this.collection = new BidCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.bidDestinationCollection = new BidDestinationCollection();
			this.bidDestinationCollection.on('sync', function() {
				thisObj.displayBid();
				thisObj.renderList(1);
				this.off('sync');
			});
			this.bidDestinationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.bidDestinationCollection.getModels();
		},
		
		displayBid: function () {
			var destinationTemplate = _.template(bidDestinationTemplate, {'destinations': this.bidDestinationCollection.models});
			
			var thisObj = this;
			var innerTemplateVar = {
										'bid_add_url' : '#/'+Const.URL.BID+'/'+Const.CRUD.ADD,
										'destination_filters' : destinationTemplate,
									};
			var innerTemplate = _.template(bidListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: "Bids",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.$el.find('#filter-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setDate($('#filter-date .input-group.date input').val());
				thisObj.renderList();
			});
		},
		
		displayList: function () {
			console.log('displayList');
			var data = {
				bid_url: '#/'+Const.URL.BID,
				bid_edit_url: '#/'+Const.URL.BID+'/'+Const.CRUD.EDIT,
				bids: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(bidInnerListTemplate, data);
			$("#bid-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .sort-bidnumber' : 'sortBidNumber',
			'click .sort-date' : 'sortDate',
			'click .sort-producer' : 'sortProducer',
			'click .cancel-bid' : 'cancelBid',
			'change .bidDestination' : 'filterByDestination',
			'change .statusFilter' : 'filterByStatus',
		},
		
		sortBidNumber: function () {
			this.sortByField('bidnumber');
		},
		
		sortDate: function () {
			this.sortByField('created_at');
		},
		
		sortProducer: function () {
			this.sortByField('producer');
		},
		
		cancelBid: function (ev) {
			var thisObj = this;
			var field = $(ev.target);
			
			var verifyCancel = confirm('Are you sure you want to delete this role?');
			
			if(verifyCancel) {
				var bidModel = new BidModel({id:field.attr('data-id')});
				bidModel.setCancelURL();		
				bidModel.save(
					null, 
					{
						success: function (model, response, options) {
							thisObj.displayMessage(response);
							thisObj.renderList(thisObj.collection.getCurrentPage());
						},
						error: function (model, response, options) {
							if(typeof response.responseJSON.error == 'undefined')
								validate.showErrors(response.responseJSON);
							else
								thisObj.displayMessage(response);
						},
						headers: bidModel.getAuth(),
					}
				);
			}
			
			return false;
		},
		
		filterByDestination: function (ev) {
			var filter = $(ev.target).val(); console.log(filter);
			this.collection.setFilter('destination', filter)
			this.renderList(1);
			return false;
		},
		
		filterByStatus: function (ev) {
			var filter = $(ev.target).val(); console.log(filter);
			this.collection.setFilter('status', filter)
			this.renderList(1);
			return false;
		},
	});

  return BidListView;
  
});