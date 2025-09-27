<?php

namespace App\Services;

use Gemini\Laravel\Facades\Gemini;
use Exception;

class GeminiTaskService
{
  /**
   * Create tasks using Gemini API
   *
   * @param string $topic
   * @return array<int, array{title: string, description: string}>
   * @throws Exception
   */
  public function generateTasks(string $topic): array
  {
    try {
      $prompt = <<<PROMPT
Genera una lista de tareas en formato JSON para el siguiente tema: "$topic".
Cada tarea debe tener dos campos:
- "title": un título breve de la tarea
- "description": una explicación corta de la tarea.

Devuelve SOLO el JSON válido, sin explicaciones adicionales.

IMPORTANTE: Asegúrate de que el JSON esté correctamente formateado. El formato debe ser:
[
  {
    "title": "Título de la tarea 1",
    "description": "Descripción de la tarea 1"
  },
  {
    "title": "Título de la tarea 2",
    "description": "Descripción de la tarea 2"
  }
]
  // Más tareas...
No incluyas ningún otro texto fuera del JSON.
PROMPT;

      $response = Gemini::generativeModel(config('gemini.default_model', 'gemini-2.5-flash-lite'))
        ->generateContent($prompt);

      $raw = $response->text();

      if (empty($raw)) {
        throw new Exception('Respuesta vacía de Gemini API');
      }

      Logger()->info('Gemini response', ['response' => $raw]);

      $jsonContent = $this->extractJsonFromMarkdown($raw);

      if (empty($jsonContent)) {
        throw new Exception('No se pudo extraer contenido JSON de la respuesta');
      }

      $tasks = json_decode($jsonContent, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        $error = json_last_error_msg();
        Logger()->error('JSON decode error', [
          'error' => $error,
          'content' => $jsonContent,
          'topic' => $topic
        ]);
        throw new Exception("Error al decodificar JSON: {$error}");
      }

      if (!is_array($tasks)) {
        throw new Exception('La respuesta no contiene un array válido de tareas');
      }

      // Validar estructura de las tareas
      foreach ($tasks as $index => $task) {
        if (!isset($task['title']) || !isset($task['description'])) {
          Logger()->warning('Tarea con estructura inválida', [
            'index' => $index,
            'task' => $task,
            'topic' => $topic
          ]);
          throw new Exception("Tarea en índice {$index} no tiene la estructura requerida");
        }
      }

      return $tasks;
    } catch (Exception $e) {
      Logger()->error('Error generando tareas', [
        'error' => $e->getMessage(),
        'topic' => $topic,
        'trace' => $e->getTraceAsString()
      ]);

      // Re-lanzar la excepción para que el controlador pueda manejarla
      throw new Exception("Error al generar tareas para el tema '{$topic}': " . $e->getMessage(), 0, $e);
    }
  }

  /**
   * Extract JSON content from Markdown code blocks
   *
   * @param string $text
   * @return string
   */
  private function extractJsonFromMarkdown(string $text): string
  {
    if (preg_match('/```(?:json)?\s*\n(.*?)\n```/s', $text, $matches)) {
      return trim($matches[1]);
    }

    return trim($text);
  }
}
