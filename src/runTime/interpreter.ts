import { ValueTypes, Value } from "./values";
import { ASTNode, ASTNodeType } from "../frontEnd/ast";

const variables: Record<string, Value> = {}; // Variable storage

const BinaryOperators: Record<string, (left: Value, right: Value) => Value> = {
    "+": (left, right) => {
        return {
            type: ValueTypes.NUMBER,
            value: Number(left.value) + Number(right.value),
        };
    },
    "-": (left, right) => ({
        type: ValueTypes.NUMBER,
        value: Number(left.value) - Number(right.value),
    }),
    "*": (left, right) => ({
        type: ValueTypes.NUMBER,
        value: Number(left.value) * Number(right.value),
    }),
    "/": (left, right) => {
        if (Number(right.value) === 0) {
            throw new Error("Cannot divide by zero");
        }

        return {
            type: ValueTypes.NUMBER,
            value: Number(left.value) / Number(right.value),
        };
    },
};

export function interpret(node: ASTNode): Value {
    switch (node.type) {
        case ASTNodeType.PROGRAM: {
            let lastResult: Value | null = null;
            for (const child of node.children) {
                lastResult = interpret(child); // Execute each child
            }
            return lastResult || { type: ValueTypes.NULL, value: null };
        }

        case ASTNodeType.ASSIGNMENT: {
            const variableName = node.name;
            const value = interpret(node.value);
            console.log(`Variable ${variableName} to ${value.value}`);
            variables[variableName] = value; // Store variable
            return value;
        }

        case ASTNodeType.NUMBER:
            return {
                type: ValueTypes.NUMBER,
                value: Number(node.value),
            };

        case ASTNodeType.STRING:
            // Handle string node, return as a ValueTypes.STRING type
            return {
                type: ValueTypes.STRING,
                value: node.value,
            };

        case ASTNodeType.BINARYOPERATOR: {
            const left = interpret(node.left);
            const right = interpret(node.right);

            // Perform the operation using the hash map
            const operator = BinaryOperators[node.value];
            if (!operator) {
                throw new Error(`Unknown operator ${node.value}`);
            }
            return operator(left, right);
        }

        case ASTNodeType.COMMENT: {
            // Handle comment node, return as a ValueTypes.STRING type
            console.log("Comment: ",node.value);
            return { type: ValueTypes.STRING, value: node.value };
        }

        case ASTNodeType.LITERAL: {
            // Handle literal node, return as a ValueTypes.LITERAL type
            console.log("Literal: ",node.value);
            return { type: ValueTypes.LITERAL, value: String(variables[node.value].value) };
        }


        case ASTNodeType.WRITE: {
            let output = ""; // Initialize an empty string for the output
        
            // Loop through each child of the WRITE node
            for (const child of node.children) {
                const evaluatedChild = interpret(child); // Evaluate the child node
        
                // Check the type of the evaluated child and concatenate
                if (evaluatedChild.type === ValueTypes.STRING || evaluatedChild.type === ValueTypes.NUMBER || evaluatedChild.type === ValueTypes.LITERAL) {
                    output += String(evaluatedChild.value); // Concatenate the value to the output string
                } else if (evaluatedChild.type === ValueTypes.NULL) {
                    output += ""; // Add nothing if it's a NULL value
                } else {
                    throw new Error("WRITE can only handle strings, numbers, or literals.");
                }
            }
        
            console.log("Write:", output); // Log the final concatenated output
            return { type: ValueTypes.NULL, value: null }; // Return null as WRITE has no meaningful result
        }
        

        default:
            throw new Error(`Unknown node type ${node.type}`);
    }
}

