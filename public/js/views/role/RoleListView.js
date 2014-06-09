define([
	'backbone',
	'views/base/ListView',
	'models/role/RoleModel',
	'collections/role/RoleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/role/roleListTemplate.html',
	'text!templates/role/roleInnerListTemplate.html',
	'constant',
], function(Backbone, ListView, RoleModel, RoleCollection, contentTemplate, roleListTemplate, roleInnerListTemplate, Const){

	var RoleListView = ListView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.extendListEvents();
			this.initSubContainer();
			
			var thisObj = this;
			
			this.collection = new RoleCollection();
			this.collection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayList();
			});
			
			this.collection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.displayRole();
			this.renderList(1);
			Backbone.View.prototype.refreshTitle('Roles','list');
		},
		
		displayRole: function () {
			var innerTemplate = _.template(roleListTemplate, {'role_add_url' : '#/'+Const.URL.ROLE+'/'+Const.CRUD.ADD});
			
			var variables = {
				h1_title: "Roles",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
		},
		
		displayList: function () {
			var data = {
				role_url: '#/'+Const.URL.ROLE,
				role_edit_url: '#/'+Const.URL.ROLE+'/'+Const.CRUD.EDIT,
				permission_edit_url: '#/'+Const.URL.PERMISSION,
				roles: this.collection.models,
				_: _ 
			};
			
			var innerListTemplate = _.template( roleInnerListTemplate, data );
			this.subContainer.find("#role-list tbody").html(innerListTemplate);
			
			this.generatePagination();
		},
	});

  return RoleListView;
  
});