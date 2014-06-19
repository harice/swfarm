<?php

use ContractProductsRepositoryInterface as ContractP;

/**
 * Description of ContractRepository
 *
 * @author Das
 */
class ContractRepository implements ContractRepositoryInterface {
    
    public function __construct(ContractP $product)
    {
        $this->product = $product;
    }
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            
            return Contract::with('products')
                ->with('account', 'account.address')
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
            
            return Contract::where(function ($query) use ($searchWord)
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
            $contract = Contract::with('products')
                ->with('account', 'account.address')
                ->find($id);
            
            if (!$contract) {
                throw new NotFoundException();
            }
            
            return $contract;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        $data['contract_number'] = generateControlNumber('Contract', 'C');
        $data['user_id'] = Auth::user()->id;
        $this->validate($data);
        
        try
        {
            $contract = $this->instance();
            $contract->fill($data);
            $contract->save();
            
            $contract_id = $contract['id'];
            foreach ($data['products'] as $product)
            {
                $this->product->store($contract_id, $product);
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contract'))
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
            $contract = $this->findById($id);
            $contract->fill($data);
            $contract->update();
            
            $contract_id = $contract['id'];
            foreach ($data['products'] as $product)
            {
                $this->product->update($contract_id, $product);
            }
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contract'))
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
            $contract = $this->findById($id);

            if (!$contract->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Contract was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Contract'))
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
        $rules = Contract::$rules;
        
        if ($id) {
            $rules['contract_number'] = 'sometimes|required|unique:contract,contract_number,'.$id;
            $rules['user_id'] = 'sometimes|required';
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Contract($data);
    }
    
}
