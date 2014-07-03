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
			this.renderList(1);
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
			
			this.generatePagination();
		},
		
		events: {
			'click #contract-accordion tr.collapse-trigger': 'toggleAccordion',
		},
		
		toggleAccordion: function (ev) {
			var thisObj = this;
			
			this.toggleAccordionAndRequestACollection(ev.currentTarget,
				SalesOrderDetailsByProductCollection,
				function (collection, id) {
					/*var collapsibleId = Const.PO.COLLAPSIBLE.ID+id;
					_.each(collection.models, function (model) {
						var schedules = model.get('schedule');
						if(schedules.length > 0) {
							for(var i=0; i<schedules.length; i++) {
								var s = schedules[i].transportscheduledate.split(' ');
								schedules[i].transportscheduledate = thisObj.convertDateFormat(s[0], 'yyyy-mm-dd', thisObj.dateFormat, '-')+' '+s[1];			
							}
							model.set('schedule', schedules);
						}
					});
					
					$('#'+collapsibleId).find('.order-weight-details-by-stack').html(thisObj.generateOrderWeightDetailsByStack(collection.models, id));*/
				}
			);
			
			return false;
		},
	});

	return ContractListView;
  
});