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
            
            return Trailer::with('account')->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function search($_search)
    {
        try
        {
            $perPage = isset($_search['perpage']) ? $_search['perpage'] : 15;
            
            $searchWord = $_search['search'];
            
            return Trailer::with('account')
                ->where(function ($query) use ($searchWord) {
                    $query->where('number','like','%'.$searchWord.'%');
                })
                ->paginate($perPage);
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
            $trailer = Trailer::with('account')->find($id);
            
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
        $this->validate($data);
        
        try
        {
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
        $this->validate($data, $id);
        
        try
        {
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
            $rules['number'] = 'required|unique:trailer,number,'.$id;
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
