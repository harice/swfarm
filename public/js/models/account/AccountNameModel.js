define(['backbone'], function(Backbone) {

	var AccounNametModel = Backbone.Model.extend({
		urlRoot: '/apiv1/account/getAccountsByName',
        label: function () {
            return this.get("name");
        }
	});

	return AccounNametModel;

});
