define(['backbone'], function(Backbone) {

	var AccounNametModel = Backbone.Model.extend({
		urlRoot: '/apiv1/account/getAccountsByName',
        label: function () {
            return this.get("name") + ' (' + this.get("accounttype")[0]["name"] + ')';
        }
	});

	return AccounNametModel;

});
