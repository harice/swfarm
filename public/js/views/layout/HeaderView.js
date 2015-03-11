define([
	'backbone',
	'text!templates/layout/headerTemplate.html',
	'collections/notification/NotificationCollection',
	'constant',
	'models/session/SessionModel',
], function(Backbone, headerTemplate, NotificationCollection, Const, Session){

	var HeaderView = Backbone.View.extend({
		el: $("#head-nav"),


		initialize: function() {
			var thisObj = this;

			_.bindAll(this,'profileMenuHandler');

			this.notificationCollection = new NotificationCollection();
			this.notificationCollection.on('sync', function(collection, response, options, otherOptions){
				if(typeof otherOptions != "undefined") {
					if(typeof otherOptions.seen != "undefined")
						$(".notifications_menu .new-notifications").html(thisObj.getNotificationList(this.models, true));
					else
						thisObj.fetchNotifications('', this.models);
				}
				else {
					if(!_.isEmpty(this.models))
						$(".notifications_menu .new-notifications").html(thisObj.getNotificationList(this.models));
					else 
						thisObj.getSeenNotification();
				}
			});
		},
		
		render: function(title,desc){
			var innerTemplateVariables = {

				'logout_url'	: '#/'+Const.URL.LOGOUT,
				
				'profile_view_url'	: '#/'+Const.URL.PROFILE,
				'profile_edit_url'		: '#/'+Const.URL.PROFILE+'/'+Const.CRUD.EDIT,
				
				'menu'			: Const.MENU,
				'token'			: Session.get('token'),
				'permission'	: Session.get('permission'),
				'su'			: Session.get('su'),
				'full_name'		: Session.get('firstname'),
				'h1_title'		: title,
				'h1_small'		: desc
			};

			var compiledTemplate = _.template(headerTemplate, innerTemplateVariables);
			this.$el.html(compiledTemplate);
		},

		events: {
			'click .profile_menu' : 'profileMenuHandler',
			'click .notifications_menu .dropdown-toggle': 'fetchNotifications'
		},

		profileMenuHandler: function(e) {
			$("ul.cl-vnavigation li").removeClass('active');
		},

		fetchNotifications: function(ev, data) {			
			if(typeof data == "undefined")
				this.notificationCollection.getNotificationCount(Session.get('su'), {count: 1});
			else {
				if(_.isEmpty(data)) {					
					if($(".notifications_menu .new-notifications").children().length == 0) {
						$(".notifications_menu .new-notifications").html('<div class="notification loading">Loading ...</div>');
						this.notificationCollection.getNotificationList(Session.get('su'));	
					}
				}
				else {
					$(".notifications_menu .new-notifications").html('<div class="notification loading">Loading ...</div>');
					this.notificationCollection.getNotificationList(Session.get('su'));	
				}				
			}				
		},

		getNotificationList: function(data, seen) {			
			var notifications = '';
			var nClass = (seen) ? 'notification seen' : 'notification';
			console.log(seen);

			_.each(data, function(n){
				notifications += '<div class="'+nClass+'"><span>'+n.get('details')+'. </span><small>'+ Backbone.View.prototype.helpers.formatDateAMPM(n.get('updated_at'))+'</small></div>';
			});

			return notifications;
		},

		getSeenNotification: function() {			
			this.notificationCollection.getSeenNotificationsPerPage(Session.get('su'), 10, {seen: 1});		
		}		

	});

  return HeaderView;
  
});
