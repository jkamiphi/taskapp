<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->tasks();

        if ($request->filled('completed')) $query->where('completed', filter_var($request->completed, FILTER_VALIDATE_BOOLEAN));
        if ($request->filled('title')) $query->where('title', 'like', '%' . $request->title . '%');

        if (in_array($request->sort ?? '', ['due_date', 'created_at'])) {
            $query->orderBy($request->sort, $request->dir === 'asc' ? 'asc' : 'desc');
        }

        return $query->paginate($request->integer('per_page', 10));
    }

    public function store(CreateTaskRequest $request)
    {
        $data = $request->validated();

        $task = $request->user()->tasks()->create($data);

        return response()->json($task, 201);
    }

    public function show(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        return response()->json($task);
    }

    public function update(UpdateTaskRequest $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);

        $data = $request->validated();

        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        $task->delete();

        return response()->json(null, 204);
    }
}
