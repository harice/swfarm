<?php

class TestCase extends Illuminate\Foundation\Testing\TestCase {

    public function tearDown()
    {
        Mockery::close();
        // Artisan::call('migrate:reset');
    }
    
	/**
	 * Creates the application.
	 *
	 * @return \Symfony\Component\HttpKernel\HttpKernelInterface
	 */
	public function createApplication()
	{
		$unitTesting = true;

		$testEnvironment = 'testing';

		return require __DIR__.'/../../bootstrap/start.php';
	}
    
    public function assertRequestOk()
    {
        $this->assertTrue($this->client->getResponse()->isOk());
    }

}
