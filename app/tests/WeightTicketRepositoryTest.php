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
            'name' => 'John Doe'
        );
        
        $rules = array(
            'name' => 'required'
        );
        
        $reply = $this->repo->validate($data, $rules);
        
        $this->assertTrue($reply);
    }
    
}
