<?php

namespace Tests\Unit\Models;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_belongs_to_user()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $task->user);
        $this->assertEquals($user->id, $task->user->id);
        $this->assertEquals($user->email, $task->user->email);
    }

    public function test_task_can_be_created_with_valid_data()
    {
        $user = User::factory()->create();

        $taskData = [
            'user_id' => $user->id,
            'title' => 'Test Task',
            'description' => 'This is a test task',
            'completed' => false,
            'due_date' => '2025-12-31'
        ];

        $task = Task::create($taskData);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Test Task',
            'description' => 'This is a test task',
            'completed' => false
        ]);

        $this->assertInstanceOf(Task::class, $task);
    }
}
