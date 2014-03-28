define([
	'backbone',
	'views/base/ListView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderListTemplate.html',
	'text!templates/purchaseorder/purchaseOrderInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, contentTemplate, purchaseOrderListTemplate, purchaseOrderInnerListTemplate, Const){

	var PurchaseOrderListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			
			/*var thisObj = this;
			
			this.collection = new UserCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});*/
		},
		
		render: function(){
			this.displayBid();
			//this.renderList(1);
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
		
		/*displayList: function () {
			
			var data = {
				user_url: '#/'+Const.URL.USER,
				user_edit_url: '#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
				users: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( userInnerListTemplate, data );
			$("#user-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},*/
	});

  return PurchaseOrderListView;
  
});