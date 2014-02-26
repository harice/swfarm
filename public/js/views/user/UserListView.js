define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userListTemplate.html',
], function(Backbone, contentTemplate, userListTemplate){

	var UserListView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			
		},
		
		render: function(){
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