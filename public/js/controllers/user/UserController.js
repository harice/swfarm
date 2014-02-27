define([
	'backbone',
	'views/user/UserListView',
	'views/user/UserAddView',
	'views/user/UserView',
	'constant',
], function(Backbone, UserListView, UserAddView, UserView, Const){
	
	function UserController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.ADD:
					return this.add();
					break;
					
				default:
					if(action != null && this.IsInt(action)) {
						return this.view(action);
					}
					else
						return this.listView();
			}
		};
		
		this.add = function () {
			return new UserAddView();
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
