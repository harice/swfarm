<?php

class TrailerControllerTest extends TestCase {
    
    public function testIndex()
    {
        Trailer::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/trailer');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        Trailer::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/trailer');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        Trailer::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/trailer/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        Trailer::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/trailer/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        Trailer::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/trailer/1');
        $this->assertRequestOk();
    }
    
}