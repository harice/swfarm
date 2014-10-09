define([
	'backbone',	
	'views/base/AppView',
	'models/payment/PaymentModel',
	'text!templates/layout/contentTemplate.html',
	'global',
	'constant',
], function(
	Backbone,
	AppView, 
	PaymentModel,
	contentTemplate,
	Global,
	Const
){

	var PaymentView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),		

		initialize: function (){			
			this.initSubContainer();
			var thisObj = this;							

		},
		render: function(){				
			Backbone.View.prototype.refreshTitle('Payment','View');
		},		
	});

	 return PaymentView;
  
});
