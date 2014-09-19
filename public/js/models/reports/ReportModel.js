define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var ReportModel = Backbone.Model.extend({
		
		urlRoot: '/apiv1/reports/',
		defaults: {

        },

		runFetch: function () {
			var thisObj = this;            
						
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.REPORT, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
			
		},
        
        label: function () {
            return this.get('name');
        },

        fetchStatement: function (reportId, filterId, startDate, endDate) {
            this.urlRoot = this.urlRoot + reportId + '?filterId=' + filterId + '&dateStart=' + startDate + '&dateEnd=' + endDate;
            this.runFetch();
        },

        fetchOperatorsPay: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/operator-pay/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();            
        },

		fetchTruckingStatement: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/trucking-statement/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },

        fetchProducersStatement: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/producer-statement/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },        

        fetchInventory: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/inventoryPerLocation?storagelocationId=' + id + '&dateFrom=' +startDate+'&dateTo='+endDate;
        	this.runFetch();
        },

        fetchCustomerSales: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/sales/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },

        fetchCommissionStatement: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/commission/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },

        fetchGrossProfit: function (startDate, endDate) {
        	this.urlRoot = '/apiv1/report/gross-profit?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },

        fetchDriverStatement: function (id, startDate, endDate) {
        	this.urlRoot = '/apiv1/report/driver-pay/' + id + '?dateStart=' +startDate+'&dateEnd='+endDate;
        	this.runFetch();
        },
	});

	return ReportModel;

});
