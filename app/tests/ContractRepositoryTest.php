<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\Paginator;

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
        $this->assertTrue($response instanceof Paginator);
    }
    
    public function testFindByIdReturnsModel()
    {
        $response = $this->repo->findById(1);
        $this->assertTrue($response instanceof Model);
    }
    
    public function testStoreReturnsModel()
    {
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'contract_number' => 'C20140630-0001',
            'account_id' => 1,
            'contract_date_start' => '2014-06-29 00:00:00',
            'contract_date_end' => '2014-06-29 00:00:01',
            'user_id' => 1,
            'status_id' => 1,
            'created_at' => $date,
            'updated_at' => $date,
            'products' => array()
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response['data'] instanceof Model);
    }
    
    public function testUpdateSaves()
    {
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$data = array(
            'contract_number' => 'C20140715-000',
            'account_id' => 1,
            'contract_date_start' => '2014-06-29 00:00:00',
            'contract_date_end' => '2014-06-29 00:00:01',
            'products' => array()
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model['data'] instanceof Model);
        $this->assertTrue($model['data']->contract_number === $data['contract_number']);
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

//        $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'contract_number' => 'C20140630-0002',
            'account_id' => 1,
            'contract_date_start' => '2014-06-29 00:00:00',
            'contract_date_end' => '2014-06-29 00:00:01',
            'user_id' => 1
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
