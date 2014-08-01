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

		Backbone.View.prototype.helpers = {
			formatDate 			: function(string) { return Backbone.View.prototype.formatDate('m-d-Y',Backbone.View.prototype.strToTime(string)); },
			formatDateBy 		: function(string,format) { return Backbone.View.prototype.formatDate(format,Backbone.View.prototype.strToTime(string)); },
			formatDateAMPM 		: function(string) { return Backbone.View.prototype.formatDate('m-d-Y h:i A',Backbone.View.prototype.strToTime(string)); },
			numberFormat 		: function(number) { return Backbone.View.prototype.numberFormat(number,2,'.',','); },
			numberFormatLbs 	: function(number) { return Backbone.View.prototype.numberFormat(number,2,'.',','); },
			numberFormatTons 	: function(number) { return Backbone.View.prototype.numberFormat(number,4,'.',','); },
			numberFormatBales 	: function(number) { return Backbone.View.prototype.numberFormat(number,0,'.',','); },
			convertLbsToTons 	: function(number) { return Backbone.View.prototype.numberFormat((number * Const.LB2TON),4,'.',','); },
			ucfirst				: function(string) { return Backbone.View.prototype.ucfirst(string); },
			strtolower			: function(string) { return Backbone.View.prototype.strtolower(string); }
		}

		Backbone.View.prototype.strtolower = function strtolower(string) {
			return (string + '').toLowerCase();
		}

		Backbone.View.prototype.ucfirst = function ucfirst(string) {
			string += '';
			var f = string.charAt(0).toUpperCase();
			return f + string.substr(1);
		}

		Backbone.View.prototype.strToTime = function strtotime(text, now) {
			var parsed, match, today, year, date, days, ranges, len, times, regex, i, fail = false;
			if (!text) { return fail; }
			text = text.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ').replace(/[\t\r\n]/g, '').toLowerCase();
			match = text.match(/^(\d{1,4})([\-\.\/\:])(\d{1,2})([\-\.\/\:])(\d{1,4})(?:\s(\d{1,2}):(\d{2})?:?(\d{2})?)?(?:\s([A-Z]+)?)?$/);

			if (match && match[2] === match[4]) { 
				if (match[1] > 1901) { 
					switch (match[2]) { 
						case '-': { if (match[3] > 12 || match[5] > 31) { return fail; } return new Date(match[1], parseInt(match[3], 10) - 1, match[5],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
						case '.': { return fail; }
						case '/': { if (match[3] > 12 || match[5] > 31) { return fail; } return new Date(match[1], parseInt(match[3], 10) - 1, match[5],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
					}
				} else if (match[5] > 1901) {
					switch (match[2]) {
						case '-': { if (match[3] > 12 || match[1] > 31) { return fail; } return new Date(match[5], parseInt(match[3], 10) - 1, match[1],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
						case '.': { if (match[3] > 12 || match[1] > 31) { return fail; } return new Date(match[5], parseInt(match[3], 10) - 1, match[1],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
						case '/': { if (match[1] > 12 || match[3] > 31) { return fail; } return new Date(match[5], parseInt(match[1], 10) - 1, match[3],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
					}
				} else {
					switch (match[2]) {
						case '-': { if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) { return fail; } year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1]; return new Date(year, parseInt(match[3], 10) - 1, match[5],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
						case '.': { if (match[5] >= 70) { if (match[3] > 12 || match[1] > 31) { return fail; } return new Date(match[5], parseInt(match[3], 10) - 1, match[1],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; } if (match[5] < 60 && !match[6]) { if (match[1] > 23 || match[3] > 59) { return fail; } today = new Date(); return new Date(today.getFullYear(), today.getMonth(), today.getDate(),match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000; } return fail; }
						case '/': { if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) { return fail; } year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5]; return new Date(year, parseInt(match[1], 10) - 1, match[3],match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000; }
						case ':': { if (match[1] > 23 || match[3] > 59 || match[5] > 59) { return fail; } today = new Date(); return new Date(today.getFullYear(), today.getMonth(), today.getDate(),match[1] || 0, match[3] || 0, match[5] || 0) / 1000; }
					}
				}
			}

			if (text === 'now') { return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0; }
			if (!isNaN(parsed = Date.parse(text))) { return parsed / 1000 | 0; }

			date = now ? new Date(now * 1000) : new Date();
			days = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };
			ranges = { 'yea': 'FullYear', 'mon': 'Month', 'day': 'Date', 'hou': 'Hours', 'min': 'Minutes', 'sec': 'Seconds' };

			function lastNext(type, range, modifier) {
				var diff, day = days[range];
				if (typeof day !== 'undefined') {
					diff = day - date.getDay();
					if (diff === 0) { diff = 7 * modifier; } 
					else if (diff > 0 && type === 'last') { diff -= 7; } 
					else if (diff < 0 && type === 'next') { diff += 7; }
					
					date.setDate(date.getDate() + diff);
				}
			}

			function process(val) {
				var splt = val.split(' '), type = splt[0], range = splt[1].substring(0, 3), typeIsNumber = /\d+/.test(type), ago = splt[2] === 'ago', num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);
				if (typeIsNumber) { num *= parseInt(type, 10); }
				if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) { return date['set' + ranges[range]](date['get' + ranges[range]]() + num); }
				if (range === 'wee') { return date.setDate(date.getDate() + (num * 7)); }
				if (type === 'next' || type === 'last') { lastNext(type, range, num); } else if (!typeIsNumber) { return false; }
				return true;
			}

			times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' + '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' + '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
			regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';
			match = text.match(new RegExp(regex, 'gi'));
			if (!match) { return fail; }

			for (i = 0, len = match.length; i < len; i++) { if (!process(match[i])) { return fail; } }
			return (date.getTime() / 1000);
		}

		Backbone.View.prototype.formatDate = function date(format, timestamp) {
			var that = this;
			var jsdate, f;
			var txt_words = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			var formatChr = /\\?(.?)/gi;
			var formatChrCb = function(t, s) { return f[t] ? f[t]() : s; };
			var _pad = function(n, c) { n = String(n); while (n.length < c) { n = '0' + n; } return n; };

			f = {
				d: function() { return _pad(f.j(), 2);},
				D: function() { return f.l().slice(0, 3); },
				j: function() { return jsdate.getDate(); },
				l: function() { return txt_words[f.w()] + 'day'; },
				N: function() { return f.w() || 7; },
				S: function() { var j = f.j(); var i = j % 10; if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) { i = 0; } return ['st', 'nd', 'rd'][i - 1] || 'th'; },
				w: function() { return jsdate.getDay(); },
				z: function() { var a = new Date(f.Y(), f.n() - 1, f.j()); var b = new Date(f.Y(), 0, 1); return Math.round((a - b) / 864e5); },
				W: function() { var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3); var b = new Date(a.getFullYear(), 0, 4); return _pad(1 + Math.round((a - b) / 864e5 / 7), 2); },
				F: function() { return txt_words[6 + f.n()]; },
				m: function() { return _pad(f.n(), 2); },
				M: function() { return f.F().slice(0, 3); },
				n: function() { return jsdate.getMonth() + 1; },
				t: function() { return (new Date(f.Y(), f.n(), 0)).getDate(); },
				L: function() { var j = f.Y(); return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0; },
				o: function() { var n = f.n(); var W = f.W(); var Y = f.Y(); return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0); },
				Y: function() { return jsdate.getFullYear(); },
				y: function() { return f.Y().toString().slice(-2); },
				a: function() { return jsdate.getHours() > 11 ? 'pm' : 'am'; },
				A: function() { return f.a().toUpperCase(); },
				B: function() { var H = jsdate.getUTCHours() * 36e2; var i = jsdate.getUTCMinutes() * 60; var s = jsdate.getUTCSeconds(); return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3); },
				g: function() { return f.G() % 12 || 12; },
				G: function() { return jsdate.getHours(); },
				h: function() { return _pad(f.g(), 2); },
				H: function() { return _pad(f.G(), 2); },
				i: function() { return _pad(jsdate.getMinutes(), 2); },
				s: function() { return _pad(jsdate.getSeconds(), 2); },
				u: function() { return _pad(jsdate.getMilliseconds() * 1000, 6); },
				e: function() { throw 'Not supported (see source code of date() for timezone on how to add support)'; },
				I: function() { var a = new Date(f.Y(), 0); var c = Date.UTC(f.Y(), 0); var b = new Date(f.Y(), 6); var d = Date.UTC(f.Y(), 6); return ((a - c) !== (b - d)) ? 1 : 0; },
				O: function() { var tzo = jsdate.getTimezoneOffset(); var a = Math.abs(tzo); return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4); },
				P: function() { var O = f.O(); return (O.substr(0, 3) + ':' + O.substr(3, 2)); },
				T: function() { return 'UTC'; },
				Z: function() { return -jsdate.getTimezoneOffset() * 60; },
				c: function() { return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb); },
				r: function() { return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb); },
				U: function() { return jsdate / 1000 | 0; }
			};

			this.date = function(format, timestamp) { that = this; jsdate = (timestamp === undefined ? new Date() : (timestamp instanceof Date) ? new Date(timestamp) : new Date(timestamp * 1000) ); return format.replace(formatChr, formatChrCb); };
			return this.date(format, timestamp);
		}

		Backbone.View.prototype.numberFormat = function(number, decimals, dec_point, thousands_sep) {
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
			var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,dec = (typeof dec_point === 'undefined') ? '.' : dec_point,s = '', toFixedFix = function(n, prec) { var k = Math.pow(10, prec); return '' + (Math.round(n * k) / k).toFixed(prec); };
			s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3) { s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep); }
			if ((s[1] || '').length < prec) { s[1] = s[1] || ''; s[1] += new Array(prec - s[1].length + 1).join('0'); }
			return s.join(dec);
		}

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
			var responseJSON = null;
			if(typeof data.responseJSON != 'undefined')
				responseJSON = data.responseJSON;
			else
				responseJSON = data;
			
			if(responseJSON.error != 'undefined') {
				var error = responseJSON.error;
				var type = (error == false)? 'success' : 'error';
				var message = type;
				
				if(typeof responseJSON.message != 'undefined')
					message = responseJSON.message;
				
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
