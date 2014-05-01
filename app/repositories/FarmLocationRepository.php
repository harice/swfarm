<?php

/**
 * Description of FarmLocationRepository
 *
 * @author Das
 */
class FarmLocationRepository implements FarmLocationRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : 10;
            
            $result = FarmLocation::paginate($perPage);
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
            $farmlocation = FarmLocation::find($id);
            
            if (!$farmlocation) {
                throw new NotFoundException();
            }
            
            return $farmlocation;
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
            $farmlocation = $this->instance();
            $farmlocation->fill($data);
            
            if (!$farmlocation->save()) {
                return array(
                    'message' => 'Farm Location was not created.'
                );
            }
            
            return $farmlocation;
//            return array(
//                'farmlocation' => $farmlocation->toArray(),
//                'message' => 'Farm Location was been created.'
//            );
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
            $farmlocation = $this->findById($id);
            $farmlocation->fill($data);
            
            if (!$farmlocation->update()) {
                return array(
                    'message' => 'Farm Location was not updated.'
                );
            }
            
            // return $farmlocation;
            return Response::json($farmlocation);
//            return array(
//                'farmlocation' => $farmlocation->toArray(),
//                'message' => 'Farm Location has been updated.'
//            );
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
            $farmlocation = $this->findById($id);

            if (!$farmlocation->delete()) {
                return array(
                    'message' => 'Farm Location was not deleted.'
                );
            }

            return $farmlocation;
//            return array(
//                'farmlocation' => $farmlocation->toArray(),
//                'message' => 'Farm Location has been deleted.'
//            );
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function validate($data, $id = null)
    {
        $rules = FarmLocation::$rules;
        
        if ($id) {
            $rules['locationnumber'] = 'required|unique:farmlocation,locationnumber,'.$id;
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new FarmLocation($data);
    }
    
}
