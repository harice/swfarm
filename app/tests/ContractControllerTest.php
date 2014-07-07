<?php

class ContractControllerTest extends TestCase {
    
    public function testIndex()
    {
        Contract::shouldReceive('findAll')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/contract');
        $this->assertRequestOk();
    }
    
    public function testStore()
    {
        Contract::shouldReceive('store')->once()->andReturn('foo');
        $this->call('POST', 'apiv1/contract');
        $this->assertRequestOk();
    }
    
    public function testShow()
    {
        Contract::shouldReceive('findById')->once()->andReturn('foo');
        $this->call('GET', 'apiv1/contract/1');
        $this->assertRequestOk();
    }
    
    public function testUpdate()
    {
        Contract::shouldReceive('update')->once()->andReturn('foo');
        $this->call('PUT', 'apiv1/contract/1');
        $this->assertRequestOk();
    }
    
    public function testDestroy()
    {
        Contract::shouldReceive('destroy')->once()->andReturn('foo');
        $this->call('DELETE', 'apiv1/contract/1');
        $this->assertRequestOk();
    }
    
}