define([
	'backbone',
	'text!templates/layout/headerTemplate.html'
], function(Backbone, headerTemplate){

	var HeaderView = Backbone.View.extend({
		el: $("#header"),


		initialize: function() {
			
		},
		
		render: function(){
			var compiledTemplate = _.template(headerTemplate, {});
			this.$el.html(compiledTemplate);
		}

	});

  return HeaderView;
  
});
