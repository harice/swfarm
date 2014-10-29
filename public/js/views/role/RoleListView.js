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
			this.renderList(this.collection.listView.currentPage);
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

			this.initConfirmationWindow('Are you sure you want to delete this role?',
										'confirm-delete-role',
										'Delete');
			
			this.generatePagination();
		},

		preShowConfirmationWindow: function (ev) {
			this.showConfirmationWindow();

			this.$el.find('#confirm-delete-role').attr('data-id', $(ev.currentTarget).attr('data-id'));

			return false;
		},
		
		deleteRole: function (ev){
			var thisObj = this;            
            var roleModel = new RoleModel({id:$(ev.currentTarget).attr('data-id')});
			
            roleModel.destroy({
                success: function (model, response, options) {
                    thisObj.displayMessage(response);
                    thisObj.renderList(thisObj.collection.listView.currentPage);
                },
                error: function (model, response, options) {
                    thisObj.displayMessage(response);
                },
                wait: true,
                headers: roleModel.getAuth(),
            });
		},

		events: {
            'click .delete-role': 'preShowConfirmationWindow',
			'click #confirm-delete-role': 'deleteRole',
		},	
	});

  return RoleListView;
  
});