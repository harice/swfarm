define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/admin/adminTemplate.html',
], function(Backbone, contentTemplate, adminTemplate){

	var AdminView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			
		},
		
		render: function(){
			var variables = {
				h1_title: "Administration",
				sub_content_template: adminTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		}

	});

  return AdminView;
  
});