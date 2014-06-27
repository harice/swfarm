define([
	'backbone',
	'views/base/ListView',
	'models/contract/ContractModel',
	'collections/contract/ContractCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/contract/contractListTemplate.html',
	'text!templates/contract/contractInnerListTemplate.html',
	'constant'
], function(Backbone,
			ListView,
			ContractModel,
			ContractCollection,
			contentTemplate,
			trailerListTemplate,
			trailerInnerListTemplate,
			Const
){

	var ContractListView = ListView.extend({
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
			var innerTemplate = _.template(trailerListTemplate, innerTemplateVar);
			
			var variables = {
				h1_title: 'Contract',
				h1_small: 'list',
				sub_content_template: innerTemplate
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this Contract?',
										'confirm-delete-contract',
										'Delete',
										'Delete Contract');
		},
		
		displayList: function () {
            var contracts = this.collection.models;
            console.log(contracts);
    
			var data = {
				contract_edit_url: '#/'+Const.URL.CONTRACT+'/'+Const.CRUD.EDIT,
				contracts: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(trailerInnerListTemplate, data);
			this.subContainer.find("#contract-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .delete-contract': 'preShowConfirmationWindow',
			'click #confirm-delete-contract': 'deleteContract'
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-contract').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteContract: function (ev) {
			var thisObj = this;
			var contractModel = new ContractModel({id:$(ev.currentTarget).attr('data-id')});
			
            contractModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: contractModel.getAuth()
            });
		}
	});

	return ContractListView;
  
});