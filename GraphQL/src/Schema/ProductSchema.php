<?php
namespace App\Schema;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;


error_reporting(E_ALL);
ini_set('display_errors', 1);

class ProductSchema
{
    public static function createSchema()
    {
        
        $attributeItemType = new ObjectType([
            'name' => 'AttributeItem',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'displayValue' => Type::nonNull(Type::string()),
                'value' => Type::nonNull(Type::string()),
            ],
        ]);

        
        $attributeSetType = new ObjectType([
            'name' => 'AttributeSet',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'name' => Type::nonNull(Type::string()),
                'items' => Type::listOf($attributeItemType),
            ],
        ]);

        
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

        
        $orderType = new ObjectType([
            'name' => 'Order',
            'fields' => [
                'id' => Type::nonNull(Type::string()),
                'items' => Type::listOf(Type::string()), 
                'total' => Type::nonNull(Type::float()), 
                'createdAt' => Type::nonNull(Type::string()), 
            ],
        ]);

        
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

        
        $mutationType = new ObjectType([
            'name' => 'Mutation',
            'fields' => [
                'placeOrder' => [
                    'type' => $orderType,
                    'args' => [
                        'items' => Type::nonNull(Type::listOf(Type::string())), 
                        'total' => Type::nonNull(Type::float()), 
                    ],
                    'resolve' => function ($root, $args) {
    $mysqli = new \mysqli('sql.endora.cz', 'bloodlust', 'Scandi2', 'scandiweb', 3313);
    if ($mysqli->connect_error) {
        throw new \RuntimeException('Connection failed: ' . $mysqli->connect_error);
    }

    
    $itemsData = [];
    foreach ($args['items'] as $item) {
        
        $itemDetails = json_decode($item, true); 
        $itemName = $itemDetails['name']; 
        $itemAttributes = $itemDetails; 

        
        $itemEntry = ['name' => $itemName];

        foreach ($itemAttributes as $attrKey => $attrValue) {
            if ($attrKey === 'Color') {
                
                foreach ($itemAttributes['attributes'] as $attributeSet) {
                    if ($attributeSet['name'] === 'Color') {
                        foreach ($attributeSet['items'] as $colorItem) {
                            if ($colorItem['value'] === $attrValue) {
                                $itemEntry['Color'] = $colorItem['displayValue']; 
                                break 2; 
                            }
                        }
                    }
                }
            } else {
                $itemEntry[$attrKey] = $attrValue; 
            }
        }

        $itemsData[] = json_encode($itemEntry); 
    }

    $itemsJson = json_encode($itemsData); 

    $total = $args['total'];

    
    $stmt = $mysqli->prepare("INSERT INTO orders (items, total) VALUES (?, ?)");
    if (!$stmt) {
        throw new \RuntimeException('Prepare failed: ' . $mysqli->error);
    }

    $stmt->bind_param("sd", $itemsJson, $total); 
    if (!$stmt->execute()) {
        $errorMessage = 'SQL Error: ' . $stmt->error;
        error_log($errorMessage); 
        $stmt->close();
        $mysqli->close();
        throw new \RuntimeException($errorMessage);
    }

    $orderId = $stmt->insert_id; 
    $stmt->close();
    $mysqli->close();

    return [
        'id' => $orderId,
        'items' => $itemsData, 
        'total' => $total,
        'createdAt' => date('Y-m-d H:i:s'), 
    ];
},
                ],
            ],
        ]);

        return new Schema([
            'query' => $queryType, 
            'mutation' => $mutationType, 
        ]);
    }
}