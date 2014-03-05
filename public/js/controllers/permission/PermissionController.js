define([
	'backbone',
	'views/permission/PermissionListView',
	'views/permission/PermissionEditView',
], function(Backbone, PermissionListView, PermissionEditView){
	
	function RoleController () {	
		
		this.setAction = function (id) {
			
			if(id != null && this.IsInt(id)) {
				return this.edit(id);
			}
			else
				return this.listView();
		};
		
		this.edit = function (id) {
			return new PermissionEditView({'id':id});
		};
		
		this.listView = function () {
			return new PermissionListView();
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return RoleController;
});
