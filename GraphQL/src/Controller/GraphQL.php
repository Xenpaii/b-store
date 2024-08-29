<?php
namespace App\Controller;

use GraphQL\GraphQL as GraphQLBase;
use App\Schema\ProductSchema; // Include the schema class
use RuntimeException;
use Throwable;

class GraphQL {
    static public function handle()
    {
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        header('Content-Type: application/json; charset=UTF-8');

        try {
            $schema = ProductSchema::createSchema(); // Use the schema you created

            $rawInput = file_get_contents('php://input');
            if ($rawInput === false) {
                throw new RuntimeException('Failed to get php://input');
            }

            $input = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new RuntimeException('Invalid JSON input');
            }

            $query = $input['query'];
            $variableValues = $input['variables'] ?? null;

            $result = GraphQLBase::executeQuery($schema, $query, null, null, $variableValues);
            $output = $result->toArray();
        } catch (Throwable $e) {
            $output = [
                'errors' => [
                    [
                        'message' => $e->getMessage(),
                    ],
                ],
            ];
        }

        echo json_encode($output);
    }
}
