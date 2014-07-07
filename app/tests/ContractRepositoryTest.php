<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\Paginator;

class ContractRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('ContractRepository');
        
        Artisan::call('migrate', array('--path' => 'app/tests/migrations'));
        $this->seed();
    }
    
    public function testFindAllReturnsCollection()
    {
        $response = $this->repo->findAll('foo');
        $this->assertTrue($response instanceof Paginator);
    }
    
    public function testFindByIdReturnsModel()
    {
        $response = $this->repo->findById(1);
        $this->assertTrue($response instanceof Model);
    }
    
    public function testStoreReturnsModel()
    {
        $data = array(
            "account_id" => 1,
            "contract_date_start" => "2014-04-21 00:02:20",
            "contract_date_end" => "2014-04-21 00:02:21",
            "products" => array(
                array(
                    "product_id" => 1,
                    "tons" => 50.0000,
                    "bales" => 10
                ),
                array(
                    "product_id" => 2,
                    "tons" => 50.0000,
                    "bales" => 10
                )
            )
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        // $this->assertTrue($response->name === $data['name']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'name'  => 'Test Contract'
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->name === $data['name']);
    }
    
    public function testDestroySaves()
    {
        $model = $this->repo->destroy(1);
        $this->assertTrue($model['data'] instanceof Model);
        
        try
        {
            $this->repo->findById(1);
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
            'name' => 'Test Contract'
        );
        
        $response = $this->repo->validate($data);
        $this->assertTrue($response);
    }
    
    public function testValidateFails()
    {
        $data = array(
            'description' => 'Admin user.'
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
            'name' => 'Test Contract'
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->name === $data['name']);
    }
    
}
