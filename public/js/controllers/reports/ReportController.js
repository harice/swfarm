define([
	'backbone',
	'views/reports/ReportView',
	'constant',
], function(Backbone, Report, Const){
	
	function ReportController () {	
		
		this.setAction = function (action) {		
			switch(action) {	
				default:
					return this.reportView();	
			}
		};		

		this.reportView = function() {
			return new Report();

		};

	};

	return ReportController;
});
