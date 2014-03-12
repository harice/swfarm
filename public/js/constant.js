define(function () {
    var constant = {
		'URL': {
			'LOGIN':'login',
			'LOGOUT':'logout',
			'DASHBOARD' : 'dashboard',
			'ADMIN': 'administration',
			'USER': 'administration/user',
			'ROLE': 'administration/role',
			'PERMISSION': 'administration/permission',
			'AUDITTRAIL': 'administration/audittrail',
      'PRODUCT': 'product',
		},
		'MENU': {
			'PURCHASE': {
				'VIEW'	:1,
				'ADD'	:2,
				'EDIT'	:3,
				'DELETE':4
			},
			'SALES': {
				'VIEW'	:5,
				'ADD'	:6,
				'EDIT'	:7,
				'DELETE':8
			},
			'PRODUCT': {
				'VIEW'	:9,
				'ADD'	:10,
				'EDIT'	:11,
				'DELETE':12
			},
			'CONTACT': {
				'VIEW'	:13,
				'ADD'	:14,
				'EDIT'	:15,
				'DELETE':16
			},
			'USER': {
				'VIEW'	:17,
				'ADD'	:18,
				'EDIT'	:19,
				'DELETE':20
			},
			'ROLE': {
				'VIEW'	:21,
				'ADD'	:22,
				'EDIT'	:23,
				'DELETE':24
			}
		},
		'CRUD': {
			'ADD': 'add',
			'EDIT': 'edit',
			'DELETE': 'delete',
		},
		'CONTAINER': {
			'MAIN':'content',
		},
		'MAXITEMPERPAGE': 10,
	};
	
	return constant;
});