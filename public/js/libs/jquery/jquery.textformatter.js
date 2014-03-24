(function( $ ){
	$.fn.textFormatter = function(options) {
		
		var settings = $.extend( {
			'event':'blur',
			'type':'capitalize',
		}, options);
		
		return this.each(function() {
			var field = $(this);
			field.on(settings.event, function () {
				var s = field.val();
				
				switch(settings.type) {
					case 'capitalize':
						s = s.replace(/\b[a-z]/g, function(letter) {
							return letter.toUpperCase();
						});
						field.val(s);
						break;
					case 'lowercase':
						s = s.toLowerCase().replace(/\b[a-z]/g, function(letter) {
							return letter.toLowerCase();
						});
						field.val(s);
						break;
					case 'sentence':
						s = s.replace(/\w\S*/g, function(str){
							return str.charAt(0).toUpperCase() + str.substr(1);
						});
					field.val(s);
						break;
					default:
						break;
				}
			});
		});
	};
})( jQuery );