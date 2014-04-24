define([
	'backbone',
	'views/base/ListView',
	'collections/purchaseorder/PurchaseOrderCollection',
	'collections/purchaseorder/DestinationCollection',
	'collections/purchaseorder/POStatusCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderInnerListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderDestinationTemplate.html',
	'text!templates/purchaseorder/purchaseOrderStatusTemplate.html',
	'constant',
], function(Backbone,
			ListView,
			PurchaseOrderCollection,
			DestinationCollection,
			POStatusCollection,
			contentTemplate,
			purchaseOrderListTemplate,
			purchaseOrderInnerListTemplate,
			purchaseOrderDestinationTemplate,
			purchaseOrderStatusTemplate,
			Const
){

	var SalesOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			var thisObj = this;
			
			this.collection = new PurchaseOrderCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.destinationCollection = new DestinationCollection();
			this.destinationCollection.on('sync', function() {	
				thisObj.poStatusCollection.getModels();
				this.off('sync');
			});
			
			this.destinationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.poStatusCollection = new POStatusCollection();
			this.poStatusCollection.on('sync', function() {	
				thisObj.displayPO();
				thisObj.renderList(1);
				this.off('sync');
			});
			
			this.poStatusCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.destinationCollection.getModels();
		},
		
		displayPO: function () {
			var statusTemplate = _.template(purchaseOrderStatusTemplate, {'statuses': this.poStatusCollection.models});
			var destinationTemplate = _.template(purchaseOrderDestinationTemplate, {'destinations': this.destinationCollection.models});
			var innerTemplateVar = {
				'po_add_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.ADD,
				'destination_filters' : destinationTemplate.replace(/<label class="radio-inline">/g, '<li>').replace(/<\/label>/g, '</li>'),
				'status_filters' : statusTemplate,
			};
			var innerTemplate = _.template(purchaseOrderListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Purchase Order',
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
				po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE,
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
				//thisObj.collection.setFilter('pickupstart', $('#filter-pickup-start .input-group.date input').val());
				//thisObj.renderList(1);
			});
			
			this.$el.find('#filter-pickup-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			}).on('changeDate', function (ev) {
				//thisObj.collection.setFilter('pickupend', $('#filter-pickup-end .input-group.date input').val());
				//thisObj.renderList(1);
			});
		},
		
		events: {
			'click .sort-date-of-po' : 'sortPODate',
			//'click .cancel-po' : 'cancelPO',
			//'change .bidDestination' : 'filterByDestination',
			//'change .statusFilter' : 'filterByStatus',
		},
		
		sortPODate: function () {
			this.sortByField('created_at');
		},
	});

  return SalesOrderListView;
  
});