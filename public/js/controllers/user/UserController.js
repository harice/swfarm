define([
	'backbone',
	'views/user/UserListView',
	'views/user/UserAddView',
	'views/user/UserEditView',
	'views/user/UserView',
	'constant',
], function(Backbone, UserListView, UserAddView, UserEditView, UserView, Const){
	
	function UserController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
				
				case Const.CRUD.EDIT:
					if(id != null && this.IsInt(id))
						return this.edit(id);
				
				default:
					if(action != null && this.IsInt(action))
						return this.view(action);
					else
						return this.listView();
			}
		};
		
		this.add = function () {
			return new UserAddView();
		};
		
		this.edit = function (id) {
			return new UserEditView({'id':id});
		};
		
		this.listView = function () {
			return new UserListView();
		};
		
		this.view = function (id) {
			return new UserView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return UserController;
});
