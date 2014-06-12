define([
	'backbone',
	'views/base/AppView',
	'text!templates/layout/contentTemplate.html',
	'text!templates/admin/adminTemplate.html',
	'constant',
], function(Backbone, AppView, contentTemplate, adminTemplate, Const){

	var AdminView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
		},
		
		render: function(){
			Backbone.View.prototype.refreshTitle('Admin','dashboard');

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
			this.subContainer.html(compiledTemplate);
		}

	});

  return AdminView;
  
});