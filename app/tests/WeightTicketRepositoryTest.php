<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class WeightTicketRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('WeightTicketRepository');
        
        Artisan::call('migrate');
        $this->seed();
    }
    
    public function testFindAllReturnsCollection()
    {
        $response = $this->repo->findAll();
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
            'purchaseorder_id' => 10001,
            'product' => 'Alfalfa'
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->product === $data['product']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'purchaseorder_id' => 1,
            'product' => 'Alfalfa'
        );
        
        $response = $this->repo->update(1, $data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->product === $data['product']);
    }
    
    public function testDestroySaves()
    {
        $reply = $this->repo->destroy(1);
        $this->assertTrue($reply instanceof Model);

        try {
            $this->repo->findById(1);
        }
        catch(NotFoundException $e)
        {
            return;
        }

        // $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'purchaseorder_id' => 1,
            'product' => 'Alfalfa'
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFailsWithoutPoId()
    {
        try {
            $this->repo->validate(array(
                'product' => 'Alfalfa'
            ));
        }
        catch(ValidationException $expected)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testValidateFailsWithoutProduct()
    {
        try {
            $this->repo->validate(array(
                'purchaseorder_id' => 1
            ));
        }
        catch(ValidationException $expected)
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
            'purchaseorder_id' => 1,
            'product' => 'Alfalfa'
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->product === $data['product']);
    }
    
}
