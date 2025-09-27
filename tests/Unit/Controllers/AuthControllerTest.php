<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected AuthController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new AuthController();
    }

    public function test_register_creates_user_with_valid_data()
    {
        $requestData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ];

        $response = $this->postJson('/api/register', $requestData);

        // print response
        echo $response->getContent();


        $response->assertStatus(201)
            ->assertJson(['message' => 'User registered successfully']);

        $this->assertDatabaseHas('users', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'nickname' => 'john.doe'
        ]);
    }

    public function test_generate_nickname_with_existing_nickname()
    {
        User::factory()->create(['nickname' => 'jane.smith']);
        User::factory()->create(['nickname' => 'jane.smith1']);

        $method = new \ReflectionMethod(AuthController::class, 'generateNickname');
        $method->setAccessible(true);

        $nickname = $method->invoke($this->controller, 'Jane', 'Smith');
        $this->assertEquals('jane.smith2', $nickname);
    }
}
