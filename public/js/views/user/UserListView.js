define([
	'backbone',
	'views/base/ListView',
	'models/user/UserModel',
	'collections/user/UserCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userListTemplate.html',
	'text!templates/user/userInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, UserModel, UserCollection, contentTemplate, userListTemplate, userInnerListTemplate, Const){

	var UserListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			
			var thisObj = this;
			
			this.collection = new UserCollection();
			this.collection.on('sync', function() {
				thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayUser();
			this.renderList(1);
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
		
		displayList: function () {
			
			var data = {
				user_url: '#/'+Const.URL.USER,
				user_edit_url: '#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
				users: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( userInnerListTemplate, data );
			$("#user-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
		
		events: {
			'click .sort-lastname' : 'sortLastname',
			'click .sort-firstname' : 'sortFirstname',
			'click .sort-email' : 'sortEmail',
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
	});

  return UserListView;
  
});