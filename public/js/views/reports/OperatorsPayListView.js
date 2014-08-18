define([
	'backbone',
	'views/base/ListView',
	'models/reports/OperatorModel',
	'collections/reports/OperatorsPayCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/reports/OperatorsPayListTemplate.html',
	'text!templates/reports/OperatorsPayInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, OperatorModel, OperatorsPay, contentTemplate, operatorListTemplate, operatorInnerListTemplate, Const){

	var OperatorListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.model = new OperatorModel();
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.displayAccount();
					thisObj.renderList(1);
				}
				this.off('change');
			});
			
			this.collection = new AccountCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Accounts','list');
		},
		
		displayAccount: function () {
			var innerTemplate = _.template(accountListTemplate);
			
			var variables = {
				h1_title: "Operator's Pay",
				h1_small: "Report",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
		},
		
		displayList: function () {
			var data = {
				operators: this.collection.models,
			};
			
			var innerListTemplate = _.template(accountInnerListTemplate, data);
			this.subContainer.find("#operators-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .sort-name' : 'sortName',
			'click .sort-type' : 'sortType',
			'change .accounttypeFilter' : 'filterByType',
			'change .checkall' : 'checkAll',
			'click .delete-account': 'preShowConfirmationWindow',
			'click #confirm-delete-account': 'deleteAccount',
		},

		checkAll: function () {
			if($('.checkall').is(':checked')) {
				$('.accountids').prop('checked',true);
			} else {
				$('.accountids').prop('checked',false);
			}
		},
		
		sortName: function () {
			this.sortByField('name');
		},
		
		sortType: function () {
			this.sortByField('accounttype');
		},
		
		filterByType: function (ev) {
			var filter = $(ev.target).val();
			this.collection.setFilter('filter',filter);
			this.renderList(1);
			return false;
		},
		
		preShowConfirmationWindow: function (ev) {
			this.$el.find('#confirm-delete-account').attr('data-id', $(ev.currentTarget).attr('data-id'));
			
			this.showConfirmationWindow();
			return false;
		},
		
		deleteAccount: function (ev) {
			var thisObj = this;
			var accountModel = new AccountModel({id:$(ev.currentTarget).attr('data-id')});
			
            accountModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(1);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: OperatorModel.getAuth(),
            });
		},
	});

  return OperatorListView;
  
});