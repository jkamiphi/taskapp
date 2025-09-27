<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskDatabaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_can_be_stored_in_database(): void
    {
        $user = User::factory()->create();

        $taskData = [
            'title' => 'Test Task',
            'description' => 'This is a test task description',
            'due_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'completed' => false,
        ];

        $task = $user->tasks()->create($taskData);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'user_id' => $user->id,
            'title' => 'Test Task',
            'description' => 'This is a test task description',
            'completed' => false,
        ]);

        $retrievedTask = Task::find($task->id);
        $this->assertNotNull($retrievedTask);
        $this->assertEquals($taskData['title'], $retrievedTask->title);
        $this->assertEquals($taskData['description'], $retrievedTask->description);
        $this->assertEquals($user->id, $retrievedTask->user_id);
    }
}
