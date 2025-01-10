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
    "+=": (left, right) => {
        return {
            type: ValueTypes.NUMBER,
            value: Number(left.value) + Number(right.value),
        };
    },

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

const ComparisonOperators: Record<string, (left: Value, right: Value) => Value> = {
    "==": (left, right) => {
        return {
            type: ValueTypes.BOOLEAN,
            value: left.value === right.value,
        };
    },
    "!=": (left, right) => ({
        type: ValueTypes.BOOLEAN,
        value: left.value !== right.value,
    }),
    "<": (left, right) => ({
        type: ValueTypes.BOOLEAN,
        value: left.value !== null && right.value !== null && left.value < right.value,
    }),
    ">": (left, right) => ({
        type: ValueTypes.BOOLEAN,
        value: left.value !== null && right.value !== null && left.value > right.value,
    }),
    "<=": (left, right) => ({
        type: ValueTypes.BOOLEAN,
        value: left.value !== null && right.value !== null && left.value <= right.value,
    }),
    ">=": (left, right) => ({
        type: ValueTypes.BOOLEAN,
        value: left.value !== null && right.value !== null && left.value >= right.value,
    }),
};

let loopDepth = 0;
let blockDepth = 0;

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
            const number = parseFloat(node.value); // Convert string to number
            return {
                type: ValueTypes.NUMBER,
                value: Number(number),
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

        case ASTNodeType.FOR: {
            console.log("Interpreting FOR loop initialization");
            console.log("Node Initialization: ", node.initialization);
            console.log("Node Condition: ", node.condition);
            console.log("Node Increment: ", node.increment);
            console.log("Node Body: ", node.body);
        
            interpret(node.initialization); // Initialize the loop variable
        
            // Start with the loop body
            let conditionResult = interpret(node.condition);
            console.log("Initial Condition result: ", conditionResult);
        
            loopDepth++; // Increment the loop depth
            console.log("Loop Depth: ", loopDepth);
            try {
                // Execute the loop as long as the condition is false
                while (conditionResult.value == true) {
                    console.log("Interpreting FOR loop body");
                    const bodyResult = interpret(node.body); // Execute the loop body
                
                    if (bodyResult.type === ValueTypes.BREAK) {
                        console.log("INSIDE LOOP BREAK statement encountered");
                        break; // Exit the loop if a BREAK statement was encountered
                    }

                    console.log("Interpreting FOR loop increment");
                    interpret(node.increment); // Increment the loop variable
            
                    // Reevaluate the condition after the increment
                    conditionResult = interpret(node.condition);
                    console.log("Updated Condition result: ", conditionResult);

                
                }
            }
            finally {
                loopDepth--; // Decrement the loop depth
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as FOR has no meaningful result
        }

        case ASTNodeType.IF: {
            console.log("Interpreting IF condition");
            const conditionResult = interpret(node.condition); // Evaluate the condition
        
            if (conditionResult.value === true) {
                console.log("Interpreting IF body");
                interpret(node.body); // Execute the body if the condition is true
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as IF has no meaningful result
        }

        case ASTNodeType.ELSE: {
            console.log("Interpreting ELSE body");
            interpret(node.body); // Execute the body
        
            return { type: ValueTypes.NULL, value: null }; // Return null as ELSE has no meaningful result
        }

        case ASTNodeType.IFELSE: {
            console.log("Interpreting IF condition");
            const conditionResult = interpret(node.condition); // Evaluate the condition
        
            if (conditionResult.value === true) {
                console.log("Interpreting IF body");
                interpret(node.body); // Execute the body if the condition is true
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as IF has no meaningful result
        }

        case ASTNodeType.COMPARISONOPERATOR: {
            if (node.left.type !== ASTNodeType.LITERAL) {
                throw new Error("Left side of comparison must be a literal");
            }
        
            const leftVariableName = node.left.value; // This should be the name of the variable, e.g., 'X'
            const leftVariable = variables[leftVariableName]; // Retrieve the variable's value from the variables table
        
            if (!leftVariable) {
                throw new Error(`Variable '${leftVariableName}' is not defined.`);
            }
        
            // Ensure the left variable is a number
            if (leftVariable.type !== ValueTypes.NUMBER) {
                throw new Error(`Left side of comparison must be a number`);
            }
        
            // Resolve the right side of the comparison
            let rightValue: number;

            // Check if the right side is a literal or a number
            if (node.right.type === ASTNodeType.LITERAL) {
                
                const rightVariableName = node.right.value; // This should be the name of the variable, e.g., 'X'
                const rightVariable = variables[rightVariableName]; // Retrive the variable's value from the variables table

                if (!rightVariable) {
                    throw new Error(`Variable '${rightVariableName}' is not defined.`);
                }

                if (rightVariable.type !== ValueTypes.NUMBER) {
                    throw new Error(`Right side of comparison must be a number`);
                }

                rightValue = rightVariable.value;
            } else if (node.right.type === ASTNodeType.NUMBER) {
                rightValue = parseFloat(node.right.value); // Convert string to number
            } else {
                throw new Error("Right side of comparison must be a number or a literal");
            }
            
        
            // Extract the comparison operator
            const operator = ComparisonOperators[node.value];
        
            if (!operator) {
                throw new Error(`Unknown comparison operator ${node.value}`);
            }
        
            // Perform the comparison
            const result = operator(leftVariable, { type: ValueTypes.NUMBER, value: rightValue });
        
            return result;
        }
        

        case ASTNodeType.UNITARYOPERATOR: {
            // Ensure `node.left` is a `LITERAL` node
            if (node.left.type !== ASTNodeType.LITERAL) {
                throw new Error(`Expected LITERAL node on the left, got ${node.left.type}`);
            }
        
            // Extract the variable name from the LITERAL node
            const variableName = node.left.value; // This should be the name of the variable, e.g., 'X'
        
        
            // Retrieve the variable's value from the variables table
            const variableEntry = variables[variableName];
            if (!variableEntry) {
                throw new Error(`Variable '${variableName}' is not defined.`);
            }
        
            // Ensure the variable's value is a number for unitary operations
            if (typeof variableEntry.value !== "number") {
                throw new Error(`Unitary operation '${node.value}' is not valid for non-numeric variable '${variableName}'.`);
            }
        
            // Apply the unitary operation
            switch (node.value) {
                case "++":
                    variableEntry.value++;
                    break;
                case "--":
                    variableEntry.value--;
                    break;
                default:
                    throw new Error(`Unknown unitary operator '${node.value}'`);
            }
        
            // Return a null value since unitary operators usually don't produce a new value
            return { type: ValueTypes.NULL, value: null };
        }
        

        case ASTNodeType.BLOCK: {
            blockDepth++; // Increment the block depth
            console.log("Block Depth: ", blockDepth);
            // Check if the block has children (it's possible that children can be null)
            if (node.children) {
                let lastResult: Value | null = null;
        
                // Iterate over each child node in the block and interpret them
                for (const child of node.children) {
                    console.log("Interpreting block child");
                    const result = lastResult = interpret(child); // Interpret each child node in the block

                    if (result.type === ValueTypes.BREAK) {
                        console.log("BREAK statement encountered on block");
                        blockDepth--; // Decrement the block depth
                        return result; // Return the BREAK statement
                    }
                    lastResult = result;
                }
                blockDepth--; // Decrement the block depth
        
                // Return the last result of the block, or null if there was no result
                return lastResult || { type: ValueTypes.NULL, value: null };
            }
            blockDepth--; // Decrement the block depth
            // If no children (null or undefined), return null as the block has no effect
            return { type: ValueTypes.NULL, value: null };
        }

        case ASTNodeType.BREAK: {
            if (loopDepth === 0 && blockDepth === 0) {
                throw new Error("BREAK statement must be inside a loop");
            }
            return { type: ValueTypes.BREAK, value: null };
        }

        
        
        default:
            throw new Error(`Unknown node type ${node.type}`);
    }
}

