// Filename: app.js
define([ 
	'backbone',
	'bootstrap',
	'router',
	'views/base/AppView',
	'models/session/SessionModel',
	'views/layout/HeaderView',
	'views/layout/SideMenuView',
	'global',
	'constant',
    'throbber'
], function(Backbone, Bootstrap, Router, AppView, SessionModel, HeaderView, SideMenuView, Global, Const){
	var initialize = function(){
		
		var headerView;
		var sideMenu;
		var overrideNavigateAwayFromForm = false;

		Backbone.View.prototype.close = function () {
			this.$el.empty();
			this.unbind();
			this.undelegateEvents();
		};

		Backbone.View.prototype.refreshTitle = function(title,desc) {
			this.headerView = new HeaderView();
			this.headerView.render(title,desc);
		}

		Backbone.View.prototype.refreshHeader = function () {
			this.headerView = new HeaderView();
			this.headerView.render();

			this.sideMenu = new SideMenuView();
			this.sideMenu.render();
		};

		Backbone.View.prototype.showLogin = function () {
			if( this.headerView != null) {
				this.headerView.close();
				this.sideMenu.close();
			}
			$('body').addClass('texture');
			$('.middle-login').show();
			$('#cl-wrapper').addClass('login-container');
			$('.cl-sidebar').hide();
			$('#pcont').hide();
		};

		Backbone.View.prototype.showContent = function () {
			if($('body').hasClass('texture')) {

				Backbone.View.prototype.refreshHeader();

				$('body').removeClass('texture');
				$('.middle-login').hide();
				$('#cl-wrapper').removeAttr('class');
				$('.cl-sidebar').removeAttr('style');
				$('#pcont').removeAttr('style');
			}
		};
		
		Backbone.View.prototype.displayGrowl = function (message, type) {
			if(type == null)
				type = 'info';
				
			$.bootstrapGrowl(message, {
						ele: '#message .message-inner',
						type: type,
						offset: {from: 'bottom'},
						align: 'right',
						width: 'auto',
						delay: 4000
					});
		};
        
        Backbone.View.prototype.displayGritter = function (message, type) {
            if(type == null)
				type = 'info';
            
            $.gritter.removeAll({
                after_close: function(){
                  $.gritter.add({
                    position: 'bottom-right',
                    text: message,
                    class_name: type
                  });
                }
            });
            return false;
            
        };
		
		Backbone.View.prototype.displayMessage = function (data) {
			if(data.error != 'undefined') {
				var error = data.error;
				var type = (error == false)? 'success' : 'error';
				var message = type;
				
				if(typeof data.message != 'undefined')
					message = data.message;
				
				if(typeof message == 'string') {
                    message = '<p>' + message + '</p>';
					this.displayGritter(message, type);
				}
				else 
					alert(message);
			}
		};
        
        Backbone.View.prototype.throbberShow = function (options) {
            $('body').append('<div class="throbber-wrapper"><div class="backdrop"></div><div class="throbber-inner"></div></div>');
            $.throbberShow(options);
        };
        
        Backbone.View.prototype.throbberHide = function () {
            $('.throbber-wrapper').remove();
            $.throbberHide();
        };
        
        Backbone.View.prototype.showFieldThrobber = function (element) {
            $(element).parent().children('.throbber_wrap').show();
        };
        
        Backbone.View.prototype.hideFieldThrobber = function () {
            $('.throbber_wrap').each(function () {
                $(this).hide();
            });
        };
		
		Backbone.View.prototype.nlToBr = function (str) {
			var replaced = '';
			if(str != null && str != '') {
				replaced = str.replace(/\n/g, '<br />');
				//replaced = replaced.replace(/\r/g, '<br />');
			}
			return replaced;
		};
		
		Backbone.View.prototype.toFixedValue = function (field, decimal) {
			var value = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()).toFixed(decimal) : '';
			field.val(value);
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
		
		$.validator.addMethod('require_rfv', function(val, elem) {
			var holdForTestingField = $(elem).closest('tr').find('.ishold')
			return (holdForTestingField.val() == '1' && val == '')? false : true;
		}, $.validator.format("Required if hold for testing"));
		
		$.validator.addMethod('require_reason_others', function(val, elem) {
			var reasonField = $(elem).closest('form').find('#reason');
			return ($(elem).val() == '' && reasonField.val() == Const.CANCELLATIONREASON.OTHERS)? false : true;
		}, $.validator.format("Please supply a reason"));
		
		$('#cl-wrapper').on('click', 'a', function () {
			var a = $(this);
			//console.log('XXX');
			//console.log('id: '+a.attr('id'));
			if((a.attr('href') != '#' && a.attr('href') != '')) {
				//console.log('href: '+a.attr('href'));
				//console.log(Backbone.history.fragment);
				
				var fragment = Backbone.history.fragment;
				var arrayFragment = fragment.split('/');
				var href = a.attr('href');
				var searchFor = '#/';
				var start = href.indexOf(searchFor);
				var url = href.substring(start, href.length);
				//console.log('url: '+url);
				
				if(arrayFragment.indexOf(Const.CRUD.ADD) >= 0 || arrayFragment.indexOf(Const.CRUD.EDIT) >= 0) {
					
					new AppView().showNavigationAwayConfirmationWindow(function () {
						Global.getGlobalVars().app_router.navigate(url, { trigger : true });
					});
					
					return false;
				}
			}
		});
		
		// Pass in our Router module and call it's initialize function
		Router.initialize();
	};

	return { 
		initialize: initialize
	};
});
