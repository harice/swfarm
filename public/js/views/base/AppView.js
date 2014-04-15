define([
	'backbone',
	'constant',
], function(Backbone, Const){

	var AppView = Backbone.View.extend({
		
		focusOnFirstField: function () {
			console.log('focusOnFirstField');
			this.$el.find('form:first *:input[type!=hidden]:first').focus();
		},
	});

  return AppView;
  
});