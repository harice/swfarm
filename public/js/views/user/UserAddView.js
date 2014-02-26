define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/user/userAddTemplate.html',
], function(Backbone, contentTemplate, userAddTemplate){

	var UserAddView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			//console.log('UserAdd.js:init');
		},
		
		render: function(){
			var variables = {
				h1_title: "Add User",
				sub_content_template: userAddTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click #save' : 'addUser',
		},
		
		addUser: function (){
			alert('start adding user');
		},
		
	});

  return UserAddView;
  
});