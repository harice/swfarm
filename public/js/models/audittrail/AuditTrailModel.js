define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var AuditTrailModel = Backbone.Model.extend({
		urlRoot: '/apiv1/audit',
		defaults: {
        },
	});

	return AuditTrailModel;

});
