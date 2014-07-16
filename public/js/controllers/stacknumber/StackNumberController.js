define([
	'backbone',
	'views/stacknumber/StackNumberView',
	'constant',
], function(Backbone, StackNumberView, Const){
	
	function StackNumberController () {	
		
		this.setAction = function (id) {
			return this.view(id);
		};
		
		this.view = function (id) {
			return new StackNumberView({'id':id});
		};
	};

	return StackNumberController;
});
