<?php

class WeightInfoControllerTest extends TestCase {
    
    public function testIndex()
    {
        WeightInfo::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightinfo');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        WeightInfo::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/weightinfo');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        WeightInfo::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/weightinfo/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        WeightInfo::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/weightinfo/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        WeightInfo::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/weightinfo/1');
        $this->assertRequestOk();
    }
    
}