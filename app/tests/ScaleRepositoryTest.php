<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;

class ScaleRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('ScaleRepository');
        
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
            'account_id'        => 7,
            'name'              => 'Scale A',
            'rate'              => '0.00',
            'created_at'        => $date,
            'updated_at'        => $date
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response['data'] instanceof Model);
    }
    
    public function testUpdateSaves()
    {
		$data = array(
            'account_id'        => 7,
            'name'              => 'Scale AAA',
            'rate'              => '0.00'
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model['data'] instanceof Model);
        $this->assertTrue($model['data']->name === $data['name']);
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

        $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'account_id'        => 7,
            'name'              => 'Scale B',
            'rate'              => '0.00'
        );
        
        $response = $this->repo->validate($data);
        $this->assertTrue($response);
    }
    
    public function testValidateFails()
    {
        $data = array(
            'account_id'        => 7,
            'rate'              => '0.00'
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
            'account_id'        => 7,
            'name'              => 'Scale B',
            'rate'              => '0.00',
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->name === $data['name']);
    }
    
}
