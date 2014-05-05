<?php

/**
 * Description of ScaleRepository
 *
 * @author Das
 */
class ScaleRepository implements ScaleRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            $result = Scale::paginate($perPage);
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
            $scale = Scale::find($id)->fee;
            
            if (!$scale) {
                throw new NotFoundException();
            }
            
            return $scale;
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
            $scale = $this->instance();
            $scale->fill($data);
            
            if (!$scale->save()) {
                return array(
                    'error' => true,
                    'message' => 'Scale was not created.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Scale')),
                'data' => $scale->toArray()
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
            $scale = $this->findById($id);
            $scale->fill($data);
            
            if (!$scale->update()) {
                return array(
                    'error' => true,
                    'message' => 'Scale was not updated.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Scale')),
                'data' => $scale->toArray()
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
            $scale = $this->findById($id);

            if (!$scale->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Scale was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Scale')),
                'data' => $scale->toArray()
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
        $rules = Scale::$rules;
        
        if ($id) {
            $rules['account_id'] = 'required';
            $rules['name'] = 'required';
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Scale($data);
    }
    
}
