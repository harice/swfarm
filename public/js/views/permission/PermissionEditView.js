define([
	'backbone',
	'collections/permission/PermissionCategoryTypeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/permission/permissionListTemplate.html',
	'constant',
], function(Backbone, PermissionCategoryTypeCollection, contentTemplate, permissionListTemplate, Const){

	var PermissionListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.collection = new PermissionCategoryTypeCollection();
			this.module
		},
		
		render: function(){
			var thisObj = this;
		
			this.displayPermission();
			this.collection.getAllModels(this.displayPermissionCategoryType, thisObj);
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