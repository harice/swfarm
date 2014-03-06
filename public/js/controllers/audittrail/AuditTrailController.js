define([
	'backbone',
	'views/audittrail/AuditTrailListView',
], function(Backbone, AuditTrailListView){
	
	function AuditTrailController () {	
		
		this.setAction = function (table, id) {
			
			return new AuditTrailListView();
		};
	};

	return AuditTrailController;
});