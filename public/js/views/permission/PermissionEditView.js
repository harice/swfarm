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
				thisObj.model.getPermission(thisObj.options.id);
				this.off('sync');
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
			var roleAttributes = this.model.toJSON();
			var rolePermissions = new Array();
			
			_.each(roleAttributes.permission, function (permission) {
				rolePermissions.push(permission.permissioncategorytype);
			});
			
			var permissions = this.getFormattedPermissionArray();
			
			$('#permission-list thead tr').append('<th>'+roleAttributes.name+'</th>');
			$('#role').val(roleAttributes.id);
			
			for(var i in permissions) {
				if(typeof permissions[i] !== 'function') {
					$("#permission-list tbody").append('<tr><td colspan="2"><strong>'+i+'</strong></td></tr>');
					for(var ii=0; ii < permissions[i].length; ii++) {
						var checked = (rolePermissions.indexOf(permissions[i][ii].id) != -1)? ' checked' : '';
						var checkbox = '<input type="checkbox" name="permission" value="'+permissions[i][ii].id+'"'+checked+'>';
						$("#permission-list tbody").append('<tr><td>'+permissions[i][ii].name+'</td><td>'+checkbox+'</td></tr>');
					}
				}
			}
			$('.form-button-container').show();
			
			var validate = $('#addPermissionToRoleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					if(typeof data.permission != 'undefined' && typeof data.permission != 'string')
						data.permission = data.permission.join(',');
					
					
					var roleModel = new RoleModel(data);
					roleModel.savePermissions();
				}
			});
			
		},
		
		getFormattedPermissionArray: function (permissionCollection) {
			var permissions = new Array();
			
			_.each(this.collection.models, function (permissionModel) {
				permissions.push(permissionModel.toJSON());
			});
			
			
			var formatted = {};
			for(var i in permissions) {
				if(typeof permissions[i] !== 'function') {
					var category = permissions[i].permission_category[0].name;
					if(typeof formatted[category] == 'undefined')
						formatted[category] = new Array();
					formatted[category].push({id:permissions[i].permission_type[0].id, name:permissions[i].permission_type[0].name});
				}
			}
			
			return formatted;
		},
	});

  return PermissionListView;
  
});