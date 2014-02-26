// Filename: app.js
define([ 
	'backbone',
	'bootstrap',
	'router', // Request router.js
], function(Backbone, Bootstrap, Router){
	var initialize = function(){
		
		Backbone.View.prototype.close = function () {
			this.$el.empty();
			this.unbind();
		};
		
		// Pass in our Router module and call it's initialize function
		Router.initialize();
	};

	return { 
		initialize: initialize
	};
});
