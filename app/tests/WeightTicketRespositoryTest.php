<?php

class WeightTicketRepositoryTest extends TestCase {

	public function testFindById()
    {
        WeightTicket::shouldReceive('find')->once()->andReturn('foo');
        
        $this->call('GET', 'apiv1/weightticket');
        
        $this->assertRequestOk();
    }

}