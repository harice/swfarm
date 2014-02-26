var RoleModel = Backbone.Model.extend({
    urlRoot: '/apiv1/roles',
    defaults: {
        name: '',
        description: ''
    }
});

var RoleCollection = Backbone.Collection.extend({
    model: RoleModel
});