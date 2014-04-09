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
            $weightticket = WeightInfo::find($id);

            if(!$weightticket) throw new NotFoundException('Weight Info Not Found');
            return $weightticket;
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
            $weightticket = $this->instance();
            $weightticket->bales = $data['bales'];
            $weightticket->gross = $data['gross'];
            $weightticket->tare = $data['tare'];
            $weightticket->net = $data['net'];
            $weightticket->scale = $data['scale'];
            $weightticket->scale_fee = $data['scale_fee'];

            $weightticket->save();

            return $weightticket;
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
            $weightticket = WeightInfo::find($id);
            
            $weightticket->bales = $data['bales'];
            $weightticket->gross = $data['gross'];
            $weightticket->tare = $data['tare'];
            $weightticket->net = $data['net'];
            $weightticket->scale = $data['scale'];
            $weightticket->scale_fee = $data['scale_fee'];
            
            $weightticket->save();
            
            return $weightticket;
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
