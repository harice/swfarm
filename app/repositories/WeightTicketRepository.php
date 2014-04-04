<?php

class WeightTicketRepository implements WeightTicketRepositoryInterface {
    
    protected $weightticket;
    
    public function __construct(WeightTicketInterface $weightticket)
    {
        $this->weightticket = $weightticket;
    }
    
    public function findAll()
    {
        try
        {
            $weighttickets = $this->weightticket->all();
            return Response::json($weighttickets);
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
            $weightticket = $this->weightticket->find($id);
            
            if ($weightticket) {
                return Response::json($weightticket);
            }
            else
            {
                $message = 'Weight Ticket not found.';
                return Response::make()->setStatusCode(204, $message);
            }
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function store($data)
    {
        $rules = array(
            'bidproduct' => 'required',
            'weighttickettype' => 'required',
            'bales' => 'required',
            'gross' => 'required',
            'tare' => 'required'
        );

        $this->validate($data, $rules);
        
        try
        {
            // $this->weightticket->bidproduct_id = $data['bidproduct'];
            $this->weightticket->weighttickettype_id = $data['weighttickettype'];
            $this->weightticket->bales = $data['bales'];
            $this->weightticket->gross = $data['gross'];
            $this->weightticket->tare = $data['tare'];
            $this->weightticket->net = $data['bales'] - $data['bales'];

            $this->weightticket->save();

            $message = 'Weight Ticket ' .$this->weightticket->id .' has been created.';
            return Response::make($message)->setStatusCode(201, $message);
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
            $weightticket = $this->weightticket->find($id);
            
            if ($weightticket) {
                // $weightticket->bidproduct_id = $data['bidproduct'];
                $weightticket->weighttickettype_id = $data['weighttickettype'];
                $weightticket->bales = $data['bales'];
                $weightticket->gross = $data['gross'];
                $weightticket->tare = $data['tare'];
                $weightticket->net = $data['bales'] - $data['bales'];

                $weightticket->save();

                $message = 'Weight Ticket ' .$weightticket->id .' has been updated.';
                return Response::make()->setStatusCode(200, $message);
            }
            else
            {
                $message = 'Weight Ticket not found.';
                return Response::make()->setStatusCode(204, $message);
            }
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
            $weightticket = $this->weightticket->find($id);
            
            if($weightticket) {
                $message = 'Weight Ticket ' .$weightticket->id .' has been deleted.';
                
                $weightticket->delete();
                
                return Response::make()->setStatusCode(200, $message);
            }
            else
            {
                $message = 'Weight Ticket not found.';
                return Response::make()->setStatusCode(204, $message);
            }
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function validate($data, $rules)
    {
        $validator = Validator::make($data, $rules);

        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
}