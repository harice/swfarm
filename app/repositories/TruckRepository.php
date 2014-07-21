<?php

/**
 * Description of TruckRepository
 *
 * @author Das
 */
class TruckRepository implements TruckRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            return Truck::paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function findById($id)
    {
        try
        {
            $truck = Truck::find($id);
            
            if (!$truck) {
                throw new NotFoundException();
            }
            
            return $truck;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        try
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
                'message' => Lang::get('messages.success.created', array('entity' => 'Truck')),
                'data' => $truck->toArray()
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function update($id, $data)
    {
        try
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
                'message' => Lang::get('messages.success.updated', array('entity' => 'Truck')),
                'data' => $truck->toArray()
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        try
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
                'data' => $truck->toArray()
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function validate($data, $id = null)
    {
        $rules = Truck::$rules;
        
        if ($id) {
            $rules['account_id'] = 'required';
            $rules['name'] = 'required|unique:truck,name,'.$id;
            $rules['rate'] = 'required';
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
        $trucks =  Truck::where('account_id', '=', $accountId)->get();
        if($trucks){
            return $trucks->toArray();
        } else {
            return array(
                    'error' => true,
                    'message' => 'No trucks found on this the trucker account you specified.'
                );
        }
    }
    
}
