define([
	'backbone',
], function(Backbone){
    
	var AutoCompleteItemView = Backbone.View.extend({
        tagName: "li",
        template: _.template('<a data-id="<%= id %>" href="#"><%= label %></a>'),
        
        initialize: function(options) {
            this.options = options;
        },

        events: {
            "click": "select"
        },

        render: function () {
            this.$el.html(this.template({
                "label": this.model.label(),
				"id": this.model.get('id'),
            }));
            return this;
        },

        select: function () {
            this.options.parent.hide().select(this.model);
            return false;
        }

    });
	
	return AutoCompleteItemView;
});