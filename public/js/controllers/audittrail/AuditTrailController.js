define([
	'backbone',
	'views/audittrail/AuditTrailListView',
], function(Backbone, AuditTrailListView){
	
	function AuditTrailController () {	
		
		this.setAction = function (table, id) {
			return new AuditTrailListView({table:table, id:id});
		};
	};

	return AuditTrailController;
});
