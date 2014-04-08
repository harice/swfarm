<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class WeightInfoRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('WeightInfoRepository');
        
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
            'bales' => 5,
            'gross' => 19.99,
            'tare' => 18.88,
            'net' => 1.11,
            'po_id' => 10001,
            'product' => 'Alfalfa',
            'scale' => 'Scale Services',
            'scale_fee' => 10.00
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->gross === $data['gross']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'gross' => 9999.99,
            'tare' => 8888.88
        );
        
        $response = $this->repo->update(1, $data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->gross === $data['gross']);
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
            'gross' => 9999.99,
            'tare' => 8888.88
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFailsWithoutGross()
    {
        try {
            $this->repo->validate(array(
                'tare' => 8888.88
            ));
        }
        catch(ValidationException $expected)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testValidateFailsWithoutTare()
    {
        try {
            $this->repo->validate(array(
                'gross' => 9999.99
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
            'gross' => 9999.99,
            'tare' => 8888.88
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->gross === $data['gross']);
    }
    
}
