define([
	'backbone',
	'text!templates/layout/contentTemplate.html',
	'models/weightticket/WeightTicketModel',
	'global',
	'constant',
], function(Backbone, contentTemplate, WeightTicketModel, Global, Const){

	var WeightTicketView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.model = new WeightTicketModel({id:option.id});
			this.model.on("change", function() {
				console.log('onChange: WeightTicketModel');
			});
		},
		
		render: function(){
			this.model.runFetch();
		}
		
	});

  return WeightTicketView;
  
});