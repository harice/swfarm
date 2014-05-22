<?php

/**
 * Description of StackRepository
 *
 * @author Das
 */
class StackRepository implements StackRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            return Stack::with('product')->paginate($perPage);
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
            $stack = Stack::find($id);
            
            if (!$stack) {
                throw new NotFoundException();
            }
            
            return $stack;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        $this->validate($data);
        
        try
        {
            $stack = $this->instance();
            $stack->fill($data);
            
            if (!$stack->save()) {
                return array(
                    'error' => true,
                    'message' => 'Stack was not created.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Stack')),
                'data' => $stack->toArray()
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
        $this->validate($data, $id);
        
        try
        {
            $stack = $this->findById($id);
            $stack->fill($data);
            
            if (!$stack->update()) {
                return array(
                    'error' => true,
                    'message' => 'Stack was not updated.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Stack')),
                'data' => $stack->toArray()
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
            $stack = $this->findById($id);

            if (!$stack->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Stack was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Stack')),
                'data' => $stack->toArray()
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
        $rules = Stack::$rules;
        
        if ($id) {
            $rules['stacknumber'] = 'required|unique:stack,stacknumber,'.$id;
            $rules['product_id'] = 'required';
            $rules['location'] = 'required|unique:stack,location,'.$id;
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Stack($data);
    }
    
}
