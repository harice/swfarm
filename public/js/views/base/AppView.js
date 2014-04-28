define([
	'backbone',
	'constant',
], function(Backbone, Const){

	var AppView = Backbone.View.extend({
		
		focusOnFirstField: function () {
			console.log('focusOnFirstField');
			this.$el.find('form:first *:input[type!=hidden]:first').focus();
		},
		
		toFixedValue: function (field, decimal) {
			var value = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()).toFixed(decimal) : '';
			field.val(value);
		},
	});

  return AppView;
  
});