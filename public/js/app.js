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
        
//        Backbone.View.prototype.displayMessage = function (msg, type) {
//            switch(type)
//            {
//                case 'success':
//                    $.bootstrapGrowl(msg, {
//                        ele: 'body',
//                        type: 'success',
//                        offset: {from: 'bottom'},
//                        align: 'right',
//                        width: 'auto',
//                        delay: 4000
//                    });
//                case 'error':
//                    $.bootstrapGrowl(msg, {
//                        ele: 'body',
//                        type: 'error',
//                        offset: {from: 'bottom'},
//                        align: 'right',
//                        width: 'auto',
//                        delay: 4000
//                    });
//                default:
//                    $.bootstrapGrowl(msg, {
//                        ele: 'body',
//                        type: 'info',
//                        offset: {from: 'bottom'},
//                        align: 'right',
//                        width: 'auto',
//                        delay: 4000
//                    });
//            }
//		};
		
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
