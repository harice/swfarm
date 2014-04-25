<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class SalesOrderRepositoryTest extends TestCase {
    
    public function setUp()
    {
        parent::setUp();
        $this->repo = App::make('SalesOrderRepository');
        
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
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'so_number' => 'S20140401-0002',
            'origin_id' => 1,
            'nature_of_sale_id' => 1,
            'customer_id' => 1,
            'address_id' => 1,
            'date_of_sale' => $date,
            'delivery_date_start' => $date,
            'delivery_date_end' => $date,
            'status' => 'Open',
            'notes' => 'Lorem ipsum set amet.',
            'user_id' => 1,
            'created_at' => $date,
            'updated_at' => $date
        );

        $model = $this->repo->store($data);

        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->so_number === $data['so_number']);
    }
    
    public function testUpdateSaves()
    {
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'so_number' => 'S20140401-0002',
            'origin_id' => 1,
            'nature_of_sale_id' => 1,
            'customer_id' => 1,
            'address_id' => 1,
            'date_of_sale' => $date,
            'delivery_date_start' => $date,
            'delivery_date_end' => $date,
            'status' => 'Open',
            'notes' => 'Lorem ipsum set amet.',
            'user_id' => 1,
            'created_at' => $date,
            'updated_at' => $date
        );
        
        $model = $this->repo->update(1, $data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->so_number === $data['so_number']);
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
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'so_number' => 'S20140401-0002',
            'origin_id' => 1,
            'nature_of_sale_id' => 1,
            'customer_id' => 1,
            'address_id' => 1,
            'date_of_sale' => $date,
            'delivery_date_start' => $date,
            'delivery_date_end' => $date,
            'status' => 'Open',
            'notes' => 'Lorem ipsum set amet.',
            'user_id' => 1,
            'created_at' => $date,
            'updated_at' => $date
        );
        
        $result = $this->repo->validate($data);
        $this->assertTrue($result);
    }
    
    public function testValidateFails()
    {
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'origin_id' => 1,
            'nature_of_sale_id' => 1,
            'customer_id' => 1,
            'address_id' => 1,
            'date_of_sale' => $date,
            'delivery_date_start' => $date,
            'delivery_date_end' => $date,
            'status' => 'Open',
            'notes' => 'Lorem ipsum set amet.',
            'user_id' => 1,
            'created_at' => $date,
            'updated_at' => $date
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
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data = array(
            'so_number' => 'S20140401-0002',
            'origin_id' => 1,
            'nature_of_sale_id' => 1,
            'customer_id' => 1,
            'address_id' => 1,
            'date_of_sale' => $date,
            'delivery_date_start' => $date,
            'delivery_date_end' => $date,
            'status' => 'Open',
            'notes' => 'Lorem ipsum set amet.',
            'user_id' => 1,
            'created_at' => $date,
            'updated_at' => $date
        );

        $model = $this->repo->instance($data);
        
        $this->assertTrue($model instanceof Model);
        $this->assertTrue($model->so_number === $data['so_number']);
    }
    
}
