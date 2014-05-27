define([
	'backbone',
	'bootstrapdatepicker',
	'views/purchaseorder/WeightInfoAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'text!templates/layout/contentTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			WeightInfoAddView,
			Validate,
			TextFormatter,
			contentTemplate,
			Global,
			Const
){

	var WeightInfoEditView = WeightInfoAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
		},
		
		render: function(){
		},
		
		displayForm: function () {
		},
	});

	return WeightInfoEditView;
});