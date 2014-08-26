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
			'REPORT': 'report'
			'FILE': '/file',
		},
		'MENU': {
			'PURCHASES': {
				'VIEW'	:1,
				'ADD'	:2,
				'EDIT'	:3,
				'CANCEL':4
			},
			'SALES': {
				'VIEW'	:5,
				'ADD'	:6,
				'EDIT'	:7,
				'CANCEL':8
			},
			'PRODUCTS': {
				'VIEW'	:9,
				'ADD'	:10,
				'EDIT'	:11,
				'DELETE':12
			},
			'CONTACTS': {
				'VIEW'	:13,
				'ADD'	:14,
				'EDIT'	:15,
				'DELETE':16
			},
			'USERS': {
				'VIEW'	:17,
				'ADD'	:18,
				'EDIT'	:19,
				'DELETE':20
			},
			'ROLES': {
				'VIEW'	:21,
				'ADD'	:22,
				'EDIT'	:23,
				'DELETE':24
			},
			'ACCOUNTS': {
				'VIEW'	:25,
				'ADD'	:26,
				'EDIT'	:27,
				'DELETE':28
			},
			'REPORTS': {
				'VIEW'		:29,
			},
			'ADMIN': {
				'VIEW'	:30,
				'TRAIL'	:31
			},
			'STACKLOCATION': {
				'VIEW'	:32,
				'ADD'	:33,
				'EDIT'	:34,
				'DELETE':35
			},
			'TRAILER': {
				'VIEW'	:36,
				'ADD'	:37,
				'EDIT'	:38,
				'DELETE':39
			},
			'SETTINGS': {
				'EDIT'  :40,
			},
			'SCALE': {
				'VIEW'	:41,
				'ADD'	:42,
				'EDIT'	:43,
				'DELETE':44
			},
            'CONTRACT': {
				'VIEW'	:45,
				'ADD'	:46,
				'EDIT'	:47,
				'DELETE':48
			},
			'TRUCKER': {
				'VIEW'	:49,
				'ADD'	:50,
				'EDIT'	:51,
				'DELETE':52
			},
			'INVENTORY': {
				'VIEW'	:53,
				'ADD'	:54,
				'EDIT'	:55,
				'DELETE':56
			},
			'OPERATOR': {
				'GENERATE': 57
			},
			'PRODUCER': {
				'GENERATE': 58
			},
			'TRUCKING': {
				'GENERATE': 59
			},
			'INVENTORY': {
				'GENERATE': 60
			},
			'SALES': {
				'GENERATE': 61
			},
			'COMMISSION': {
				'GENERATE': 62
			},
			'GROSS': {
				'GENERATE': 63
			},
			'DRIVER': {
				'GENERATE': 64
			}
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
		},
        'CONTRACT': {
			'COLLAPSIBLE': {
				'ID': 'contract-list-collapsible-',
			},
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
		'INVENTORY': {
			'LOCATIONFROMREQUIRED': ['transfer','issue'],
			'LOCATIONTOREQUIRED': ['transfer','receipt'],
		},
        'ACCOUNT_TYPE': {
            'LOADER': 3,
            'OPERATOR': 4,
            'TRUCKER': 8,
            'SWFTRUCKER': 9,
        },
        'REPORT': {
        	'OPERATOR': 'operator-pay',
        	'PRODUCER': 'producer',
        	'TRUCKING': 'trucking',
        	'INVENTORY': 'inventory',
        	'SALES': 'sales',
        	'COMMISSION': 'commission',
        	'GROSS': 'gross',
        	'DRIVER': 'driver'
        }
	};
	
	return constant;
});