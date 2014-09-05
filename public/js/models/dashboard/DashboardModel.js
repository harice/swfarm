define([
	'backbone',
	'global',
	'constant',
], function(Backbone, Global, Const) {

	var DashboardModel = Backbone.Model.extend({
		
		urlRoot: '',
		defaults: {
			reports: [
				{
					graphname: "Total Purchases Tons",
					settings: {
						currency:false,
						type: "bar"
					},
					data: [{
						data: [
							[0, 1000],
							[1, 50],
							[2, 140],
							[3, 350],
							[4, 600],
							[5, 800],
							[6, 990]
						],
						yPositionAdjustLabel: -10,
					}],
					xData: [
						[0, "Alfalfa"],
						[1, "Bermuda"],
						[2, "Cow Hay"],
						[3, "Oat Hay"],
						[4, "Sudan Hay"],
						[5, "Timothy Hay"],
						[6, "Wheat Hay"]
					]
				},
				{
					graphname: "Total Purchases Dollars",
					settings: {
						currency: true,
						type: "bar"
					},
					data: [{
						data: [
							[0, 1000],
							[1, 50],
							[2, 140],
							[3, 350],
							[4, 600],
							[5, 800],
							[6, 990]
						],
						yPositionAdjustLabel: -10,
					}],
					xData: [
						[0, "Alfalfa"],
						[1, "Bermuda"],
						[2, "Cow Hay"],
						[3, "Oat Hay"],
						[4, "Sudan Hay"],
						[5, "Timothy Hay"],
						[6, "Wheat Hay"]
					]
				},
				{
					graphname: "Reserve Customers Dashboard",
					settings: {
						currency: false,
						type: "stackedbar"
					},
					data: [						
						{
							label: 'delivered', 
							data: [
								[1, 600],
								[2, 40],
								[3, 560],
								[4, 550],
								[5, 770],
								[6, 940],
								[7, 980],
								[8, 440],
								[9, 350],
								[10, 750]

							]
						},	
						{
							label: 'balance',
							data: [
								[1, 400],
								[2, 460],
								[3, 290],
								[4, 30],
								[5, 80],
								[6, 10],
								[7, 10],
								[8, 10],
								[9, 10],
								[10,10]
							],
							yPositionAdjustLabel: -10,
						},			
					],
					xData: [
						[1, "A & Farms"],
						[2, "Aztec Dairy"],
						[3, "Al-Marah Arabians"],
						[4, "Bart Carter"],
						[5, "D & R Farms"],
						[6, "Del Rio Dairy"],
						[7, "Eastwind Dairy"],
						[8, "Flagstaff Riding Center LLC"],
						[9, "Gas-N-Grub LLC"],
						[10, "Haringa Farms"]
					]
				},
			]
        },

		runFetch: function () {
			var thisObj = this;            
						
			this.fetch({
				success: function(model, response, options) {
					if(typeof response.error != 'undefined') {
						Global.getGlobalVars().app_router.navigate(Const.URL.DASHBOARD, {trigger: true});
					}
				},
				error: function(model, response, options) {
					
				},
				headers: thisObj.getAuth(),
			});
			
		},


		fetchTotalPurchase: function (){
			this.urlRoot = '';
        	this.runFetch();
		}
	});

	return DashboardModel;

});