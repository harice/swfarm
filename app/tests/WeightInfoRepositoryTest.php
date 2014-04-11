<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

/**
 * Description of WeightInfoRepositoryTest
 *
 * @author Das
 */
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
            'weightticket_id' => 1,
            'weightinfo_type' => 'Origin',
            'bales' => 5,
            'gross' => 19.99,
            'tare' => 18.88,
            'net' => 1.11,
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
            'weightticket_id' => 1,
            'weightinfo_type' => 'Origin',
            'bales' => 5,
            'gross' => 9999.99,
            'tare' => 8888.88,
            'net' => 1111.11,
            'scale' => 'Scale Inc.',
            'scale_fee' => 10.00
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
            'weightticket_id' => 1,
            'weightinfo_type' => 'Origin',
            'bales' => 5,
            'gross' => 9999.99,
            'tare' => 8888.88,
            'net' => 1111.11,
            'scale' => 'Scale Inc.',
            'scale_fee' => 10.00
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFailsWithoutGross()
    {
        try {
            $this->repo->validate(array(
                'weightinfo_type' => 'Origin',
                'bales' => 5,
                'tare' => 8888.88,
                'net' => 1111.11,
                'scale' => 'Scale Inc.',
                'scale_fee' => 10.00
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
                'weightinfo_type' => 'Origin',
                'bales' => 5,
                'gross' => 9999.99,
                'net' => 1111.11,
                'scale' => 'Scale Inc.',
                'scale_fee' => 10.00
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
            'weightinfo_type' => 'Origin',
            'bales' => 5,
            'gross' => 9999.99,
            'tare' => 8888.88,
            'net' => 1111.11,
            'scale' => 'Scale Inc.',
            'scale_fee' => 10.00
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->gross === $data['gross']);
    }
    
}
