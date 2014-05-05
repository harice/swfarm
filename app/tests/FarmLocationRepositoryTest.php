<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Description of FarmLocationRepositoryTest
 *
 * @author Das
 */
class FarmLocationRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('FarmLocationRepository');
        
        Artisan::call('migrate');
        $this->seed();
    }
    
    public function testFindAllReturnsCollection()
    {
        $response = $this->repo->findAll('foo');
        $this->assertTrue($response instanceof Collection);
    }
    
    public function testFindByIdReturnsModel()
    {
        $response = $this->repo->findById(1);
        $this->assertTrue($response instanceof Model);
    }
    
    public function testStoreReturnsModel()
    {
        $data = array(
            'locationnumber' => 'L999',
            'status' => 1
        );

        $response = $this->repo->store($data);

        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->locationnumber === $data['locationnumber']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'locationnumber' => 'L999',
            'status' => 0
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->locationnumber === $data['locationnumber']);
    }
    
    public function testDestroySaves()
    {
        $model = $this->repo->destroy(1);
        $this->assertTrue($model instanceof Model);
        
        try
        {
            $this->repo->findById(1);
        }
        catch (NotFoundException $e)
        {
            return;
        }

        // $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'locationnumber' => 'L998',
            'status' => 1
        );
        
        $response = $this->repo->validate($data);
        $this->assertTrue($response);
    }
    
    public function testValidateFails()
    {
        $data = array(
            'locationnumber' => 'L001'
        );
        
        try {
            $this->repo->validate($data);
        }
        catch(ValidationException $expected)
        {
            return;
        }

        $this->fail('ValidationException was not raised');
    }
    
    public function testInstanceReturnsModel()
    {
        $response = $this->repo->instance();
        $this->assertTrue($response instanceof Model);
    }

    public function testInstanceReturnsModelWithData()
    {
        $data = array(
            'locationnumber' => 'L001',
            'status' => 1
        );

        $response = $this->repo->instance($data);
        
        $this->assertTrue($response instanceof Model);
        $this->assertTrue($response->locationnumber === $data['locationnumber']);
    }
    
}
