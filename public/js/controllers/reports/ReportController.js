define([
	'backbone',
	'views/reports/ReportView',
	'constant',
], function(Backbone, Report, Const){
	
	function ReportController () {	
		
		this.setAction = function () {		
			return new Report();
		};		

	};

	return ReportController;
});
