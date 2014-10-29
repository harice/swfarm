define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/product/ProductModel',
	'constant'
], function(Backbone, ListViewCollection, ProductModel, Const){
	var ProductCollection = ListViewCollection.extend({
		url: '/apiv1/product',
		model: ProductModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'name',
			sort: {
				name: true,
			},
			filters: {},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},

		initialize: function(){
			this.setDefaultURL('/apiv1/product');			
		},

		getAllModel: function () {
			this.url = this.getDefaultURL()+'?all=true';
			this.getModels();
		},

		getOrderProducts: function (poId) {
			this.url = '/apiv1/transportschedule/getProductsOfOrder?orderId='+poId;
			this.getModels();
		},

		getScheduleProducts: function (schedId) {
			this.url = '/apiv1/weightticket/getScheduleProducts?transportschedule_id='+schedId;
			this.getModels();
		},

		getContractProducts: function (contractId) {
			this.url = '/apiv1/contract/getProducts/'+contractId;
			this.getModels();
		},

		getOrderProduct: function (orderId) {
			this.url = '/apiv1/inventory/getProductsOfOrder?orderId='+orderId;
			this.getModels();
		}
	});

	return ProductCollection;
});
