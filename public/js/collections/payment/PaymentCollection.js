define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/payment/PaymentModel',
	'constant',
], function(Backbone, ListViewCollection, PaymentModel, Const){

	var PaymentCollection = ListViewCollection.extend({
		url: '/apiv1/payment/purchaseOrderList',
		model: PaymentModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'created_at',
			sort: {
				created_at: false,
			},			
			lookUpIds: {},
			collapseId: null,
			collapseLatestId: null,
			searchURLForFilter: true,
			otherData:{},
		},
		
		initialize: function(){
			this.runInit();
			this.setDefaultURL('/apiv1/payment/purchaseOrderList');
		},
		
		getPaymentByPurchaseOrder: function () {
			this.url = '/apiv1/payment/purchaseOrderList';
			this.getModels();
		},

			
	});

	return PaymentCollection;
});
