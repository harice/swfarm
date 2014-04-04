define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/ListView',
	'collections/bid/BidCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/bid/bidListTemplate.html',
	'text!templates/bid/bidInnerListTemplate.html',
	'constant',
], function(Backbone, DatePicker, ListView, BidCollection, contentTemplate, bidListTemplate, bidInnerListTemplate, Const){

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
		},
		
		render: function(){
			this.displayBid();
			this.renderList(1);
		},
		
		displayBid: function () {
			var thisObj = this;
			var innerTemplate = _.template(bidListTemplate, {'bid_add_url' : '#/'+Const.URL.BID+'/'+Const.CRUD.ADD});
			
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
			'click .sort-status' : 'sortStatus',
			'click .sort-producer' : 'sortProducer',
			'click .sort-destination' : 'sortDestination',
			'click .cancel-bid' : 'cancelBid'
		},
		
		sortBidNumber: function () {
			this.sortByField('bidnumber');
		},
		
		sortDate: function () {
			this.sortByField('created_at');
		},
		
		sortStatus: function () {
			this.sortByField('status');
		},
		
		sortProducer: function () {
			this.sortByField('producer');
		},
		
		sortDestination: function () {
			this.sortByField('destination');
		},
		
		cancelBid: function () {
			return false;
		},
	});

  return BidListView;
  
});