define([
	'backbone',
], function(Backbone) {

	var PurchaseOrderModel = Backbone.Model.extend({
		urlRoot: '/apiv1/purchaseorder',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						alert(response.message);
						//Global.getGlobalVars().app_router.navigate(Const.URL.PO, {trigger: true});
						Backbone.history.history.back();
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
		},
		setCancelURL: function () {
			this.urlRoot = '/apiv1/purchaseorder/cancel';
		},
		setCloseURL: function () {
			this.urlRoot = '/apiv1/purchaseorder/close';
		},
		getPurchaseOrderProducts: function (id) {
			this.urlRoot = '/apiv1/purchaseorder/getPurchaseOrderProductsForSalesOrder?order_id='+id;
			this.runFetch();
		},
	});
	return PurchaseOrderModel;
});
