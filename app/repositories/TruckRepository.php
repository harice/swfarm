<?php

/**
 * Description of TruckRepository
 *
 * @author Avs
 */
class TruckRepository implements TruckRepositoryInterface {
    
    public function findAll($params)
    {
       
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'trucknumber';
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
        
        return Truck::join('account', 'truck.account_id', '=', 'account.id')
            ->join('accounttype', 'account.accounttype', '=', 'accounttype.id')
            ->select('truck.id', 'truck.trucknumber', 'truck.fee', 'account.id as account_id', 'account.name as account_name', 'accounttype.name as account_type')
            ->orderBy($sortby, $orderby)
            ->paginate($perPage);
    }
    
    public function search($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'trucknumber';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            $searchWord = $params['search'];
            
            return Truck::join('account', 'truck.account_id', '=', 'account.id')
                ->join('accounttype', 'account.accounttype', '=', 'accounttype.id')
                ->select('truck.id', 'truck.trucknumber', 'truck.fee', 'account.id as account_id', 'account.name as account_name', 'accounttype.name as account_type')
                ->where(function ($query) use ($searchWord) {
                    $query->orWhere('trucknumber','like','%'.$searchWord.'%');
                    $query->orWhere('account.name','like','%'.$searchWord.'%');
                })
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function findById($id)
    {
//        $truck = Truck::join('account', 'truck.account_id', '=', 'account.id')
//            ->join('accounttype', 'account.accounttype', '=', 'accounttype.id')
//            ->select('truck.id', 'truck.trucknumber', 'truck.fee', 'account.id as account_id', 'account.name as account_name', 'accounttype.name as account_type')
//            ->where('truck.id', '=', $id)
//            ->first();
        
        $truck = Truck::with('account.accounttype')->find($id);
        
        if (!$truck) {
            throw new NotFoundException();
        }
        
        return $truck;
    }
    
    public function store($data)
    {
        $data['fee'] = (int)str_replace(array('.', ','), '' , $data['fee']);
        $this->validate($data);
        $data['fee'] = number_format(($data['fee'] / 100), 2, '.', '');
        
        $truck = $this->instance();
        $truck->fill($data);
        
        if (!$truck->save()) {
            return array(
                'error' => true,
                'message' => 'Truck was not created.'
            );
        }
        
        $response = array(
            'error' => false,
            'message' => Lang::get('messages.success.created', array('entity' => 'Truck')),
            'data' => $truck
        );
        
        return $response;
    }
    
    public function update($id, $data)
    {
        $data['fee'] = (int)str_replace(array('.', ','), '' , $data['fee']);
        $this->validate($data, $id);
        $data['fee'] = number_format(($data['fee'] / 100), 2, '.', '');
        
        $truck = $this->findById($id);
        $truck->fill($data);
        
        if (!$truck->update()) {
            return array(
                'error' => true,
                'message' => 'Truck was not updated.'
            );
        }
        
        $response = array(
            'error' => false,
            'message' => Lang::get('messages.success.updated', array('entity' => 'Truck')),
            'data' => $truck
        );
        
        return $response;
    }
    
    public function destroy($id)
    {
       
        $truck = $this->findById($id);

        if (!$truck->delete()) {
            return array(
                'error' => true,
                'message' => 'Truck was not deleted.'
            );
        }

        $response = array(
            'error' => false,
            'message' => Lang::get('messages.success.deleted', array('entity' => 'Truck')),
            'data' => $truck
        );
        
        return $response;
       
    }
    
    public function validate($data, $id = null)
    {
        $rules = Truck::$rules;
        $messages = array(
            'fee.max' => 'The fee may not be greater than 1,000.00 .'
        );
        
        if ($id) {
            $rules['trucknumber'] = 'required|unique:truck,trucknumber,'.$id;
        }
        
        $validator = Validator::make($data, $rules, $messages);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Truck($data);
    }

    public function getTruckerListByAccount($accountId){
        $trucks =  Truck::where('account_id', '=', $accountId)->get(array('id', 'trucknumber', 'fee'));
        return $trucks->toArray();
    }
    
}
