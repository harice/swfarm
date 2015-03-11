define([
	'backbone',	
	'models/session/SessionModel',
	'views/notification/NotificationView',
	'constant',
], function(Backbone, Session, NotificationView, Const){
	
	function Controller () {			
		this.setAction = function () {	
			return new NotificationView({'userId': Session.get('su')});
		};			
	};

	return Controller;
});
