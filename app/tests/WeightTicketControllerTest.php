<?php

class WeightTicketControllerTest extends TestCase {

	public function testFindAll()
    {
        WeightTicket::shouldReceive('findAll')->once()->andReturn('foo');
        
        $this->call('GET', 'apiv1/weightticket');
        
        $this->assertRequestOk();
    }

}