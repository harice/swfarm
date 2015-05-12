define([
	'backbone',
	'views/base/AppView',
	'collections/notification/NotificationCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/notification/notificationViewTemplate.html',
	'text!templates/notification/notificationInnerListTemplate.html',
	'constant',
], function(Backbone, AppView, NotificationCollection, contentTemplate, notificationViewTemplate, notificationInnerListTemplate, Const){

	var View = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		notifElement: ("#notifications"),
		limit: 28,

		initialize: function(option) {
			this.pageNum = 1;
			this.userId = option.userId;
			this.allowLoad = true;
			this.initSubContainer();
			var thisObj = this;			

			this.notificationCollection = new NotificationCollection();						
			this.notificationCollection.on('sync', function(data, textStatus, jqXHR){	
				$(".notification-loading").hide();				

				if(thisObj.subContainerExist() && !_.isEmpty(data.list_results)){										
					thisObj.loadResults(data.list_results);						
					thisObj.pageNum += 1;												
				}
				else if(_.isEmpty(data.list_results)) {	
					$("#notifications").append("<p class='end-reached'>Nothing left to load.</p>");  						
					
				}
			});	

			$(window).scroll(function(){ 				
   				if($(window).scrollTop() == ($(document).height() - $(window).height()) && thisObj.allowLoad){ 
   					thisObj.allowLoad = false;   					
   					$("#notifications").append("<div class='notification-loading'>&nbsp;</div>");  					
   					thisObj.notificationCollection.getAllNotifications(thisObj.userId, thisObj.limit, thisObj.pageNum);	
   				}     				
			})
		},
		
		render: function(){		
			this.displayView();		
			this.notificationCollection.getAllNotifications(this.userId, this.limit, this.pageNum);			
			Backbone.View.prototype.refreshTitle('Notifications','view');				
		},

		displayView: function() {							
			var notificationTemp = _.template(notificationViewTemplate);							

			this.subContainer.html(notificationTemp);						
		},

		loadResults: function(results) {						
			var thisObj = this;			
			var variables = {
				notifications: results,
				types: Const.NOTIFICATIONS.TYPE,
				classes: Const.NOTIFICATIONS.CLASS
			}
			_.extend(variables, Backbone.View.prototype.helpers);

			var compiledTemplate = _.template(notificationInnerListTemplate, variables);

			$(this.notifElement).append(compiledTemplate);					
			thisObj.allowLoad = true;
		},		

		events: {
			
		},		
		
	});

  return View;
  
});
