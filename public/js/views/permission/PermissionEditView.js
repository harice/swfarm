define([
	'backbone',
	'views/base/AppView',
	'models/role/RoleModel',
	'collections/permission/PermissionCategoryTypeCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/permission/permissionListTemplate.html',
	'text!templates/permission/permissionInnerListTemplate.html',
	'constant',
], function(Backbone, AppView, RoleModel, PermissionCategoryTypeCollection, contentTemplate, permissionListTemplate, permissionInnerListTemplate, Const){

	var PermissionListView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		options: {
			id: null,
		},
		initialize: function(options) {
			this.initSubContainer();
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
				if(thisObj.subContainerExist())
					thisObj.displayList();
				this.off('change');
			});
		},
		
		render: function(){
			var thisObj = this;
			this.displayPermission();
			this.collection.getAllModels();
			Backbone.View.prototype.refreshTitle('Permissions','edit');
		},
		
		displayPermission: function () {
			var innerTemplate = _.template(permissionListTemplate, {'role_url' : '#/'+Const.URL.ROLE});
			
			var variables = {
				h1_title: "Permissions",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
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
			this.subContainer.find("#permission-list tbody").html(innerListTemplate);
			
			$('.form-button-container').show();
			
			var validate = $('#addPermissionToRoleForm').validate({
				submitHandler: function(form) {
					var data = $(form).serializeObject();
					
					if(typeof data.permission != 'undefined' && typeof data.permission != 'string')
						data.permission = data.permission.join(',');
					
					data.id = thisObj.model.get('id');
					
					var roleModel = new RoleModel(data);
                    // thisObj.displayMessage(response);
					roleModel.savePermissions();
				}
			});
			
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
		},
	});

  return PermissionListView;
  
});