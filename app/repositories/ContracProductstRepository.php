<?php

/**
 * Description of ContractProductsRepository
 *
 * @author Das
 */
class ContractProductsRepository implements ContractProductsRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            
            return ContractProducts::with('products')
                ->with('account', 'account.address')
                ->with('user')
                ->paginate($perPage);
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
            $perPage = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            
            $searchWord = $_search['search'];
            
            return ContractProducts::where(function ($query) use ($searchWord)
                {
                    $query->where('contract_number','like','%'.$searchWord.'%');
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
            $contract_product = ContractProducts::find($id);
            
            if (!$contract_product) {
                throw new NotFoundException();
            }
            
            return $contract_product;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($contract_id, $data)
    {
        $data['contract_id'] = $contract_id;
        $this->validate($data);
        
        try
        {
            $contract_product = $this->instance();
            $contract_product->fill($data);
            $contract_product->save();
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
            $contract_product = $this->findById($id);
            
            $contract_product->fill($data);
            
            if (!$contract_product->update()) {
                return array(
                    'error' => true,
                    'message' => 'ContractProducts was not updated.'
                );
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'ContractProducts'))
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
            $contract_product = $this->findById($id);

            if (!$contract_product->delete()) {
                return array(
                    'error' => true,
                    'message' => 'ContractProducts was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'ContractProducts'))
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
        $rules = ContractProducts::$rules;
        
        if ($id) {
            //
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new ContractProducts($data);
    }
    
}
