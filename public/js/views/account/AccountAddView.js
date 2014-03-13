define([
	'backbone',
	'jqueryvalidate',
	'text!templates/layout/contentTemplate.html',
	'text!templates/account/accountAddTemplate.html',
	'text!templates/account/accountAddressTemplate.html',
	'global',
	'constant',
], function(Backbone, Validate, contentTemplate, accountAddTemplate, accountAddressTemplate, Global, Const){

	var AccountAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			
		},
		
		render: function(){
			var thisObj = this;
			
			var innerTemplateVariables = {
				'account_url' : '#/'+Const.URL.ACCOUNT
			};
			var innerTemplate = _.template(accountAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Add Account",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			$('.form-button-container').show();
			
			this.addAddressFields(null, true);
		},
		
		events: {
			'click #add-address-field' : 'addAddressFields',
			'click .remove-address-fields' : 'removeAddressFields',
		},
		
		addAddressFields: function (ev, isMailing) {
			console.log(isMailing);
			var variables = {};
			
			if(isMailing != null) {
				variables.hide_remove_button = true;
				variables.uneditable_type = true;
			}
				
			
			var addressTemplate = _.template(accountAddressTemplate, variables);
			$('#account-adresses').append(addressTemplate);
		},
		
		removeAddressFields: function (ev) {
			$(ev.target).closest('.address-fields-container').remove();
		},
		
	});

  return AccountAddView;
  
});