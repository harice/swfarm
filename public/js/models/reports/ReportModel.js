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

		setDefaultURL: function() {
			this.urlRoot = '/apiv1/reports/';			
		},
        
        label: function () {
            return this.get('name');
        },

        fetchStatement: function (reportId, filterId, startDate, endDate) {        
        	this.setDefaultURL();
            this.urlRoot = this.urlRoot + reportId + '?filterId=' + filterId + '&dateStart=' + startDate + '&dateEnd=' + endDate;
            this.runFetch();            
        },

        fetchInventory: function(stackNumbers, startDate, endDate) {
        	console.log(stackNumbers);
        	var stackids = '';
        	this.setDefaultURL();
        	this.urlRoot = this.urlRoot + '9?';

        	for(var i = 1; i < stackNumbers.length; i++){
        		stackids += 'stackIds[]=' + stackNumbers[i] + '&';
        	};

        	console.log(stackids);

        	this.urlRoot = this.urlRoot + stackids + '&dateStart=' + startDate + '&dateEnd=' + endDate;        	
        	this.runFetch(); 
        },

        fetchGrossProfit: function (reportId, startDate, endDate) {
            this.urlRoot = this.urlRoot + reportId + '?dateStart=' +startDate+'&dateEnd='+endDate;
            this.runFetch();
        },
       
	});

	return ReportModel;

});
