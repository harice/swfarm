define([
	'backbone',
	'text!templates/layout/confirmModalTemplate.html',
	'text!templates/layout/confirmNavigateAwayFromFormModalTemplate.html',
	'text!templates/layout/confirmModalWithFormTemplate.html',
	'text!templates/layout/attachPDFTemplate.html',
	'constant',
], function(Backbone, confirmModalTemplate, confirmNavigateAwayFromFormModalTemplate, confirmModalWithFormTemplate, attachPDFTemplate, Const){

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
			if($('.modal-alert-cont').find('#modal-confirm').length)
				$('.modal-alert-cont').find('#modal-confirm').remove();
			
			var confirmTemplateVariables = {
				confirm_content: content,
				confirm_button_id: buttonId,
				confirm_button_label: buttonLabel,
			};
			
			var confirmTemplate = _.template(confirmModalTemplate, confirmTemplateVariables);
			this.$el.find('.modal-alert-cont').append(confirmTemplate);
		},
		
		initConfirmationWindowWithForm: function (content, buttonId, buttonLabel, contentForm) {
			if($('.modal-alert-cont').find('#modal-with-form-confirm').length)
				$('.modal-alert-cont').find('#modal-with-form-confirm').remove();
			
			var confirmTemplateVariables = {
				confirm_content: content,
				confirm_button_id: buttonId,
				confirm_button_label: buttonLabel,
				confirm_content_form: contentForm,
			};
			
			var confirmTemplate = _.template(confirmModalWithFormTemplate, confirmTemplateVariables);
			this.$el.find('.modal-alert-cont').append(confirmTemplate);
		},
		
		initAttachPDFWindow: function () {
			var confirmTemplate = _.template(attachPDFTemplate, {});
			this.$el.find('.modal-alert-cont').append(confirmTemplate);
		},
		
		disableCloseButton: function (id) {
			console.log('disableCloseButton: '+id);
			this.$el.find('#'+id+' .close-window').attr('disabled', true);
		},
		
		enableCloseButton: function (id) {
			this.$el.find('#'+id+' .close-window').attr('disabled', false);
		},
		
		showConfirmationWindow: function (id) {
			
			if(id == null)
				id = 'modal-confirm';
				
			$('#'+id).modal('show');
			
			return false;
		},
		
		hideConfirmationWindow: function (id) {
			
			if(id == null)
				id = 'modal-confirm';
			
			$('#'+id).modal('hide');
			
			return false;
		},
		
		showNavigationAwayConfirmationWindow: function (callback) {
			//console.log('showNavigationAwayConfirmationWindow');
			var runCallback = false;
			
			if($('.modal-alert-cont').find('#modal-confirm-navigate-away').length)
				$('.modal-alert-cont').find('#modal-confirm-navigate-away').remove();
			
			var confirmTemplate = _.template(confirmNavigateAwayFromFormModalTemplate, {});
			$('.modal-alert-cont').append(confirmTemplate);
			
			$('#confirm-navigate').on('click', function () {
				runCallback = true;
			});
			
			$('#modal-confirm-navigate-away').on('hidden.bs.modal', function (e) {
				$('.close-navigate-away-window').off('click');
				$('#confirm-navigate').off('click');
				$('#modal-confirm-navigate-away').remove();
				
				if(runCallback)
					callback();
			});
			
			$('#modal-confirm-navigate-away').modal('show');
			return false;
		},
		
		goToPreviousPage: function () {
			var fragment = Backbone.history.fragment;
			var arrayFragment = fragment.split('/');
			
			if(arrayFragment.indexOf(Const.CRUD.ADD) >= 0 || arrayFragment.indexOf(Const.CRUD.EDIT) >= 0) {
					
				new AppView().showNavigationAwayConfirmationWindow(function () {
					Backbone.history.history.back();
				});
			}
			else
				Backbone.history.history.back();
			
			return false;
		},
		
        maskInputs: function () {
            $(".phone-number").mask('(000) 000-0000');
            $(".mobile-number").mask('(000) 000-0000');
            
            /*$(".mask-unitprice").mask('##0.00', {reverse: true});
            $(".mask-tons").mask("#,##0.00##", {reverse: true});
            $(".mask-bales").mask('###,##0', {reverse: true});
            $(".mask-totalprice").mask('###,###,##0.00', {reverse: true});
            
            //$(".mask-fee").mask('##0.00', {reverse: true});
			$(".mask-fee").mask('#,##0.99', {reverse: true, maxlength: false});
            $(".mask-distance").mask('##0.00', {reverse: true});*/
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
			if(typeof number !== 'string')
				number = number.toString();
			
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
			if(typeof number !== 'string')
				number = number.toString();
				
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
		},
                
        showFieldThrobber: function (element) {
            $(element).parent().children('.throbber_wrap').show();
        },
        
        hideFieldThrobber: function (element) {
            if (typeof element !== "undefined") {
                $(element).parent().children('.throbber_wrap').show();
            } else {
                $('.throbber_wrap').each(function () {
                    $(this).hide();
                });
            }
        }
	});

	return AppView;
  
});