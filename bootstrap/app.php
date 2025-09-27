<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->use([
            HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                $statusCode = 500;

                if ($e instanceof HttpResponseException) {
                    $statusCode = $e->getResponse()->getStatusCode();
                } elseif ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                } elseif ($e instanceof ValidationException) {
                    $statusCode = 422;
                } elseif ($e instanceof AuthenticationException) {
                    $statusCode = 401;
                } elseif ($e instanceof AuthorizationException) {
                    $statusCode = 403;
                } elseif ($e instanceof NotFoundHttpException) {
                    $statusCode = 404;
                }

                return response()->json([
                    'message' => $e->getMessage(),
                ], $statusCode);
            }
        });
    })->create();
