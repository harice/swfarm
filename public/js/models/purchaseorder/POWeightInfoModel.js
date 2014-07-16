define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var POWeightInfoModel = Backbone.Model.extend({
		urlRoot: '/apiv1/weightticket',
		defaults: {
        },
		runFetch: function () {
			var thisObj = this;
			this.fetch({
				success: function(model, response, options) {
				},
				error: function(model, response, options) {
				},
				headers: thisObj.getAuth(),
			});
		},
		setCloseURL: function () {
			this.urlRoot = '/apiv1/weightticket/closeWeightTicket';
		},
                
        setEmailURL: function () {
			this.urlRoot = '/apiv1/weightticket/mailWeightTicket';
		}
	});

	return POWeightInfoModel;

});
