define([
	'backbone',
	'models/account/AccountExtrasModel',
	'collections/account/AccountCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountListTemplate.html',
	'text!templates/account/accountFilterTemplate.html',
	'text!templates/account/accountInnerListTemplate.html',
	'constant',
], function(Backbone, AccountExtrasModel, AccountCollection, contentTemplate, accountListTemplate, accountFilterTemplate, accountInnerListTemplate, Const){

	var AccountListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			var thisObj = this;
			
			this.model = new AccountExtrasModel();
			this.model.on("change", function() {
				thisObj.displayAccount();
				thisObj.collection.options.currentPage = 1;
				thisObj.collection.getModelsPerPage(thisObj.collection.options.currentPage , Const.MAXITEMPERPAGE);
				this.off("change");
			});
			
			this.collection = new AccountCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayAccount: function () {
			var filterTemplate = _.template(accountFilterTemplate, {'filters' : this.model.get('accountTypes')});
			var innerTemplate = _.template(accountListTemplate, {type_filters: filterTemplate, 'account_add_url' : '#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Accounts",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				account_url: '#/'+Const.URL.ACCOUNT,
				account_edit_url: '#/'+Const.URL.ACCOUNT+'/'+Const.CRUD.EDIT,
				accounts: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template(accountInnerListTemplate, data);
			$("#account-list tbody").html(innerListTemplate);
			
			this.generatePagination(this.collection.options.maxItem, Const.MAXITEMPERPAGE);
		},
		
		generatePagination: function (maxItem, maxItemPerPage) {
			$('.page-number').remove();
			
			var lastPage = Math.ceil(maxItem / maxItemPerPage);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == this.collection.options.currentPage) {
						active = ' class="active"';
						activeValue = ' <span class="sr-only">(current)</span>';
					}
						
					$('.pagination .last-page').parent().before('<li'+active+'><a class="page-number" href="#" data-pagenum="'+i+'">'+i+activeValue+'</a></li>');
				}
			}
			else {
				$('.pagination').hide();
			}
		},
		
		events: {
			'click .first-page' : 'gotoFirstPage',
			'click .last-page' : 'gotoLastPage',
			'click .page-number' : 'gotoPage',
			'click .sort-name' : 'sortName',
			'click .sort-type' : 'sortType',
			'click .account-search' : 'accountSearch',
			'change .accounttypeFilter' : 'filterByType',
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE);
			}
			
			return false;
		},
		
		sortName: function () {
			this.sortByField('name');
		},
		
		sortType: function () {
			this.sortByField('accounttype');
		},
		
		sortByField: function (sortField) {
			if(this.collection.options.currentSort == sortField)
				this.collection.options.sort[sortField] = !this.collection.options.sort[sortField];
			
			this.collection.options.currentSort = sortField;
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			return false;
		},
		
		accountSearch: function () {
			var keyword = $('#search-keyword').val();
			this.collection.options.search = keyword;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			return false;
		},
		
		filterByType: function (ev) {
			var filter = $(ev.target).val();
			this.collection.options.filter = filter;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE);
			return false;
		},
	});

  return AccountListView;
  
});