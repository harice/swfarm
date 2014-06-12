define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'text!templates/permission/permissionListTemplate.html',
	'constant',
], function(Backbone, contentTemplate, permissionListTemplate, Const){

	var PermissionListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			
		},
		
		render: function(){
			this.displayPermission();
			Backbone.View.prototype.refreshTitle('Permissions','list');
		},
		
		displayPermission: function () {
			var innerTemplate = _.template(permissionListTemplate, {'admin_url' : '#/'+Const.URL.ADMIN});
			
			var variables = {
				h1_title: "Permissions",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
	});

  return PermissionListView;
  
});