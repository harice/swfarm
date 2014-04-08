define([
	'backbone',
	'views/base/ListView',
	'models/purchaseorder/POModel',
	'collections/purchaseorder/POCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, POModel, POCollection, contentTemplate, purchaseOrderListTemplate, purchaseOrderInnerListTemplate, Const){

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
		},
		
		render: function(){
			this.displayBid();
			this.renderList(1);
		},
		
		displayBid: function () {
			var innerTemplate = _.template(purchaseOrderListTemplate, {'po_add_url' : '#/'+Const.URL.PO+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Purchase Orders",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
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
			
			this.initCalendars();
			this.generatePagination();
		},
		
		initCalendars: function () {
			this.$el.find('#filter-date-of-purchase .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
			
			this.$el.find('#filter-pickup-start .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
			
			this.$el.find('#filter-pickup-end .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
		},
		
		events: {
			'click .cancel-po' : 'cancelPO',
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
	});

  return PurchaseOrderListView;
  
});