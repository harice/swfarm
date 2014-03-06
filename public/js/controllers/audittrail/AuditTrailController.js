define([
	'backbone',
	'views/audittrail/AuditTrailListView',
], function(Backbone, AuditTrailListView){
	
	function AuditTrailController () {	
		
		this.setAction = function (table, id) {
			
			return false;
		};
	};

	return AuditTrailController;
});
