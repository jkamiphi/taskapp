<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_task_title_is_required_for_creation(): void
    {
        $taskData = [
            'description' => 'Task without title',
            'due_date' => '2025-12-31',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'The title field is required.'
        ]);
    }

    public function test_task_description_must_be_string_when_provided(): void
    {
        $taskData = [
            'title' => 'Valid Title',
            'description' => ['array' => 'instead of string'],
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'The description field must be a string.'
        ]);
    }
}
