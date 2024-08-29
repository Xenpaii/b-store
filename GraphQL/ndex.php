<?php
require_once 'vendor/autoload.php';
require_once 'src/Schema/ProductSchema.php';

use GraphQL\GraphQL;
use GraphQL\Type\Schema;
use App\Schema\ProductSchema;

// Set CORS headers
header("Access-Control-Allow-Origin: *"); // Allow all origins
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow specific methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers

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
    echo json_encode(['errors' => ['message' => 'Invalid JSON input']]);
    exit;
}

$query = $input['query'];
$variableValues = $input['variables'] ?? null;

try {
    // Execute the query
    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray();
} catch (\Exception $e) {
    // Return the raw error message
    http_response_code(500);
    echo json_encode(['errors' => [['message' => $e->getMessage()]]]);
    exit;
}

// Return the output as JSON
echo json_encode($output);