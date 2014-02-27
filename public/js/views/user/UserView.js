define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userViewTemplate.html',
	'models/user/UserModel',
], function(Backbone, contentTemplate, userViewTemplate, UserModel){

	var UserView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function(option) {
			this.model = new UserModel({id:option.id});
		},
		
		render: function(){
			var variables = {
				h1_title: "User View",
				sub_content_template: userViewTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			this.model.fetch({
				success: function(model, response, options) {
					console.log('success');
					console.log(response);
				},
				error: function(model, response, options) {
					console.log('error');
					console.log(response);
				},
			});
		},
		
	});

  return UserView;
  
});