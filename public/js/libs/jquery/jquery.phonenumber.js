(function( $ ){
	
	$.fn.phoneNumber = function(options) {
		
		var settings = $.extend( {
			'divider':'-',
			'dividerPos': new Array(3,7)
		}, options);
		
		return this.each(function() {
			
			var cursorLeftCode = 37;
			var cursorRightCode = 39;
			var backSpaceCode = 8;
			var deleteCode = 46;
			var tabCode = 9;
			
			var firstKeyDown = true;
			var keyDownLoop = false;
			var currentKeyDown = -1;
			var currentKeyUp = -1;
			
			var numberKeys = new Array(48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105);
			
			$(this).keydown(function(event) {
			
				//console.log(event);
				var key = typeof event.which === "undefined" ? event.keyCode : event.which;
				
				if(currentKeyDown < 0)
					currentKeyDown = key;
				
				if(currentKeyDown != key)
					firstKeyDown = true;
				
				if(firstKeyDown) {
					firstKeyDown = false;
				}
				else {
					keyDownLoop = true;
					
					var inputSelection = getInputSelection(this);
					var userMobileCaret = inputSelection.start;
					
					var formattedString = formatCellNumber($(this).val(), settings.dividerPos, settings.divider);
					$(this).val(formattedString);
					
					if(formattedString.charAt(userMobileCaret-1) == settings.divider && numberKeys.indexOf(key) != -1) {
						//console.log(!isNaN(String.fromCharCode(key))+' ******');
						userMobileCaret++;
					}
					
					//console.log('down '+String.fromCharCode(key)+' '+userMobileCaret+' '+key);
					setCaretToPos(this, userMobileCaret);
				}
				
			}).keyup(function (event) {
				
				var key = typeof event.which === "undefined" ? event.keyCode : event.which;
				
				var inputSelection = getInputSelection(this);
				var userMobileCaret = inputSelection.start;
				
				var formattedString = formatCellNumber($(this).val(), settings.dividerPos, settings.divider);
				$(this).val(formattedString);
				
				if(formattedString.charAt(userMobileCaret-1) == settings.divider &&  numberKeys.indexOf(key) != -1) {
					//console.log(!isNaN(String.fromCharCode(key))+' ******');
					userMobileCaret++;
				}
				
				//console.log('up '+String.fromCharCode(key)+' '+userMobileCaret+' '+key);
				setCaretToPos(this, userMobileCaret);
				
				userMobileCaret = -1;
				firstKeyDown = true;
				keyDownLoop = false;
				currentKeyDown = -1;
				
			}).focusout(function () {
				$(this).val(formatCellNumber($(this).val(), settings.dividerPos, settings.divider));
			});
		});
		
	};
	
	function formatCellNumber(str, dashPos, divider) {
		
		var n = str.replace(/[^0-9]/g,'');
		var dash = dashPos;

		var l = n.length;
		
		for(var i = 0; i < dash.length; i++) {
			if(l > dash[i])
				l++;
		}
		
		if(l > n.length) {
		
			var dashIndex = 0;
			var nIndex = 0;
			var tempN = '';
			var nextDashPosition = -1;
			
			for(var i = 0; i < l; i++) {
				
				nextDashPosition = (typeof dash[dashIndex] != 'undefined')? dash[dashIndex] : -1;
				
				if(i != dash[dashIndex]) {
					tempN += ''+n.charAt(nIndex);
					nIndex++;
				}
				else {
					tempN += divider;
					dashIndex++
				}
			}
		
			n = tempN;
		}
		
		return n;
	}

	function getInputSelection(el) {
		var start = 0, end = 0, normalizedValue, range,
			textInputRange, len, endRange;

		if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
			start = el.selectionStart;
			end = el.selectionEnd;
		} else {
			range = document.selection.createRange();

			if (range && range.parentElement() == el) {
				len = el.value.length;
				normalizedValue = el.value.replace(/\r\n/g, "\n");

				// Create a working TextRange that lives only in the input
				textInputRange = el.createTextRange();
				textInputRange.moveToBookmark(range.getBookmark());

				// Check if the start and end of the selection are at the very end
				// of the input, since moveStart/moveEnd doesn't return what we want
				// in those cases
				endRange = el.createTextRange();
				endRange.collapse(false);

				if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
					start = end = len;
				} else {
					start = -textInputRange.moveStart("character", -len);
					start += normalizedValue.slice(0, start).split("\n").length - 1;

					if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
						end = len;
					} else {
						end = -textInputRange.moveEnd("character", -len);
						end += normalizedValue.slice(0, end).split("\n").length - 1;
					}
				}
			}
		}

		return {
			start: start,
			end: end
		};
	}

	function setSelectionRange(input, selectionStart, selectionEnd) {
		if(input.setSelectionRange) {
			input.focus();
			input.setSelectionRange(selectionStart, selectionEnd);
		}
		else if(input.createTextRange) {
			var range = input.createTextRange();
			range.collapse(true);
			range.moveEnd('character', selectionEnd);
			range.moveStart('character', selectionStart);
			range.select();
		}
	}

	function setCaretToPos(input, pos) {
		setSelectionRange(input, pos, pos);
	}
})( jQuery );