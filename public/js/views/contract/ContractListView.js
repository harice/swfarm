define([
	'backbone',
	'views/base/AccordionListView',
	'models/contract/ContractModel',
	'collections/contract/ContractCollection',
	'collections/contract/SalesOrderDetailsByProductCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractListTemplate.html',
	'text!templates/contract/contractInnerListTemplate.html',
	'text!templates/contract/salesOrderDetailsByProductItemTemplate.html',
	'constant'
], function(Backbone,
			AccordionListView,
			ContractModel,
			ContractCollection,
			SalesOrderDetailsByProductCollection,
			contentTemplate,
			contractListTemplate,
			contractInnerListTemplate,
			salesOrderDetailsByProductItemTemplate,
			Const
){

	var ContractListView = AccordionListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new ContractCollection();
			this.collection.on('sync', function() {
                _.each(this.models, function (model) {
					if(model.get('contract_date_start'))
						model.set('contract_date_start', thisObj.convertDateFormat(model.get('contract_date_start').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
					if(model.get('contract_date_end'))
						model.set('contract_date_end', thisObj.convertDateFormat(model.get('contract_date_end').split(' ')[0], 'yyyy-mm-dd', thisObj.dateFormat, '-'));
//					if(model.get('totalPrice'))
//						model.set('totalPrice', thisObj.addCommaToNumber(parseFloat(model.get('totalPrice')).toFixed(2)));
				});
                
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayContract();
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Contract','list');
		},
		
		displayContract: function () {
			var innerTemplateVar = {
				'contract_add_url' : '#/'+Const.URL.CONTRACT+'/'+Const.CRUD.ADD
			};
			var innerTemplate = _.template(contractListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Contract',
				h1_small: 'list',
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.setListOptions();
		},
		
		displayList: function () {
            var contracts = this.collection.models;
    
			var data = {
                contract_url: '#/'+Const.URL.CONTRACT,
				contract_edit_url: '#/'+Const.URL.CONTRACT+'/'+Const.CRUD.EDIT,
				contracts: this.collection.models,
				collapsible_id: Const.PO.COLLAPSIBLE.ID,
				_: _ 
			};
			
			var innerListTemplate = _.template(contractInnerListTemplate, data);
			this.subContainer.find("#contract-list tbody").html(innerListTemplate);
			this.collapseSelected();
			this.generatePagination();
		},
		
		setListOptions: function () {
			var options = this.collection.listView;
			console.log(options);
			
			if(options.search != '')
				this.$el.find('#search-keyword').val(options.search);
		},
		
		events: {
			'click #contract-accordion tr.collapse-trigger': 'toggleAccordion',
			'click .stop-propagation': 'linkStopPropagation',
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			
			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				SalesOrderDetailsByProductCollection,
				function (collection, id) {
					var collapsibleId = Const.PO.COLLAPSIBLE.ID+id;
					$('#'+collapsibleId).find('.sales-order-details-by-product').html(thisObj.generateSalesOrderDetailsByProduct(collection.models, id));
				}
			);
			
			return false;
		},
		
		generateSalesOrderDetailsByProduct: function (models) {
			var data = {
				products: models,
				contract_url: '/#/'+Const.URL.CONTRACT,
				sales_order_url: '/#/'+Const.URL.SO,
				_: _ 
			};
			return _.template(salesOrderDetailsByProductItemTemplate, data);
		},
	});

	return ContractListView;
  
});