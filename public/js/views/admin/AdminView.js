define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/admin/adminTemplate.html',
	'constant',
], function(Backbone, contentTemplate, adminTemplate, Const){

	var AdminView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			
		},
		
		render: function(){
			
			var innerTemplate = _.template(adminTemplate, {'user_url': '#/'+Const.URL.USER});
			
			var variables = {
				h1_title: "Administration",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		}

	});

  return AdminView;
  
});