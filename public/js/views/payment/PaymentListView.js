define([
	'backbone',
	'views/base/AccordionListView',
	'models/payment/PaymentModel',
	'collections/payment/PaymentCollection',
	'collections/payment/PaymentListByOrderCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/payment/paymentListTemplate.html',
	'text!templates/payment/paymentInnerListTemplate.html',
	'text!templates/payment/paymentListByOrderTemplate.html',
	'constant',
], function(Backbone, AccordionListView, PaymentModel, PaymentCollection, PaymentListByOrderCollection, contentTemplate, paymentListTemplate, paymentInnerListTemplate, paymentListByOrderTemplate, Const){

	var PaymentListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;				

			this.collection = new PaymentCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist()){
					thisObj.displayPayment();
					thisObj.displayList();
				}
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});				
		},
		
		render: function(){
			this.collection.getPaymentByPurchaseOrder();
			Backbone.View.prototype.refreshTitle('Transactions','list');
		},
		
		displayPayment: function () {
			var innerTemplate = _.template(paymentListTemplate, {'payment_add_url' : '#/'+Const.URL.PAYMENT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Transactions",
				h1_small: "list",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Payment?',
										'confirm-delete-payment',
										'Delete',
										'Delete Payment');
		},
		
		displayList: function () {	
			var data = {
				po_url: '#/'+Const.URL.PO,								
				account_url: '#/'+Const.URL.ACCOUNT,
				payment_url: '#/'+Const.URL.PAYMENT,
				pos: this.collection.models,
				add: Const.CRUD.ADD,
				collapsible_id: Const.PAYMENT.COLLAPSIBLE.ID,
				po_status_pending: Const.STATUSID.PENDING,
				po_status_pending_status_open: Const.STATUSID.OPEN,
				po_status_pending_status_testing: Const.STATUSID.TESTING,
				_: _ 
			};
			
			_.extend(data,Backbone.View.prototype.helpers);
			var innerListTemplate = _.template(paymentInnerListTemplate, data);
			this.subContainer.find("#payment-list tbody").html(innerListTemplate);
			
			this.collapseSelected();
			this.generatePagination();
		},
		
		events: {
			'click .stop-propagation': 'linkStopPropagation',
			'click #order-accordion tr.collapse-trigger': 'toggleAccordion',
		},	

		toggleAccordion: function (ev) {
			var thisObj = this;
			
			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				Const.PAYMENT.COLLAPSIBLE.ID,
				PaymentListByOrderCollection,
				function (collection, id) {
					var collapsibleId = Const.PAYMENT.COLLAPSIBLE.ID+id;
					$('#'+collapsibleId).find('.payment-list-by-order').html(thisObj.generatePaymentListByOrder(collection.models, id));
				}
			);
			
			return false;
		},	

		generatePaymentListByOrder: function (models, poId) {
			var data = {
				payments: models,
				payment_url: '#/'+Const.URL.PAYMENT,	
				_: _ 
			};

			_.extend(data,Backbone.View.prototype.helpers);

			return _.template(paymentListByOrderTemplate, data);
		},
	});

  return PaymentListView;
  
});