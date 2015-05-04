define([
	'backbone',
	'models/notification/NotificationModel',
	'text!templates/layout/headerTemplate.html',
	'collections/notification/NotificationCollection',
	'constant',
	'models/session/SessionModel',
], function(Backbone, NotificationModel, headerTemplate, NotificationCollection, Const, Session){

	var HeaderView = Backbone.View.extend({
		el: $("#head-nav"),


		initialize: function() {
			var thisObj = this;

			_.bindAll(this,'profileMenuHandler');

			this.notificationModel = new NotificationModel();
	        this.notificationModel.on('fetch_model_success', function(model, response, options) {          
	          thisObj.displayNotifications(model.get('count'));       	                  
	        });

			this.notificationCollection = new NotificationCollection();
			this.notificationCollection.on('sync', function(collection, response, options, otherOptions){				
				if(typeof otherOptions != "undefined") {
					console.log("If: "+collection.list_results);
					$(".notifications_menu .new-notifications").html(thisObj.getNotificationList(collection.list_results, true));						
				}
				else {
					if(!_.isEmpty(collection.list_results)) {
						
						console.log("Else if");
						$(".notifications_menu .new-notifications").html(thisObj.getNotificationList(collection.list_results));
					}
					else {
						console.log("Else Else");
						thisObj.getSeenNotification();
					}
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

		fetchNotifications: function(ev) {				
			$(".notifications_menu").removeClass("notified").find(".notification-count").text('').hide();

			this.notificationModel.getNotificationCount(Session.get('su'));			
		},

		displayNotifications: function(count) {
			if(count == 0) {					
				if($(".notifications_menu .new-notifications").children().length == 0) {
					$(".notifications_menu .new-notifications").html('<div class="notification loading">Loading ...</div>');
					this.notificationCollection.getNotificationList(Session.get('su'));	
				}
			}
			else {
				$(".notifications_menu .new-notifications").html('<div class="notification loading">Loading ...</div>');
				this.notificationCollection.getNotificationList(Session.get('su'));	
			}		
		},

		getNotificationList: function(data, seen) {			
			var notifications = '';
			var nClass = (seen) ? 'notification seen' : 'notification';			

			if(!_.isEmpty(data)) {
				_.each(data, function(n){
					notifications += '<div class="'+nClass+'"><span>'+n.details+'. </span><small>'+ Backbone.View.prototype.helpers.formatDateAMPM(n.updated_at)+'</small></div>';
				});
			}

			else {
				notifications = '<div class="notification loading">No notifications found.</div>'	
			}

			return notifications;
		},

		getSeenNotification: function() {			
			this.notificationCollection.getSeenNotificationsPerPage(Session.get('su'), 10, {seen: 1});		
		}		

	});

  return HeaderView;
  
});
