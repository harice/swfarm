<?php

class WeightTicketRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('WeightTicketRepository');
    }
    
    public function testFindAllReturnsResponse()
    {
        $response = $this->repo->findAll(1);
        $this->assertTrue($response instanceof Illuminate\Http\JsonResponse);
    }


    public function testFindByIdReturnsResponse()
    {
        $response = $this->repo->findById(1,1);
        $this->assertTrue($response instanceof Illuminate\Http\JsonResponse);
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'bidproduct' => 1,
            'weighttickettype' => 1,
            'gross' => 12,
            'tare' => 13
        );
        
        $reply = $this->repo->validate($data);
        
        $this->assertTrue($reply);
    }
    
}
