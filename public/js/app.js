// Filename: app.js
define([ 
	'backbone',
	'bootstrap',
	'router',
	'models/session/SessionModel',
], function(Backbone, Bootstrap, Router, SessionModel){
	var initialize = function(){
		
		Backbone.View.prototype.close = function () {
			this.$el.empty();
			this.unbind();
		};
		
		Backbone.Collection.prototype.getAuth = function () {
			return {'Authorization': 'Basic '+SessionModel.get('token')};
		};
		
		Backbone.Model.prototype.getAuth = function () {
			return {'Authorization': 'Basic '+SessionModel.get('token')};
		};
		
		$.fn.serializeObject = function() {
			var o = {};
			var a = this.serializeArray();
			$.each(a, function() {
				if (o[this.name] !== undefined) {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				} else {
					o[this.name] = this.value || '';
				}
			});
			return o;
		};
		
		// Pass in our Router module and call it's initialize function
		Router.initialize();
	};

	return { 
		initialize: initialize
	};
});
