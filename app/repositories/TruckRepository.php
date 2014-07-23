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
        
        return Truck::with('account.accounttype')->paginate($perPage);
       
    }
    
    public function findById($id)
    {
        $truck = Truck::with('account.accounttype')->find($id);
        
        if (!$truck) {
            throw new NotFoundException();
        }
        
        return $truck;
    }
    
    public function store($data)
    {
        $this->validate($data);
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
            'message' => Lang::get('messages.success.created', array('entity' => 'Truck'))
        );
        
        return $response;
   
    }
    
    public function update($id, $data)
    {
      
        $this->validate($data, $id);
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
            'message' => Lang::get('messages.success.updated', array('entity' => 'Truck'))
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
            'message' => Lang::get('messages.success.deleted', array('entity' => 'Truck'))
        );
        
        return $response;
       
    }
    
    public function validate($data, $id = null)
    {
        $rules = Truck::$rules;
        
        if ($id) {
            $rules['account_id'] = 'required';
            $rules['trucknumber'] = 'required|unique:truck,trucknumber,'.$id;
            $rules['fee'] = 'required';
        }
        
        $validator = Validator::make($data, $rules);
        
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
