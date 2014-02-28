define([
	'backbone',
	'models/user/UserModel',
	'collections/user/UserCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userListTemplate.html',
	'text!templates/user/userInnerListTemplate.html',
], function(Backbone, UserModel, UserCollection, contentTemplate, userListTemplate, userInnerListTemplate){

	var UserListView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			this.collection = new UserCollection();
		},
		
		render: function(){
			//var users = new UserCollection();
			this.collection.fetch({
				success: function (collection, response, options) {
					console.log('success');
					//console.log(collection);
					
					var data = {
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
			
			var variables = {
				h1_title: "Users",
				sub_content_template: userListTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		}

	});

  return UserListView;
  
});