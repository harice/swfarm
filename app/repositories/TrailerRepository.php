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
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'number';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            
            return Trailer::join('account', 'trailer.account_id', '=', 'account.id')
                ->select('trailer.id', 'trailer.number', 'account.name')
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function search($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'number';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            $searchWord = $params['search'];
            
            return Trailer::join('account', 'trailer.account_id', '=', 'account.id')
                ->select('trailer.id', 'trailer.number', 'account.name')
                ->where(function ($query) use ($searchWord) {
                    $query->where('number','like','%'.$searchWord.'%');
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
        $trailer = Trailer::with('account')->find($id);

        if ($trailer) {
            return $trailer;
        }
        
        throw new NotFoundException('Trailer was not found.');
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
                'data' => $trailer
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
                'data' => $trailer
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
            
            if ($trailer) {
                
                $transport_schedule = TransportSchedule::where('trailer_id', '=', $id)->get();
                
                if (!$transport_schedule->count()) {
                    $trailer->forceDelete();
                    
                    return array(
                        'error' => false,
                        'message' => Lang::get('messages.success.deleted', array('entity' => 'Trailer')),
                        'data' => $trailer
                    );
                } else {
                    return array(
                        'error' => true,
                        'message' => 'Trailer has transport schedule.'
                    );
                }
            }
            
            return array(
                'error' => true,
                'message' => 'Trailer was not deleted.'
            );
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
