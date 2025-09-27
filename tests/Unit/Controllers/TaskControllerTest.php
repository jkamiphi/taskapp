<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\TaskController;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected TaskController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->controller = new TaskController();
    }

    public function test_index_returns_paginated_user_tasks()
    {
        Task::factory()->count(3)->create(['user_id' => $this->user->id]);

        $otherUser = User::factory()->create();
        Task::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'completed', 'due_date', 'user_id', 'created_at', 'updated_at']
                ],
                'current_page',
                'per_page',
                'total'
            ]);
    }

    public function test_index_requires_authentication()
    {
        $response = $this->getJson('/api/tasks');
        $response->assertStatus(401);
    }

    public function test_show_fails_for_nonexistent_task()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/tasks/99999');

        $response->assertStatus(404);
    }

    public function test_destroy_deletes_user_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_destroy_fails_for_other_user_task()
    {
        $otherUser = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }
}
