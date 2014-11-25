define([
	'backbone',
	'views/base/ListView',
	'models/account/AccountModel',
	'models/account/AccountExtrasModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountListTemplate.html',
	'text!templates/account/accountFilterTemplate.html',
	'text!templates/account/accountInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, AccountModel, AccountExtrasModel, AccountCollection, contentTemplate, accountListTemplate, accountFilterTemplate, accountInnerListTemplate, Const){

	var AccountListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.model = new AccountExtrasModel();
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					thisObj.resetSearchFilters();
					thisObj.displayAccount();
					thisObj.renderList(thisObj.collection.listView.currentPage);
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
			this.renderList(this.collection.listView.currentPage);
			Backbone.View.prototype.refreshTitle('Accounts','list');
		},
		
		displayAccount: function () {
			var filterTemplate = _.template(accountFilterTemplate, {'filters' : this.model.get('accountTypes')});
			var innerTemplate = _.template(accountListTemplate, {type_filters: filterTemplate, 'account_add_url' : '#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Accounts",
				h1_small: "list",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.initConfirmationWindow('Are you sure you want to delete this account?',
										'confirm-delete-account',
										'Delete',
										'Delete Account');			
		},
		
		displayList: function () {
			var data = {
				account_url: '#/'+Const.URL.ACCOUNT,
				account_edit_url: '#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.EDIT,
				accounts: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(accountInnerListTemplate, data);
			this.subContainer.find("#account-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},

		resetSearchFilters: function(){
			var options = this.collection.listView;			

			if(options.search != '')
				this.collection.setSearch('');
			
			if(options.filter != ' ')
				this.collection.setFilter('filter', '')			
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
                    thisObj.renderList(thisObj.collection.listView.currentPage);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: accountModel.getAuth(),
            });
		},
	});

  return AccountListView;
  
});