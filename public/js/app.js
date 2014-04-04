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
			this.undelegateEvents();
		};
		
		Backbone.View.prototype.displayGrowl = function (message, type) {
			if(type == null)
				type = 'info';
				
			$.bootstrapGrowl(message, {
						ele: '#message',
						type: type,
						offset: {from: 'bottom'},
						align: 'right',
						width: 'auto',
						delay: 4000
					});
		};
		
		Backbone.View.prototype.displayMessage = function (data) {
			if(data.error != 'undefined') {
				var error = data.error;
				var type = (error == false)? 'success' : 'error';
				var message = type;
				
				if(typeof data.message != 'undefined')
					message = data.message;
				
				if(typeof message == 'string') {
					this.displayGrowl(message, type);
				}
				else 
					alert(message);
			}
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
		
		$.validator.addMethod('complete_url', function(val, elem) {
			// if no url, don't do anything
			if (val.length == 0) { return true; }

			// if user has not entered http:// https:// or ftp:// assume they mean http://
			if(!/^(https?|ftp):\/\//i.test(val)) {
				val = 'http://'+val; // set both the value
				//$(elem).val(val); // also update the form element
			}
			// now check if valid url
			// http://docs.jquery.com/Plugins/Validation/Methods/url
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&amp;'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&amp;'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&amp;'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&amp;'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&amp;'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(val);
		});
		
		$.validator.addMethod('valid_zipcode', function(val, elem) {
			var cityField = $(elem).closest('.address-fields-container').find('.city');
			var strZipCodes = cityField.attr('data-zipcodes');
			var arrZipCodes = strZipCodes.split(',');
			return (arrZipCodes.indexOf(val) > -1)? true : false;
		}, $.validator.format("Invalid zip code for the selected city"));
		
		// Pass in our Router module and call it's initialize function
		Router.initialize();
	};

	return { 
		initialize: initialize
	};
});
