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
		
		initialize: function() {
			this.collection = new UserCollection();
		},
		
		render: function(){
		
			this.collection.getModelsPerPage(1,1);
		
			//var users = new UserCollection();
			/*this.collection.fetch({
				success: function (collection, response, options) {
					var data = {
						user_url: '#/'+Const.URL.USER,
						user_edit_url: '#/'+Const.URL.USER+'/'+Const.CRUD.EDIT,
						users: collection.models,
						_: _ 
					};

					var innerListTemplate = _.template( userInnerListTemplate, data );
					$("#user-list tbody").html(innerListTemplate);
					
				},
				error: function (collection, response, options) {
					alert(response.responseText);
				},
				reset: true,
			});
			
			var innerTemplate = _.template(userListTemplate, {'user_add_url' : '#/'+Const.URL.USER+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Users",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);*/
		}

	});

  return UserListView;
  
});