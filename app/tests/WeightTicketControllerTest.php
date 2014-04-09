<?php

class WeightTicketControllerTest extends TestCase {
    
    public function testIndex()
    {
        WeightTicket::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightticket');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        WeightTicket::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/weightticket');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        WeightTicket::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        WeightTicket::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        WeightTicket::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/weightticket/1');
        $this->assertRequestOk();
    }
    
}