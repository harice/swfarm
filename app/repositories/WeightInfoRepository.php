<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of WeightInfoRepository
 *
 * @author Das
 */
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
            
            $weightinfo->weightticket_id = $data['weightticket_id'];
            $weightinfo->weightinfo_type = $data['weightinfo_type'];
            $weightinfo->bales = $data['bales'];
            $weightinfo->gross = $data['gross'];
            $weightinfo->tare = $data['tare'];
            $weightinfo->net = $data['net'];
            $weightinfo->scale = $data['scale'];
            $weightinfo->scale_fee = $data['scale_fee'];

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
        $this->validate($data);
        
        try
        {
            $weightinfo = WeightInfo::find($id);
            
            $weightinfo->weightticket_id = $data['weightticket_id'];
            $weightinfo->weightinfo_type = $data['weightinfo_type'];
            $weightinfo->bales = $data['bales'];
            $weightinfo->gross = $data['gross'];
            $weightinfo->tare = $data['tare'];
            $weightinfo->net = $data['net'];
            $weightinfo->scale = $data['scale'];
            $weightinfo->scale_fee = $data['scale_fee'];
            
            $weightinfo->save();
            
            return $weightinfo;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        $weightinfo = $this->findById($id);
        $deleted_weightinfo = $weightinfo;
        
        $weightinfo->delete();
        
        return $deleted_weightinfo;
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
