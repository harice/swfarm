define([
	'backbone',
	'models/user/UserModel',
	'collections/user/UserCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userListTemplate.html',
	'text!templates/user/userInnerListTemplate.html',
	'constant',
], function(Backbone, UserModel, UserCollection, contentTemplate, userListTemplate, userInnerListTemplate, Const){

	var UserListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			//console.log('UserListView:init');
			//console.log('this.options.currentPage:'+this.options.currentPage);
			this.collection = new UserCollection();
		},
		
		render: function(){
			this.displayUser();
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(this.collection.options.currentPage , Const.MAXITEMPERPAGE, this.displayList);
		},
		
		displayUser: function () {
			var innerTemplate = _.template(userListTemplate, {'user_add_url' : '#/'+Const.URL.USER+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Users",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function (userCollection) {
			//console.log('displayUser');
			//console.log(userCollection);
			
			var data = {
				user_url: '#/'+Const.URL.USER,
				user_edit_url: '#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
				users: userCollection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( userInnerListTemplate, data );
			$("#user-list tbody").html(innerListTemplate);
			
			$('.page-number').remove();
			var lastPage = Math.ceil(userCollection.options.maxItem / Const.MAXITEMPERPAGE);
			
			if(lastPage > 1) {
				$('.pagination').show();
				
				for(var i=1; i <= lastPage; i++) {
					var active = '';
					var activeValue = '';
					
					if(i == userCollection.options.currentPage) {
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
			'click .sort-lastname' : 'sortLastname',
			'click .sort-firstname' : 'sortFirstname',
			'click .sort-email' : 'sortEmail',
		},
		
		gotoFirstPage: function () {
			if(this.collection.options.currentPage != 1) {
				this.collection.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = Math.ceil(this.collection.options.maxItem / Const.MAXITEMPERPAGE);
			if(this.collection.options.currentPage != lastPage) {
				this.collection.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).attr('data-pagenum');
			if(this.collection.options.currentPage != page) {
				this.collection.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		sortLastname: function () {
			this.sortByField('lastname');
		},
		
		sortFirstname: function () {
			this.sortByField('firstname');
		},
		
		sortEmail: function () {
			this.sortByField('email');
		},
		
		sortByField: function (sortField) {
			if(this.collection.options.currentSort == sortField)
				this.collection.options.sort[sortField] = !this.collection.options.sort[sortField];
			
			this.collection.options.currentSort = sortField;
			this.collection.options.currentPage = 1;
			this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE, this.displayList);
		},
	});

  return UserListView;
  
});