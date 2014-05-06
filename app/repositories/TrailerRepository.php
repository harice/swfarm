<?php

/**
 * Description of TrailerRepository
 *
 * @author Das
 */
class TrailerRepository implements TrailerRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            return Trailer::paginate($perPage);
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
            $trailer = Trailer::find($id)->fee;
            
            if (!$trailer) {
                throw new NotFoundException();
            }
            
            return $trailer;
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
            $trailer = $this->instance();
            $trailer->fill($data);
            
            if (!$trailer->save()) {
                return array(
                    'error' => true,
                    'message' => 'Trailer was not created.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Trailer')),
                'data' => $trailer->toArray()
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
            $trailer = $this->findById($id);
            $trailer->fill($data);
            
            if (!$trailer->update()) {
                return array(
                    'error' => true,
                    'message' => 'Trailer was not updated.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Trailer')),
                'data' => $trailer->toArray()
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
            $trailer = $this->findById($id);

            if (!$trailer->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Trailer was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Trailer')),
                'data' => $trailer->toArray()
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
        $rules = Trailer::$rules;
        
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
        return new Trailer($data);
    }
    
}
