<?php

class WeightInfoRepository implements WeightInfoRepositoryInterface {
    
    public function findAll()
    {
        try
        {
            return WeightInfo::all();
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
            $weightinfo = WeightInfo::find($id);

            if(!$weightinfo) throw new NotFoundException('Weight Info Not Found');
            return $weightinfo;
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
            $weightinfo = $this->instance();
            $weightinfo->gross = $data['gross'];
            $weightinfo->tare = $data['tare'];

            $weightinfo->save();

            return $weightinfo;
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
            $weighinfo = WeightInfo::find($id);
            $weighinfo->fill($data);
            $this->validate($weighinfo->toArray());
            $weighinfo->save();
            return $weighinfo;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        $role = $this->findById($id);
        $role->delete();
        
        return true;
    }
    
    public function validate($data)
    {
        $validator = Validator::make($data, WeightInfo::$rules);
        
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new WeightInfo($data);
    }
    
}
