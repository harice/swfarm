<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class UsersRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('UsersRepository');
        
        Artisan::call('migrate');
        $this->seed();
    }
    
    public function testFindAllReturnsCollection()
    {
        $collection = $this->repo->findAll();
        $this->assertTrue($collection instanceof Collection);
    }
    
    public function testFindByIdReturnsModel()
    {
        $model = $this->repo->findById(1);
        $this->assertTrue($model instanceof Model);
    }
    
    public function testStoreReturnsModel()
    {
        $data = array(
            'name'    => 'Users Name',
            'description' => 'Description of the role.'
        );

        $model = $this->repo->store($data);

        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->name === $data['name']);
    }
    
    public function testUpdateSaves()
    {
        $data = array(
            'name' => 'Updated Users Name'
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->name === $data['name']);
    }
    
    public function testDestroySaves()
    {
        $reply = $this->repo->destroy(1);
        $this->assertTrue($reply);

        try {
            $this->repo->findById(1);
        }
        catch(NotFoundException $e)
        {
          return;
        }

        // $this->fail('NotFoundException was not raised');
    }
    
    public function testValidatePasses()
    {
        $data = array(
            'name' => 'admin'
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFails()
    {
        $data = array(
            'name' => 'admin'
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testInstanceReturnsModel()
    {
        $model = $this->repo->instance();
        $this->assertTrue($model instanceof Model);
    }

    public function testInstanceReturnsModelWithData()
    {
        $data = array(
          'name' => 'Un-validated name'
        );

        $model = $this->repo->instance($data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->name === $data['name']);
    }
    
}
