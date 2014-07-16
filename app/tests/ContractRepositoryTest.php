<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class ContractRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('ContractRepository');
        
        Artisan::call('migrate');
        $this->seed('TestDatabaseSeeder');
    }
    
    public function testFindAllReturnsCollection()
    {
        $response = $this->repo->findAll('foo');
        $this->assertTrue($response instanceof Collection);
    }
    
    public function testFindByIdReturnsModel()
    {
        $response = $this->repo->findById(1);
        $this->assertTrue($response instanceof Model);
    }
    
    public function testStoreReturnsModel()
    {
        $data = array(
            'contract_number' => 'C20140715-000'
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        // $this->assertTrue($response->contract_number === $data['contract_number']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'contract_number'  => 'C20140715-000'
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->contract_number === $data['contract_number']);
    }
    
    public function testDestroySaves()
    {
        $model = $this->repo->destroy(1);
        $this->assertTrue($model instanceof Model);
        
        try
        {
            $this->repo->find(1);
        }
        catch (NotFoundException $e)
        {
            return;
        }

        // $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'contract_number' => 'C20140715-000'
        );
        
        $response = $this->repo->validate($data);
        $this->assertTrue($response);
    }
    
    public function testValidateFails()
    {
        $data = array(
        );
        
        try {
            $this->repo->validate($data);
        }
        catch(ValidationException $e)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testInstanceReturnsModel()
    {
        $response = $this->repo->instance();
        $this->assertTrue($response instanceof Model);
    }

    public function testInstanceReturnsModelWithData()
    {
        $data = array(
            'contract_number' => 'C20140715-000'
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->contract_number === $data['contract_number']);
    }
    
}
