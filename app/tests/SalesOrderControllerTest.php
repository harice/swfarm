<?php

class SalesOrderControllerTest extends TestCase {
    
    public function testIndex()
    {
        SalesOrder::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/salesorder');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        SalesOrder::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/salesorder');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        SalesOrder::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/salesorder/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        SalesOrder::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/salesorder/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        SalesOrder::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/salesorder/1');
        $this->assertRequestOk();
    }
    
}