<?php

class ScaleControllerTest extends TestCase {
    
    public function testIndex()
    {
        Scale::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/scale');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        Scale::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/scale');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        Scale::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/scale/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        Scale::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/scale/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        Scale::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/scale/1');
        $this->assertRequestOk();
    }
    
}