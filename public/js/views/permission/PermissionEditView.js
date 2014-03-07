define([
	'backbone',
	'models/role/RoleModel',
	'collections/permission/PermissionCategoryTypeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/permission/permissionListTemplate.html',
	'text!templates/permission/permissionInnerListTemplate.html',
	'constant',
], function(Backbone, RoleModel, PermissionCategoryTypeCollection, contentTemplate, permissionListTemplate, permissionInnerListTemplate, Const){

	var PermissionListView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		options: {
			id: null,
		},
		initialize: function(options) {
			var thisObj = this;
			
			this.options.id = options.id;
		
			this.collection = new PermissionCategoryTypeCollection();
			this.collection.on('sync', function() {
				//console.log('collection.on.sync')
				thisObj.model.fetchPermission(thisObj.options.id);
				this.off('sync');
			});
			
			this.collection.on('error', function(collection, response, options) {
				//console.log('collection.on.error')
				//console.log(collection);
				//console.log(response);
				//console.log(options);
				this.off('error');
			});
			
			this.model = new RoleModel();
			this.model.on('change', function() {
				if(this.hasChanged('id')) {
					thisObj.displayList();
					this.off('change');
				}
			});
		},
		
		render: function(){
			var thisObj = this;
			this.displayPermission();
			this.collection.getAllModels();
		},
		
		displayPermission: function () {
			var innerTemplate = _.template(permissionListTemplate, {'role_url' : '#/'+Const.URL.ROLE});
			
			var variables = {
				h1_title: "Permissions",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
		},
		
		displayList: function () {
			var thisObj = this;
			
			$('#permission-list thead tr').append('<th>'+this.model.get('name')+'</th>');
			
			var data = {
				permissions:  thisObj.collection.getFormattedPermissionArray(),
				rolePermissions: thisObj.model.getPermissionIds(),
				_: _ 
			};
			
			var innerListTemplate = _.template(permissionInnerListTemplate, data);
			$("#permission-list tbody").html(innerListTemplate);
			
			$('.form-button-container').show();
			
			var validate = $('#addPermissionToRoleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					if(typeof data.permission != 'undefined' && typeof data.permission != 'string')
						data.permission = data.permission.join(',');
					
					data.id = thisObj.model.get('id');
					
					var roleModel = new RoleModel(data);
					roleModel.savePermissions();
				}
			});
			
		},
	});

  return PermissionListView;
  
});