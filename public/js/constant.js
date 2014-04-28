define(function () {
    var constant = {
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
            'WEIGHTINFO': 'purchases/weightinfo',
			'SO': 'sales/so',
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
			}
		},
		'CRUD': {
			'ADD': 'add',
			'EDIT': 'edit',
			'DELETE': 'delete',
		},
		'CONTAINER': {
			'MAIN':'cl-mcont',
		},
		'MAXITEMPERPAGE': 10,
		'PLACEHOLDER': {
			'PROFILEPIC': '/images/default_profile.jpg',
		},
		'MULTIPLEADDRESS': ['Producer', 'Customer'],
		'PO': {
			'PICKUPSCHEDULE': {
				'EDITABLERATE': {
					'ACCOUNTTYPE': ['Hauler'],
				},
			},
		},
	};
	
	return constant;
});