<?php

/**
 * Description of PaymentRepository
 *
 * @author Avs
 */
class PaymentRepository implements PaymentRepositoryInterface {
    
    public function findAll($params)
    {
       
    }

    public function paymentListOfOrder($orderId){
        //$perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby   = isset($params['sortby']) ? $params['sortby'] : 'created_at';
        $orderby  = isset($params['orderby']) ? $params['orderby'] : 'desc';
        // $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
       
 
        $payment = Payment::with('account')->where('order_id', '=', $orderId);
     
        $payment = $payment->orderBy($sortby, $orderby)->get();
        //$payment = $payment->paginate($perPage);

        return $payment->toArray();
    }
   
    public function findById($id)
    {
        $payment = Payment::with('account')->with(array('order' => function($query){
                                $query->addSelect(array('id', 'order_number'));
                            }))
                            ->find($id);
        
        if (!$payment) {
            return array(
                'error' => true,
                'message' => 'Commission not found.'
                );
        }
        
        return $payment->toArray();
      
    }

    private function generateTransactionNumber(){ 
        $prefix = 'T';
        $dateToday = date('Y-m-d');
        $count = Payment::where('created_at', 'like', $dateToday.'%')->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    public function store($data)
    {
        $data['transactionnumber'] = $this->generateTransactionNumber();
        $this->validate($data, 'Payment');

        $payment = new Payment;
        $payment->fill($data);
        
        if (!$payment->save()) {
            $response = array(
                'error' => true,
                'message' => 'Payment was not created.'
            );
        } else {
             $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Payment'))
            );
        }
        
       return $response;
        
    }

    public function update($id, $data)
    {
        $payment = Payment::find($id);
        if(!is_object($payment)){
            return array(
                'error' => true,
                'message' => 'Payment not found.'
            );
        }
        
        $data['transactionnumber'] = $payment->transactionnumber;

        $this->validate($data, 'Payment');
        $payment->fill($data);
        
        if(!$payment->save()) {
            $response = array(
                'error' => true,
                'message' => 'Payment was not updated.'
            );
        } else {
             $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Payment'))
            );
        }
        
       return $response;
    }
    
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment->delete()) {
            return array(
                'error' => true,
                'message' => 'Payment was not deleted.'
            );
        }

        $response = array(
            'error' => false,
            'message' => Lang::get('messages.success.deleted', array('entity' => 'Payment'))
        );
        
        return $response;
    }
    
    public function validate($data, $entity)
    {
        $validator = Validator::make($data, $entity::$rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Payment($data);
    }

    public function getAllPurchaseOrderList(){
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby   = isset($params['sortby']) ? $params['sortby'] : 'created_at';
        $orderby  = isset($params['orderby']) ? $params['orderby'] : 'desc';
        $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
        $ordertype = isset($params['type']) ? $params['type'] : Config::get('constants.ORDERTYPE_PO');
       
        $order = Order::with(array('payment' => function($query){
                            $query->addSelect(array('id', 'order_id', 'transactionnumber', 'amount'));
                        }))
                        ->with('account')->with('status')->where('ordertype', '=', $ordertype) 
                        ->whereIn('status_id', array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_CLOSED'), Config::get('constants.STATUS_TESTING')));
       
        if($date != null){
          $order = $order->where('created_at', 'like', $date.'%'); 
        }

        $order = $order->orderBy($sortby, $orderby);
        $order = $order->select(array('id', 'order_number', 'account_id', 'status_id', 'totalPayment', 'created_at'))->paginate($perPage);
        $orderArr = $order->toArray();

        foreach($orderArr['data'] as &$order){
            $order['paidAmount'] = 0;
            foreach($order['payment'] as $payment){
                $order['paidAmount'] += $payment['amount'];
            }
            $order['balanceAmount'] = $order['totalPayment'] - $order['paidAmount'];
            $order['paidAmount'] = number_format($order['paidAmount'], 2);
            $order['balanceAmount'] = number_format($order['balanceAmount'], 2);
            unset($order['payment']);
        }
        return $orderArr;
    }
    
}
