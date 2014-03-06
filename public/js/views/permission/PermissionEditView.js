define([
	'backbone',
	'models/role/RoleModel',
	'collections/permission/PermissionCategoryTypeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/permission/permissionListTemplate.html',
	'constant',
], function(Backbone, RoleModel, PermissionCategoryTypeCollection, contentTemplate, permissionListTemplate, Const){

	var PermissionListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		options: {
			id: null,
		},
		initialize: function(options) {
			this.options.id = options.id;
		
			this.collection = new PermissionCategoryTypeCollection();
			this.model = new RoleModel();
		},
		
		render: function(){
			var thisObj = this;
		
			this.displayPermission();
			this.collection.getAllModels(this.displayPermissionCategoryType, thisObj);
			this.model.getPermission(this.options.id);
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
		
		displayPermissionCategoryType: function (permissionCategoryTypeCollection, thisObj) {
			console.log(permissionCategoryTypeCollection);
			thisObj.test();
		},
		
		test: function () {
			console.log('test123');
		},
		
	});

  return PermissionListView;
  
});