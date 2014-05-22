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
            $("#freight_rate").mask('0,000.00', {reverse: true});
            $(".unitprice").mask('0,000.00', {reverse: true});
            $(".tons").mask('0,000.00', {reverse: true});
            $(".bales").mask('000', {reverse: true});
            $(".unit-price").mask('000,000.00', {reverse: true});
        },
	});

	return AppView;
  
});