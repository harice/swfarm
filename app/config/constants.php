<?php

//constant variables
return array(

    'GLOBAL_PER_LIST' => 15,
    'USERS_PER_LIST' => 15, //default of number of user displays in list
    'ROLES_PER_LIST' => 15,  ////default of number of roles displays in list
    'AUDIT' => array('Roles', 'User', 'Permission', 'Product', 'Contact', 'Account', 'Order'),
    'AUDIT_EVENTS' => array('created', 'updated', 'deleted'),
    'AUDIT_CREATED' => 'Created',
    'AUDIT_UPDATED' => 'Updated',
    'AUDIT_DELETED' => 'Deleted',

    'TRUCKING_RATE' => 2.00,
    
    'NOS_RESERVED' => 1,

    'LOCATION_DROPSHIP' => 3,
    'LOCATION_PRODUCER' => 2,

    'STATUS_OPEN' => 1,
    'STATUS_CLOSED' => 2,
    'STATUS_CANCELLED' => 3,
    'STATUS_PENDING' => 4,
    'STATUS_BIDCANCELLED' => 5,
    'STATUS_POCANCELLED' => 6,
    'STATUS_TESTING' => 7,

    'ORDERTYPE_PO' => 1,
    'ORDERTYPE_SO' => 2,

    'GRAPH_PURCHASE_IN_TONS' => 1,
    'GRAPH_PURCHASE_IN_DOLLAR_VALUES' => 2,
    'GRAPH_SALES_IN_TONS' => 3,
    'GRAPH_SALES_IN_DOLLAR_VALUES' => 4,
    'GRAPH_CUSTOMER_ORDER_VS_DELIVERED' => 5,
    'GRAPH_INVENTORY_PRODUCT_ON_HAND' => 6,
    'GRAPH_YEAR_TO_DATE_SALES' => 7,
    'DASHBOARD_MAP_PRODUCER' => 8,
    'DASHBOARD_MAP_CUSTOMER' => 9,
    'DASHBOARD_LOGISTICS_MAP' => 10,

    'GRAPH_TYPE_1' => 1, //bar graph
    'GRAPH_TYPE_2' => 2, //double bar graph
    'GRAPH_TYPE_3' => 3, //map with ballons
    'GRAPH_TYPE_4' => 4, //map with ballons with route

    'NATUREOFSALES_RESERVATION' => 1,
    'NATUREOFSALES_INCOMING' => 2,
    'NATUREOFSALES_OUTGOING' => 3,

    'COMMISSION_TYPE_FLATRATE' => 1,
    'COMMISSION_TYPE_PERTONRATE' => 2,

    'REPORT_COMMISSION' => 1,
    'REPORT_CUSTOMER' => 2,
    'REPORT_DRIVER' => 3,
    'REPORT_GROSS_PROFIT' => 4,
    'REPORT_INVENTORY' => 5,
    'REPORT_OPERATOR' => 6,
    'REPORT_PRODUCER' => 7,
    'REPORT_TRUCKING' => 8,

    'ACCOUNTTYPE_CUSTOMER' => 1,
    'ACCOUNTTYPE_OPERATOR' => 4,
    'ACCOUNTTYPE_PRODUCER' => 5,

    'TRANSACTIONTYPE_SO' => 1,
    'TRANSACTIONTYPE_PO' => 2,
    'TRANSACTIONTYPE_TRANSFER' => 3,
    'TRANSACTIONTYPE_ISSUE' => 4,
    'TRANSACTIONTYPE_RECEIPT' => 5,

    'ADDRESSTYPE_BUSINESS' => 1,
    'ADDRESSTYPE_MAILING' => 2,
    'ADDRESSTYPE_STACK' => 3,
    'ADDRESSTYPE_DELIVERY' => 4,


    'VERSION' => "3.0"

);