define([
	'backbone',
	'views/contact/ContactListView',
	'views/contact/ContactAddView',
	'views/contact/ContactEditView',
	'views/contact/ContactView',
	'constant',
], function(Backbone, ContactListView, ContactAddView, ContactEditView, ContactView, Const){
	
	function ContactController () {	
		
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
			return new ContactAddView();
		};
		
		this.edit = function (id) {
			return new ContactEditView({'id':id});
		};
		
		this.listView = function () {
			return new ContactListView();
		};
		
		this.view = function (id) {
			return new ContactView({'id':id});
		};
		
		this.IsInt = function (i) {
			var reg = /^\d+$/;
			return reg.test(i);
		};
	};

	return ContactController;
});
