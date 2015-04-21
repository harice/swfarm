define([
	'backbone',
	'views/base/AppView',
	'collections/notification/NotificationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/notification/notificationViewTemplate.html',
	'constant',
], function(Backbone, AppView, NotificationCollection, contentTemplate, notificationViewTemplate, Const){

	var View = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),

		initialize: function(option) {
			this.initSubContainer();
			var thisObj = this;			

			this.notificationCollection = new NotificationCollection();
			this.notificationCollection.getSeenNotifications(option.userId);
			this.notificationCollection.on('sync', function(){
				if(thisObj.subContainerExist()){
					thisObj.displayView(this.models);
				}
			});						
		},
		
		render: function(){
			Backbone.View.prototype.refreshTitle('Notifications','view');				
		},

		displayView: function(data) {
			var data = {
				notifications: data,
				types: Const.NOTIFICATIONS.TYPE,
				classes: Const.NOTIFICATIONS.CLASS
			}
			_.extend(data,Backbone.View.prototype.helpers);

			var notificationTemp = _.template(notificationViewTemplate, data);
			var variables = {				
				sub_content_template: notificationTemp
			};
			
			var compiledTemplate = _.template(contentTemplate, variables);

			this.subContainer.html(compiledTemplate);						
		},		

		events: {
			
		}
	});

  return View;
  
});
