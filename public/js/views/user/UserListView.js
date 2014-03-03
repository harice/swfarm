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
		el: $("#content"),
		
		options: {
			currentPage: 1,
			maxItem: 0,
		},
		
		initialize: function() {
			//console.log('UserListView:init');
			//console.log('this.options.currentPage:'+this.options.currentPage);
			this.collection = new UserCollection();
		},
		
		render: function(){
			this.displayUser();
			this.collection.getModelsPerPage(this.options.currentPage , Const.MAXITEMPERPAGE, this.displayList);
		},
		
		displayUser: function (UserCollection) {
			var innerTemplate = _.template(userListTemplate, {'user_add_url' : '#/'+Const.URL.USER+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Users",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function (userCollection, maxUsers) {
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
			var lastPage = Math.ceil(maxUsers / Const.MAXITEMPERPAGE);
			for(var i=1; i <= lastPage; i++) {
				var lastClass = '';
				
				if(i == lastPage)
					lastClass = ' last';
				
				$('.pagination .last-page').parent().before('<li><a class="page-number'+lastClass+'" href="#">'+i+'</a></li>');
			}
		},
		
		events: {
			'click .first-page' : 'gotoFirstPage',
			'click .last-page' : 'gotoLastPage',
			'click .page-number' : 'gotoPage',
		},
		
		gotoFirstPage: function () {
			if(this.options.currentPage != 1) {
				this.options.currentPage = 1;
				this.collection.getModelsPerPage(1 , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoLastPage: function () {
			var lastPage = $('.user-list-pagination .last').text();
			
			if(this.options.currentPage != lastPage) {
				this.options.currentPage = lastPage;
				this.collection.getModelsPerPage(lastPage , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
		
		gotoPage: function (ev) {
			var page = $(ev.target).text();
			if(this.options.currentPage != page) {
				this.options.currentPage = page;
				this.collection.getModelsPerPage(page , Const.MAXITEMPERPAGE, this.displayList);
			}
			
			return false;
		},
	});

  return UserListView;
  
});