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
			'FILE': '/file',
			'COMMISSION': 'administration/commission',
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
				'GENERATE'	:30
			},
			'ADMIN': {
				'VIEW'	:31,
				'TRAIL'	:32
			},
			'STACKLOCATION': {
				'VIEW'	:33,
				'ADD'	:34,
				'EDIT'	:35,
				'DELETE':36
			},
			'TRAILER': {
				'VIEW'	:37,
				'ADD'	:38,
				'EDIT'	:39,
				'DELETE':40
			},
			'SETTINGS': {
				'EDIT'  :41,
			},
			'SCALE': {
				'VIEW'	:42,
				'ADD'	:43,
				'EDIT'	:44,
				'DELETE':45
			},
            'CONTRACT': {
				'VIEW'	:46,
				'ADD'	:47,
				'EDIT'	:48,
				'DELETE':49
			},
			'TRUCKER': {
				'VIEW'	:50,
				'ADD'	:51,
				'EDIT'	:52,
				'DELETE':53
			},
			'INVENTORY': {
				'VIEW'	:54,
				'ADD'	:55,
				'EDIT'	:56,
				'DELETE':57
			},
			'COMMISSION': {
				'VIEW'	:58,
				'ADD'	:59,
				'EDIT'	:60,
				'DELETE':61
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
		'COMMISSION': {
			'COLLAPSIBLE': {
				'ID': 'commission-list-collapsible-',
			},
			'TYPE': [
				{id:1, name: 'Flat Rate'},
				{id:2, name: 'Per Ton Rate'},
			],
			'COLUMNIDPRE': 'commission_type_',
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
		},
        'ACCOUNT_TYPE': {
            'LOADER': 3,
            'OPERATOR': 4,
            'TRUCKER': 8,
            'SWFTRUCKER': 9
        }
	};
	
	return constant;
});