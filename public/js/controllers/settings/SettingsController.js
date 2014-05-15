define([
	'backbone',
	'views/settings/SettingsEditView',
], function(Backbone, SettingsEditView){
	
	function SettingsController () {	
		
		this.setAction = function () {
			return this.edit();
		};
		
		this.edit = function () {
			return new SettingsEditView();
		};
	};

	return SettingsController;
});
