<?php

namespace Tests\Unit\Models;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_many_tasks()
    {
        $user = User::factory()->create();
        $task1 = Task::factory()->create(['user_id' => $user->id]);
        $task2 = Task::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->tasks()->exists());
        $this->assertCount(2, $user->tasks);
        $this->assertTrue($user->tasks->contains($task1));
        $this->assertTrue($user->tasks->contains($task2));
    }

    public function test_user_can_be_created_with_valid_data()
    {
        $userData = [
            'nickname' => 'johndoe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $user = User::create($userData);

        $this->assertDatabaseHas('users', [
            'nickname' => 'johndoe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com'
        ]);

        $this->assertInstanceOf(User::class, $user);
    }

    public function test_user_can_create_api_tokens()
    {
        $user = User::factory()->create();

        $token = $user->createToken('test-token');

        $this->assertNotNull($token->plainTextToken);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'test-token'
        ]);
    }

    public function test_user_nickname_is_required()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123'
        ]);
    }
}
