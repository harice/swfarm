define([
	'backbone',
	'views/user/UserListView',
	'views/user/UserAddView',
], function(Backbone, UserListView, UserAddView){
	
	function UserController () {	
		
		this.setAction = function (action) {
			
			switch (action) {
				case 'add':
					return this.add();
					break;
					
				default:
					return this.listView();
			}
		};
		
		this.add = function () {
			return new UserAddView();
		};
		
		this.listView = function () {
			return new UserListView();
		};
	};

	return UserController;
});
