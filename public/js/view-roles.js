
RoleView = Backbone.View.extend({
    initialize: function(){
        //
    },
    render: function(){
        //
    },
    events: {
        "click button[type=submit]": "addRole"
    },
    addRole: function( event ){
        var role = new RoleModel({ name: $('#rolename').val(), description: $('#roledescription').val() });
        var roles = new RoleCollection(role);
    }
});

var role_view = new RoleView({ el: $("#form-addrole") });
