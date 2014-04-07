<?php

class WeightTicketControllerTest extends TestCase {

    /**
     * Test Basic Route Responses
     */
    public function testIndex()
    {
        $response = $this->call('GET', route('apiv1.weightticket.index'));
        $this->assertTrue($response->isOk());
    }

    public function testCreate()
    {
        $response = $this->call('GET', route('apiv1.weightticket.create'));
        $this->assertTrue($response->isOk());
    }
    
    public function testStore()
    {
        $response = $this->call('GET', route('apiv1.weightticket.store'));
        $this->assertTrue($response->isOk());
    }
    
    public function testShow()
    {
        $response = $this->call('GET', route('apiv1.weightticket.show', array(1)));
        $this->assertTrue($response->isOk());
    }

    public function testEdit()
    {
        $response = $this->call('GET', route('apiv1.weightticket.edit', array(1)));
        $this->assertTrue($response->isOk());
    }
    
    public function testUpdate()
    {
        $response = $this->call('GET', route('apiv1.weightticket.update', array(1)));
        $this->assertTrue($response->isOk());
    }
    
    public function testDestroy()
    {
        $response = $this->call('GET', route('apiv1.weightticket.destroy', array(1)));
        $this->assertTrue($response->isOk());
    }
    
    /**
     * Test that controller calls repo as we expect
     */
	public function testIndexShouldCallFindAllMethod()
    {
        WeightTicket::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightticket');
        $this->assertRequestOk();
    }
    
    public function testShowShouldCallFindByIdMethod()
    {
        WeightTicket::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }
    
    public function testStoreShouldCallStoreMethod()
    {
        WeightTicket::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/weightticket');
        $this->assertRequestOk();
    }
    
    public function testUpdateShouldCallUpdateMethod()
    {
        WeightTicket::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }
    
    public function testDestroyShouldCallDestroyMethod()
    {
        WeightTicket::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }

}