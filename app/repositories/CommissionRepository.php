<?php

/**
 * Description of CommissionRepository
 *
 * @author Avs
 */
class CommissionRepository implements CommissionRepositoryInterface {
    
    public function findAll($params)
    {
        // try
        // {
        //     $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        //     $sortby = isset($params['sortby']) ? $params['sortby'] : 'account_name';
        //     $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            
        //     return Stack::with('product')
        //         ->orderBy($sortby, $orderby)
        //         ->paginate($perPage);
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
   
    public function findById($id)
    {
        $commission = Commission::with('order')
                                ->with('weightticket')
                                ->with('user')
                                ->find($id);
        
        if (!$commission) {
            return array(
                'error' => true,
                'message' => 'Commission not found.'
                );
        }
        
        return $commission->toArray();
      
    }
    
    public function store($data)
    {
        $this->validate($data, 'Commission');
        if($this->isWeightTickethasCommission($data['weightticket_id'])){
            return array(
                    'error' => true,
                    'message' => 'This weight ticket has already a commission.'
                );
        }

        $commission = new Commission;
        $commission->fill($data);
        
        if (!$commission->save()) {
            $response = array(
                'error' => true,
                'message' => 'Commission was not created.'
            );
        } else {
             $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Commission'))
            );
        }
        
       return $response;
        
    }

    public function isWeightTickethasCommission($weightTicketId){
        return Commission::where('weightticket_id', '=', $weightTicketId)->count() > 0 ? true : false;
    }
    
    public function update($id, $data)
    {
        $this->validate($data, 'Commission');
       
        $commission = Commission::find($id);
        $commission->fill($data);
        
        if(!$commission->save()) {
            $response = array(
                'error' => true,
                'message' => 'Commission was not updated.'
            );
        } else {
             $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Commission'))
            );
        }
        
       return $response;
    }
    
    public function destroy($id)
    {
        $commission = Commission::find($id);

        if (!$commission->delete()) {
            return array(
                'error' => true,
                'message' => 'Commission was not deleted.'
            );
        }

        $response = array(
            'error' => false,
            'message' => Lang::get('messages.success.deleted', array('entity' => 'Commission'))
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
        return new Commission($data);
    }

    public function getAllClosedWeightTicketByUser($userId, $includeTicketWithCommission = false){
        $response = WeightTicket::with('schedule.orderdetails.account')
                              ->with('schedule.orderdetails.contact')
                              ->with('weightticketscale_pickup')
                              ->with('weightticketscale_dropoff')
                              ->whereHas('schedule', function ($query) use ($userId){
                                        $query->whereHas('order', function ($query) use ($userId){
                                                $query->where('user_id', '=', $userId)
                                                      ->where('ordertype', '=', Config::get('constants.ORDERTYPE_SO'));
                                        });
                                });

        if(!$includeTicketWithCommission){
            $response = $response->has('commission', '=', 0);
        }
                              
        $result = $response->where('status_id', '=', Config::get('constants.STATUS_CLOSED'))->get();
        $result = $result->toArray();

        array_walk($result, function(&$result){
            $result['netTons'] = 0;
            if($result['dropoff_id'] != null){
                $result['netTons'] = $result['weightticketscale_dropoff']['gross']-$result['weightticketscale_dropoff']['tare'];
            } else {
                $result['netTons'] = $result['weightticketscale_pickup']['gross']-$result['weightticketscale_pickup']['tare'];
            }
            $result['netTons'] = number_format($result['netTons'], 4);
        });

        return $result;
    }

    public function getClosedWeightTicketById($id){
        $result = WeightTicket::with('schedule.orderdetails.account')
                              ->with('schedule.orderdetails.contact')
                              ->with('schedule.orderdetails.userfullname')
                              ->with('weightticketscale_pickup.weightticketproducts')
                              ->with('weightticketscale_dropoff.weightticketproducts')
                              ->where('status_id', '=', Config::get('constants.STATUS_CLOSED'))
                              ->where('id', '=', $id)
                              ->first();
        
        if(count($result->toArray()) > 0){
            $data['weightticket_id'] = $result['id'];
            $data['weightticketnumber'] = $result['weightTicketNumber'];
            $data['order_id'] = $result['schedule']['orderdetails']['id'];
            $data['ordernumber'] = $result['schedule']['orderdetails']['order_number'];
            $data['user_id'] = $result['schedule']['orderdetails']['user_id'];
            $data['user']['firstname'] = $result['schedule']['orderdetails']['userfullname']['firstname'];
            $data['user']['lastname'] = $result['schedule']['orderdetails']['userfullname']['lastname'];
            $data['user']['suffix'] = $result['schedule']['orderdetails']['userfullname']['suffix'];

            //Tons (actual net weight of dropoff ticket, if no dropoff ticket use pick up ticket)
            if($result['dropoff_id'] != null){
                $data['tons'] = $result['weightticketscale_dropoff']['gross']-$result['weightticketscale_dropoff']['tare'];
            } else {
                $data['tons'] = $result['weightticketscale_pickup']['gross']-$result['weightticketscale_pickup']['tare'];
            }
        }
                              
        return $data;
    }
    
}
