<?php

/**
 * Description of FeeRepository
 *
 * @author Das
 */
class FeeRepository implements FeeRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            $result = Fee::paginate($perPage);
            return $result->getCollection();
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
            $fee = Fee::find($id);
            
            if (!$fee) {
                throw new NotFoundException();
            }
            
            return $fee;
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
            $fee = $this->instance();
            $fee->fill($data);
            
            if (!$fee->save()) {
                return array(
                    'error' => true,
                    'message' => 'Fee was not created.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Fee')),
                'data' => $fee->toArray()
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
            $fee = $this->findById($id);
            $fee->fill($data);
            
            if (!$fee->update()) {
                return array(
                    'error' => true,
                    'message' => 'Fee was not updated.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Fee')),
                'data' => $fee->toArray()
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
            $fee = $this->findById($id);

            if (!$fee->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Fee was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Fee')),
                'data' => $fee->toArray()
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
        $rules = Fee::$rules;
        
        if ($id) {
            $rules['account_id'] = 'required';
            $rules['type'] = 'required';
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
        return new Fee($data);
    }
    
}
