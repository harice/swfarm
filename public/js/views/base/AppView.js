define([
	'backbone',
	'text!templates/layout/confirmModalTemplate.html',
	'constant',
], function(Backbone, confirmModalTemplate, Const){

	var AppView = Backbone.View.extend({
		
		dateFormat: 'mm-dd-yyyy',
		dateFormatDB: 'yyyy-mm-dd',
		
		initSubContainer: function () {
			this.timestamp = new Date().getTime();
			this.$el.html('<div id="'+this.timestamp+'"></div>');
			this.subContainer = this.$el.find('#'+this.timestamp);
		},
		
		subContainerExist: function () {
			var subContainer = this.$el.find('#'+this.timestamp);
			if(subContainer.length > 0)
				return true;
			else
				return false;
		},
		
		focusOnFirstField: function () {
			this.$el.find('form:first *:input[type!=hidden]:first').focus();
		},
		
		toFixedValue: function (field, decimal) {
			var value = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()).toFixed(decimal) : '';
			field.val(value);
		},
		
		toFixedValueWithComma: function (field, decimal) {
			var value = this.removeCommaFromNumber(field.val());
			value = value.toFixed(decimal);
			value = this.addCommaToNumber(value);
			field.val(value);
		},
		
		convertDateFormat: function (date, oldFormat, newFormat, separator) {
			arrFormattedDate = [];
			
			arrDate = date.split(separator);
			arrOldFormat = oldFormat.split(separator);
			arrNewFormat = newFormat.split(separator);
			
			for(var i = 0; i < arrNewFormat.length; i++) {
				arrFormattedDate.push(arrDate[arrOldFormat.indexOf(arrNewFormat[i])]);
			}
			
			return arrFormattedDate.join(separator);
		},
		
		initConfirmationWindow: function (content, buttonId, buttonLabel) {
			var confirmTemplateVariables = {
				confirm_content: content,
				confirm_button_id: buttonId,
				confirm_button_label: buttonLabel,
			};
			var confirmTemplate = _.template(confirmModalTemplate, confirmTemplateVariables);
			this.$el.find('.modal-alert-cont').html(confirmTemplate);
		},
		
		showConfirmationWindow: function () {
			$('#modal-confirm').modal('show');
			
			return false;
		},
		
		goToPreviousPage: function () {
			Backbone.history.history.back();
			return false;
		},
                
        maskInputs: function () {
            $(".phone-number").mask('(000) 000-0000');
            $(".mobile-number").mask('(000) 000-0000');
            
            $(".mask-unitprice").mask('##0.00', {reverse: true});
            $(".mask-tons").mask("#,##0.00##", {reverse: true});
            $(".mask-bales").mask('###,##0', {reverse: true});
            $(".mask-totalprice").mask('###,###,##0.00', {reverse: true});
            
            //$(".mask-fee").mask('##0.00', {reverse: true});
			$(".mask-fee").mask('#,##0.99', {reverse: true, maxlength: false});
            $(".mask-distance").mask('##0.00', {reverse: true});
        },
		
		formatMoney: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
		},
		
		onBlurMoney: function (ev) {
			this.toFixedValueWithComma($(ev.target), 2);
		},
		
		formatTon: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
		},
		
		onBlurTon: function (ev) {
			this.toFixedValueWithComma($(ev.target), 4);
		},
		
		onBlurPound: function (ev) {
			this.toFixedValueWithComma($(ev.target), 2);
		},
		
		formatNumber: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target);
		},
		
		fieldAddCommaToNumber: function (number, element, dLimit) {
			var caretPosOriginal = element.selectionStart;
			var numberLengthOriginal = number.length;
			
			var formatted = this.addCommaToNumber(number, dLimit);
			
			$(element).val(formatted);
			this.setCaretToPos(element, caretPosOriginal + (formatted.length - numberLengthOriginal));
		},
		
		addCommaToNumber: function (number, dLimit) {
			var negative = false;
			if(number.charAt(0) == '-') {
				negative = true;
				number = number.substr(1, number.length - 1);
			}
			
			var formatted = '';
			var splitNumber = number.split('.');
			
			for(var i = 0; i < splitNumber.length; i++)
				splitNumber[i] = splitNumber[i].replace(/[^0-9]/g,'');
			
			if(splitNumber.length > 1) {
				if(dLimit != null && splitNumber[1].length > dLimit)
					splitNumber[1] = splitNumber[1].substr(0, dLimit);
			}
			
			var temp = '';
			var ctr = 0;
			for(var i = splitNumber[0].length - 1; i >= 0; i--) {
				if(ctr == 3) {
					ctr = 1;
					temp = ','+temp;
				}
				else
					ctr++;
					
				temp = splitNumber[0].charAt(i) + temp;
			}
			splitNumber[0] = temp;
			
			formatted = (splitNumber.length > 1)? splitNumber[0]+'.'+splitNumber[1]: splitNumber[0];
			
			if(negative)
				formatted = '-'+formatted
			
			return formatted;
		},
		
		removeCommaFromNumber: function (number) {
			return parseFloat(number.replace(/,/g,''));
		},
		
		//caret functions
		setSelectionRange: function (input, selectionStart, selectionEnd) {
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
		},

		setCaretToPos: function (input, pos) {
			this.setSelectionRange(input, pos, pos);
		}
	});

	return AppView;
  
});