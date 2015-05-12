define([
	'backbone',
	'collections/base/ListViewCollection',
	'models/notification/NotificationModel',
	'constant'
], function(Backbone, ListViewCollection, NotificationModel, Const){
	var AccountCollection = ListViewCollection.extend({
		url: '/apiv1/notification',
		model: NotificationModel,
		listView: {
			numPerPage: Const.MAXITEMPERPAGE,
			currentPage: 1,
			maxItem: 0,
			search: '',
			currentSort: 'name',
			sort: {
				name: true,
				accounttype:true,
			},
			filters: {
				type: ''
			},
			filter: '',
			date: '',
			lookUpIds: {},			
			searchURLForFilter: true,
			otherData:{},
		},

		getNotificationCount: function(id, options) {
			this.url = '/apiv1/notification/getNumberOfNotification/' + id;
			this.getModels(options);
		},

		getNotificationList: function(id) {
			this.url = '/apiv1/notification/getNotificationList/' + id;
			this.getModels();
		},	

		getSeenNotifications: function(id) {
			this.url = '/apiv1/notification/getSeenNotifications/' + id;
			this.getModels();
		},

		getSeenNotificationsPerPage: function(id, numPerPage, options) {
			this.url = '/apiv1/notification/getSeenNotifications/' + id + '?perpage=' +numPerPage;
			this.getModels(options);
		},

		getAllNotifications: function(id, limit, page) {
			this.url = '/apiv1/notification/getSeenNotifications/' + id + '?page=' + page + '&limit=' + limit;
			this.getModels();
		}	
	});

	return AccountCollection;

});
