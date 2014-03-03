define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleListTemplate.html',
	'constant',
], function(Backbone, contentTemplate, roleListTemplate, Const){

	var RoleListView = Backbone.View.extend({
		el: $("#content"),
		
		initialize: function() {
			
		},
		
		render: function(){
			this.displayRole();
		},
		
		displayRole: function (UserCollection) {
			var innerTemplate = _.template(roleListTemplate, {'role_add_url' : '#/'+Const.URL.ROLE+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Roles",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
	});

  return RoleListView;
  
});