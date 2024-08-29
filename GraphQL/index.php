<?php
require_once 'vendor/autoload.php';
require_once 'src/Schema/ProductSchema.php';

use GraphQL\GraphQL;
use GraphQL\Type\Schema;
use App\Schema\ProductSchema;

// Set CORS headers
header('Access-Control-Allow-Origin: *'); // Allow all origins or specify your front-end URL
header('Access-Control-Allow-Methods: POST, OPTIONS'); // Allow POST and OPTIONS methods
header('Access-Control-Allow-Headers: Content-Type'); // Allow Content-Type header
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$schema = ProductSchema::createSchema();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'errors' => [
            'message' => 'Invalid JSON input'
        ]
    ]);
    exit;
}

$query = $input['query'];
$variableValues = $input['variables'] ?? null;

try {
    // Log the incoming query for debugging
    error_log("Received GraphQL query: " . $query);

    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray();
} catch (\Exception $e) {
    // Log the exception message
    error_log("GraphQL execution error: " . $e->getMessage());
    
    $output = [
        'errors' => [
            [
                'message' => $e->getMessage(),
            ],
        ],
    ];
}

echo json_encode($output);