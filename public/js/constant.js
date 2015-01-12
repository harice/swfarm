define(function () {
    var constant = {
		'GOOGLEMAPSAPIKEY': 'AIzaSyAyTqNUdaMOVp8vYoyheHK4_Hk6ZkUb9Ow',
    	'SU': 1,
		'URL': {
			'LOGIN':'login',
			'LOGOUT':'logout',
			'DASHBOARD' : 'dashboard',
			'ADMIN': 'administration',
			'USER': 'administration/user',
			'ROLE': 'administration/role',
			'PERMISSION': 'administration/permission',
			'AUDITTRAIL': 'administration/audittrail',
			'PROFILE' : 'profile',
			'ACCOUNT' : 'account',
            'CONTACT' : 'contact',
			'PRODUCT': 'product',
			'BID': 'purchases/bid',
			'PO': 'purchases/po',
			'PICKUPSCHEDULE': 'purchases/pickupschedule',
            'POWEIGHTINFO': 'purchases/weightinfo',
			'SO': 'sales/so',
			'DELIVERYSCHEDULE': 'sales/deliveryschedule',
			'SOWEIGHTINFO': 'sales/weightinfo',
            'CONTRACT': 'contract',
			'STACKLOCATION': 'administration/stack',
			'TRAILER': 'administration/trailer',
			'SETTINGS': 'administration/settings',
			'SCALE': 'administration/scale',
			'TRUCKER': 'administration/trucker',
			'INVENTORY': 'inventory',
			'STACKNUMBER': 'stacknumber',
			'REPORT': 'report',
			'FILE': '/file',
			'COMMISSION': 'administration/commission',
			'PAYMENT': 'payment',
			'DELIVERYLOCATION': 'administration/delivery',
		},
		'MENU': {
			'PURCHASES': {
				'VIEW'	:1,
				'ADD'	:2,
				'EDIT'	:3,
				'CANCEL':4,
				'CLOSE': 5,
			},
			'SALES': {
				'VIEW'	:6,
				'ADD'	:7,
				'EDIT'	:8,
				'CANCEL':9,
				'CLOSE':10
			},
			'PRODUCTS': {
				'VIEW'	:11,
				'ADD'	:12,
				'EDIT'	:13,
				'DELETE':14
			},
			'CONTACTS': {
				'VIEW'	:15,
				'ADD'	:16,
				'EDIT'	:17,
				'DELETE':18
			},
			'USERS': {
				'VIEW'	:19,
				'ADD'	:20,
				'EDIT'	:21,
				'DELETE':22
			},
			'ROLES': {
				'VIEW'	:23,
				'ADD'	:24,
				'EDIT'	:25,
				'DELETE':26
			},
			'ACCOUNTS': {
				'VIEW'	:27,
				'ADD'	:28,
				'EDIT'	:29,
				'DELETE':30
			},
			'REPORTS': {
				'GENERATE':31,
			},
			'ADMIN': {
				'VIEW'	:33,
				'TRAIL'	:34
			},
			'CONTRACT': {
				'VIEW'	:35,
				'ADD'	:36,
				'EDIT'	:37,
				'DELETE':38
			},
			'SETTINGS': {
				'VIEW'	:39,
			},
			'LOGISTICS': {
				'VIEWSCHEDULE':43,
				'ADDSCHEDULE':44,
				'EDITSCHEDULE'45,
				'DELETESCHEDULE':46,
				'VIEWWEIGHTINFO': 47,
				'ADDWEIGHTINFO':48,
				'EDITWEIGHTINFO':49,
				'CLOSEWEIGHTINFO':50
			},
			'INVENTORY': {
				'ADD'	:51,
				'VIEW'	:52,			
			},
			'STACKLOCATION': {
				'VIEW'	:53,
				'ADD'	:54,
				'EDIT'	:55,
				'DELETE':56
			},
			'DELIVERYLOCATION': {
				'VIEW'	:57,
				'ADD'	:58,
				'EDIT'	:59,
				'DELETE':60
			},
			'TRAILER': {
				'VIEW'	:61,
				'ADD'	:62,
				'EDIT'	:63,
				'DELETE':64
			},
			'TRUCKER': {
				'VIEW'	:65,
				'ADD'	:66,
				'EDIT'	:67,
				'DELETE':68
			},
			'SCALE': {
				'VIEW'	:69,
				'ADD'	:70,
				'EDIT'	:71,
				'DELETE':72
			},  
			'PAYMENTS': {
				'VIEW'	:73,
				'ADD'	:74,
				'EDIT'	:75,
				'DELETE':76,
			},	
			'COMMISSION': {
				'VIEW'	:77,
				'ADD'	:78,
				'EDIT'	:79,
				'DELETE':80
			}, 					         											
		},
		'CRUD': {
			'ADD': 'add',
			'EDIT': 'edit',
			'DELETE': 'delete',
            'PRINT': 'print',
            'MAIL': 'mail'
		},
		'CONTAINER': {
			'MAIN':'cl-mcont',
		},
		'MAXITEMPERPAGE': 15,
		'PLACEHOLDER': {
			'PROFILEPIC': '/images/default_profile.jpg',
		},
		'ACCOUNT': {
			'MULTIPLEADDRESS': ['Producer', 'Customer'],
			'UNIQUEADDRESS': {
				'PRODUCER': 'Stack Address',
				'CUSTOMER': 'Delivery Address',
			},
			'TRUCKERS': {
				'HAULER': 2,
				'OPERATOR': 4,	           
	            'SWFTRUCKER': 9,
			},
			'ADMIN': {
				'WAREHOUSE': 10,
				'TRAILER': 7,
				'TRUCKER': 9,
				'SCALE': 6
			}
		},
		'PO': {
			'PICKUPSCHEDULE': {
				'EDITABLERATE': {
					'ACCOUNTTYPE': ['hauler', 'operator'],
				},
			},
			'COLLAPSIBLE': {
				'ID': 'order-list-collapsible-',
			},
			'DESTINATION': {
				'SWFARMS': '1',
				'PRODUCER': '2',
				'DROPSHIP': '3',
			},
		},
		'SO': {
			'NATUREOFSALES': {
				'WITHCONTRACT': 1,
			},
			'COLLAPSIBLE': {
				'ID': 'order-list-collapsible-',
			},
		},
		'PAYMENT': {
			'COLLAPSIBLE': {
				'ID': 'payment-list-collapsible-',
			},
			'CANCEL': 'cancel',
		},
        'CONTRACT': {
			'COLLAPSIBLE': {
				'ID': 'contract-list-collapsible-',
			},
		},
		'STACKLOCATION': {
			'COLLAPSIBLE': {
				'ID': 'stacklocation-list-collapsible-',
			},
		},
		'DELIVERYLOCATION': {
			'COLLAPSIBLE': {
				'ID': 'deliverylocation-list-collapsible-',
			},
		},
		'COMMISSION': {
			'COLLAPSIBLE': {
				'ID': 'commission-list-collapsible-',
			},
			'TYPE': [
				{id:1, name: 'Flat Rate'},
				{id:2, name: 'Per Ton Rate'},
			],
			'COLUMNIDPRE': 'commission_type_',
			'WEIGHTTICKETBYUSERID': 'weight-ticket-by-user-',
		},
		'LB2TON': 0.0005,
		'CANCELLATIONREASON': {
			'OTHERS': '6'
		},
		'MIMETYPE': {
			'PDF': 'application/pdf',
		},
		'WEIGHTINFO':{
			'PICKUP' : 'pickup',
			'DROPOFF' : 'dropoff',
		},
		'STATUS': {
			'OPEN' : 'open',
			'CLOSED' : 'closed',
			'CANCELLED' : 'cancelled',
			'PENDING' : 'pending',
			'BIDCANCELLED' : 'bid cancelled',
			'POCANCELLED' : 'po cancelled',
			'TESTING' : 'testing',
		},
		'STATUSID': {
			'OPEN' : 1,
			'CLOSED' : 2,
			'CANCELLED' : 3,
			'PENDING' : 4,
			'BIDCANCELLED' : 5,
			'POCANCELLED' : 6,
			'TESTING' : 7,
		},
		'INVENTORY': {
			'LOCATIONFROMREQUIRED': ['transfer','issue'],
			'LOCATIONTOREQUIRED': ['transfer','receipt'],
			'TYPE': {
				'TRANSFER': 3,
				'ISSUE': 4,
				'RECEIPT': 5,
			},
		},
        'ACCOUNT_TYPE': {
            'LOADER': 3,
            'OPERATOR': 4,
            'TRUCKER': 8,
            'SWFTRUCKER': 9,
        },
		'GRAPH': {
			'TYPE': {
				'BAR': 1,
				'STACKEDBAR': 2,
				'MAP': 3,
				'LOGISTICS': 4,
				'SUMMARY': 5,
			},
			'ID':{
				'PURCHASEINTONS': 1,
				'PURCHASEINDOLLARS': 2,
				'SALESINTONS': 3,
				'SALESINDOLLARS': 4,
				'RESERVECUSTOMERS': 5,
				'INVENTORY': 6,
				'YEARTODATESALES': 7,
				'DASHBOARDPURCHASES': 8,
				'DASHBOARDSALES': 9,
				'DASHBOARDLOGISTICS': 10,
				'LOGISTICSSUMMARY': 11
			}
		},
	};
	
	return constant;
});