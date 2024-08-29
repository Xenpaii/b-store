<?php
namespace App\Schema;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

class ProductSchema
{
    public static function createSchema()
    {
        // Define the AttributeItem type
        $attributeItemType = new ObjectType([
            'name' => 'AttributeItem',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'displayValue' => Type::nonNull(Type::string()),
                'value' => Type::nonNull(Type::string()),
            ],
        ]);

        // Define the AttributeSet type
        $attributeSetType = new ObjectType([
            'name' => 'AttributeSet',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'name' => Type::nonNull(Type::string()),
                'items' => Type::listOf($attributeItemType),
            ],
        ]);

        // Define the Product type
        $productType = new ObjectType([
            'name' => 'Product',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'name' => Type::nonNull(Type::string()),
                'description' => Type::string(),
                'category' => Type::nonNull(Type::string()),
                'price' => Type::nonNull(Type::string()),
                'gallery' => Type::listOf(Type::string()),
                'in_stock' => Type::nonNull(Type::boolean()),
                'attributes' => Type::listOf($attributeSetType),
            ],
        ]);

        // Define the Order type
        $orderType = new ObjectType([
            'name' => 'Order',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'items' => Type::listOf(Type::string()), // List of item details including attributes
                'total' => Type::nonNull(Type::float()), // Total price
                'createdAt' => Type::nonNull(Type::string()), // Creation date
            ],
        ]);

        // Define the Query type
        $queryType = new ObjectType([
            'name' => 'Query',
            'fields' => [
                'products' => [
                    'type' => Type::listOf($productType),
                    'resolve' => function ($root, $args) {
                        $mysqli = new \mysqli('sql.endora.cz', 'bloodlust', 'Scandi2', 'scandiweb', 3313);
                        if ($mysqli->connect_error) {
                            throw new \RuntimeException('Connection failed: ' . $mysqli->connect_error);
                        }

                        $sql = "SELECT id, name, category, 
                                       JSON_UNQUOTE(JSON_EXTRACT(prices, '$[0].amount')) AS price, 
                                       gallery, 
                                       in_stock,
                                       attributes,
                                       description
                                FROM products";

                        $result = $mysqli->query($sql);
                        if (!$result) {
                            throw new \RuntimeException('SQL Error: ' . $mysqli->error);
                        }

                        $products = [];
                        while ($row = $result->fetch_assoc()) {
                            $gallery = json_decode($row['gallery']);
                            $attributes = json_decode($row['attributes'], true);

                            $products[] = [
                                'id' => $row['id'],
                                'name' => $row['name'],
                                'description' => $row['description'],
                                'category' => $row['category'],
                                'price' => $row['price'] !== null ? $row['price'] : '0.00',
                                'gallery' => $gallery,
                                'in_stock' => (bool)$row['in_stock'],
                                'attributes' => $attributes,
                            ];
                        }
                        $mysqli->close();
                        return $products;
                    },
                ],
            ],
        ]);

        // Define the Mutation type
        $mutationType = new ObjectType([
            'name' => 'Mutation',
            'fields' => [
                'placeOrder' => [
                    'type' => $orderType,
                    'args' => [
                        'items' => Type::nonNull(Type::listOf(Type::string())), // List of item details
                        'total' => Type::nonNull(Type::float()), // Total price
                    ],
                    'resolve' => function ($root, $args) {
            $mysqli = new \mysqli('sql.endora.cz', 'bloodlust', 'Scandi2', 'scandiweb', 3313);
    if ($mysqli->connect_error) {
        throw new \RuntimeException('Connection failed: ' . $mysqli->connect_error);
    }

    // Prepare items data including attributes
    $itemsData = [];
    foreach ($args['items'] as $item) {
        // Assuming item is an object with id and attributes
        $itemDetails = json_decode($item, true); // Decode the item JSON
        $itemName = $itemDetails['name']; // Extract item name
        $itemAttributes = $itemDetails; // Use all attributes directly

        // Create a structured object for the order
        $itemEntry = ['name' => $itemName];

        foreach ($itemAttributes as $attrKey => $attrValue) {
            if ($attrKey === 'Color') {
                // Find the color name in the attributes
                foreach ($itemAttributes['attributes'] as $attributeSet) {
                    if ($attributeSet['name'] === 'Color') {
                        foreach ($attributeSet['items'] as $colorItem) {
                            if ($colorItem['value'] === $attrValue) {
                                $itemEntry['Color'] = $colorItem['displayValue']; // Use the display value for the color
                                break 2; // Break out of both loops
                            }
                        }
                    }
                }
            } else {
                $itemEntry[$attrKey] = $attrValue; // Add other attributes to the item entry
            }
        }

        $itemsData[] = json_encode($itemEntry); // Convert each item entry to JSON
    }

    $itemsJson = json_encode($itemsData); // Convert all items to JSON

    $total = $args['total'];

    // Use prepared statements to prevent SQL injection
    $stmt = $mysqli->prepare("INSERT INTO orders (items, total) VALUES (?, ?)");
    if (!$stmt) {
        throw new \RuntimeException('Prepare failed: ' . $mysqli->error);
    }

    $stmt->bind_param("sd", $itemsJson, $total); // Bind parameters
    if (!$stmt->execute()) {
        $errorMessage = 'SQL Error: ' . $stmt->error;
        error_log($errorMessage); // Log the error message
        $stmt->close();
        $mysqli->close();
        throw new \RuntimeException($errorMessage);
    }

    $orderId = $stmt->insert_id; // Get the ID of the newly created order
    $stmt->close();
    $mysqli->close();

    return [
        'id' => $orderId,
        'items' => $itemsData, // Return the items data
        'total' => $total,
        'createdAt' => date('Y-m-d H:i:s'), // Current timestamp
    ];
},
                ],
            ],
        ]);

        return new Schema([
            'query' => $queryType, // Include the query type
            'mutation' => $mutationType, // Include the mutation type
        ]);
    }
}