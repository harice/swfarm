define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/admin/adminTemplate.html',
	'constant',
], function(Backbone, contentTemplate, adminTemplate, Const){

	var AdminView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			
		},
		
		render: function(){
			
			var innerTemplateVariables = {
				'user_url': '#/'+Const.URL.USER,
				'role_url': '#/'+Const.URL.ROLE,
				'audittrail_url': '#/'+Const.URL.AUDITTRAIL,
			};
			var innerTemplate = _.template(adminTemplate, innerTemplateVariables);
			
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