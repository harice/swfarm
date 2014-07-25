<?php

class TruckControllerTest extends TestCase {
    
    public function testIndex()
    {
        Truck::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/truck');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        Truck::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/truck');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        Truck::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/truck/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        Truck::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/truck/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        Truck::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/truck/1');
        $this->assertRequestOk();
    }
    
}