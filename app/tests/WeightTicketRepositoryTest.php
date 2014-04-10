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
            'purchaseorder_id' => 1,
            'pickupschedule_id' => 1,
            'bidproduct_id' => 1,
            
            'origin_bales' => 5,
            'origin_gross' => 19.99,
            'origin_tare' => 18.88,
            'origin_net' => 1.11,
            'origin_scale' => 'Scale Services',
            'origin_scale_fee' => 10.00,

            'destination_bales' => 5,
            'destination_gross' => 19.99,
            'destination_tare' => 18.88,
            'destination_net' => 1.11,
            'destination_scale' => 'Scale Services',
            'destination_scale_fee' => 10.00
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->bidproduct_id === $data['bidproduct_id']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'purchaseorder_id' => 1,
            'pickupschedule_id' => 1,
            'bidproduct_id' => 1,
            
            'origin_bales' => 5,
            'origin_gross' => 19.99,
            'origin_tare' => 18.88,
            'origin_net' => 1.11,
            'origin_scale' => 'Scale Services',
            'origin_scale_fee' => 10.00,

            'destination_bales' => 5,
            'destination_gross' => 19.99,
            'destination_tare' => 18.88,
            'destination_net' => 1.11,
            'destination_scale' => 'Scale Services',
            'destination_scale_fee' => 10.00
        );
        
        $response = $this->repo->update(1, $data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->bidproduct_id === $data['bidproduct_id']);
    }
    
    public function testDestroySaves()
    {
        $reply = $this->repo->destroy(1);
        $this->assertTrue($reply);
        
        $nothing = $this->repo->findById(1);
        $this->assertEquals('Weight Info Not Found', $nothing);
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'purchaseorder_id' => 1,
            'pickupschedule_id' => 1,
            'bidproduct_id' => 1
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFailsWithoutPurchaseOrderId()
    {
        try {
            $this->repo->validate(array(
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1
            ));
        }
        catch(ValidationException $expected)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testValidateFailsWithoutBidProductId()
    {
        try {
            $this->repo->validate(array(
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1
            ));
        }
        catch(ValidationException $expected)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testValidateFailsWithoutPickupScheduleId()
    {
        try {
            $this->repo->validate(array(
                'purchaseorder_id' => 1,
                'bidproduct_id' => 1
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
            'pickupschedule_id' => 1,
            'bidproduct_id' => 1
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->bidproduct_id === $data['bidproduct_id']);
    }
    
}
