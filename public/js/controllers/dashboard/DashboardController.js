define([
	'backbone',
	'views/dashboard/DashboardView',
	'constant',
], function(Backbone, Dashboard, Const){
	
	function DashboardController () {	
		
		this.setAction = function () {		
			return new Dashboard();
		};			

	};

	return DashboardController;
});
