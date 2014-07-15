<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class WeightTicketRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('WeightTicketRepository');
        
        Artisan::call('migrate');
        $this->seed();
    }
    
    public function testMailLoadingTicketReturnsResponse()
    {
        $result = $this->repo->mailLoadingTicket(22, 'foo');
        $this->assertTrue($result['data'] instanceof Model);
    }
    
//    public function testFindAllReturnsCollection()
//    {
//        $response = $this->repo->findAll('foo');
//        $this->assertTrue($response instanceof Collection);
//    }
//    
//    public function testFindByIdReturnsModel()
//    {
//        $response = $this->repo->findById(1);
//        $this->assertTrue($response instanceof Model);
//    }
//    
//    public function testStoreReturnsModel()
//    {
//        $data = array(
//            'name' => 'Test WeightTicket'
//        );
//
//        $response = $this->repo->store($data);
//
//        $this->assertTrue($response instanceof Model);
//        // $this->assertTrue($response->name === $data['name']);
//    }
//    
//    public function testUpdateSaves()
//    {
//        $data = array(
//            'name'  => 'Test WeightTicket'
//        );
//        
//        $model = $this->repo->update(1, $data);
//        
//        $this->assertTrue($model instanceof Model);
//        $this->assertTrue($model->name === $data['name']);
//    }
//    
//    public function testDestroySaves()
//    {
//        $model = $this->repo->destroy(1);
//        $this->assertTrue($model instanceof Model);
//        
//        try
//        {
//            $this->repo->find(1);
//        }
//        catch (NotFoundException $e)
//        {
//            return;
//        }
//
//        // $this->fail('NotFoundException was not raised');
//    }
//    
//    public function testValidatePasses()
//    {
//        $data = array(
//            'name' => 'Test WeightTicket'
//        );
//        
//        $response = $this->repo->validate($data);
//        $this->assertTrue($response);
//    }
//    
//    public function testValidateFails()
//    {
//        $data = array(
//            'description' => 'Admin user.'
//        );
//        
//        try {
//            $this->repo->validate($data);
//        }
//        catch(ValidationException $e)
//        {
//            return;
//        }
//
//        $this->fail('ValidationException was not raised');
//    }
//    
//    public function testInstanceReturnsModel()
//    {
//        $response = $this->repo->instance();
//        $this->assertTrue($response instanceof Model);
//    }
//
//    public function testInstanceReturnsModelWithData()
//    {
//        $data = array(
//            'name' => 'Test WeightTicket'
//        );
//
//        $response = $this->repo->instance($data);
//        
//        $this->assertTrue($response instanceof Model);
//        $this->assertTrue($response->name === $data['name']);
//    }
    
}
