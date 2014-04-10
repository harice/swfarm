define([
	'backbone',
	'views/base/ListView',
	'models/purchaseorder/POModel',
	'collections/purchaseorder/POCollection',
	'collections/bid/BidDestinationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderInnerListTemplate.html',
	'text!templates/bid/bidDestinationTemplate.html',
	'constant',
], function(Backbone, ListView, POModel, POCollection, BidDestinationCollection, contentTemplate, purchaseOrderListTemplate, purchaseOrderInnerListTemplate, bidDestinationTemplate, Const){

	var PurchaseOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			
			var thisObj = this;
			
			this.collection = new POCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.bidDestinationCollection = new BidDestinationCollection();
			this.bidDestinationCollection.on('sync', function() {
				thisObj.displayPO();
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
		
		displayPO: function () {
			var destinationTemplate = _.template(bidDestinationTemplate, {'destinations': this.bidDestinationCollection.models});
			var innerTemplateVar = {
				'po_add_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.ADD,
				'destination_filters' : destinationTemplate,
			};
			var innerTemplate = _.template(purchaseOrderListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: "Purchase Orders",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.initCalendars();
		},
		
		displayList: function () {
			
			var data = {
				po_url: '#/'+Const.URL.PO,
				po_edit_url: '#/'+Const.URL.PO+'/'+Const.CRUD.EDIT,
				pos: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(purchaseOrderInnerListTemplate, data);
			$("#po-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		initCalendars: function () {
			var thisObj = this;
			
			this.$el.find('#filter-date-of-purchase .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setDate($('#filter-date-of-purchase .input-group.date input').val());
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setFilter('pickupstart', $('#filter-pickup-start .input-group.date input').val());
				thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				thisObj.collection.setFilter('pickupend', $('#filter-pickup-end .input-group.date input').val());
				thisObj.renderList(1);
			});
		},
		
		events: {
			'click .sort-date-of-po' : 'sortPODate',
			'click .cancel-po' : 'cancelPO',
			'change .bidDestination' : 'filterByDestination',
			'change .statusFilter' : 'filterByStatus',
		},
		
		sortPODate: function () {
			this.sortByField('po_date');
		},
		
		cancelPO: function (ev) {
			var thisObj = this;
			var field = $(ev.target);
			
			var verifyCancel = confirm('Are you sure you want to cancel this PO?');
			
			if(verifyCancel) {
				var poModel = new POModel({id:field.attr('data-id')});
				poModel.setCancelURL();		
				poModel.save(
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
						headers: poModel.getAuth(),
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
			this.collection.setFilter('postatus', filter)
			this.renderList(1);
			return false;
		},
	});

  return PurchaseOrderListView;
  
});