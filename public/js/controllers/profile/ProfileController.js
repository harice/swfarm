define([
	'backbone',
	'views/profile/ProfileView',
	'views/profile/ProfileEditView',
	'constant',
], function(Backbone, ProfileView, ProfileEditView, Const){
	
	function ProfileController () {	
		
		this.setAction = function (action, id) {
			
			switch (action) {
				case Const.CRUD.EDIT:
					return this.edit();
					break;	
						
				default:
					return this.view();
			}
		};
		
		this.edit = function (id) {
			return new ProfileEditView({'id':id});
		};
		
		this.view = function () {
			return new ProfileView();
		};
	};

	return ProfileController;
});
