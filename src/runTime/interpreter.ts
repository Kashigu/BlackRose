import { ValueTypes, Value } from "./values";
import { ASTNode, ASTNodeType } from "../frontEnd/ast";
import { DeclaredVariables } from "./semantic";

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
let hasExecuted = false; // Flag to check if the if statement has been executed
let matchFound = false; // Flag to check if a match was found in the switch statement

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


        case ASTNodeType.VARIABLEDECLARATION: {
            const variableName = node.name;
            const value = interpret(node.value);
            variables[variableName] = value;
            console.log(`Variable '${variableName}' created with value ${value.value}`);
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
            return { type: ValueTypes.WRITE, value: null }; // Return null as WRITE has no meaningful result
        }
        
        case ASTNodeType.WHILE: {
            console.log("Interpreting WHILE loop condition");
            let conditionResult = interpret(node.condition); // Evaluate the condition
        
            loopDepth++; // Increment the loop depth
            try {
                // Execute the loop as long as the condition is true
                while (conditionResult.value === true) {
                    console.log("Interpreting WHILE loop body");
                    const result = interpret(node.body); // Execute the loop body
        
                    if (result.type === ValueTypes.BREAK) {
                        console.log("INSIDE LOOP BREAK statement encountered");
                        break; // Exit the loop if a BREAK statement was encountered
                    }

                    if (result.type === ValueTypes.CONTINUE) {
                        console.log("INSIDE LOOP CONTINUE statement encountered");
                        conditionResult = interpret(node.condition); // Reevaluate the condition
                        continue; // Skip the rest of the loop body if a CONTINUE statement was encountered
                    }
        
                    conditionResult = interpret(node.condition); // Reevaluate the condition
                }
            } finally {
                loopDepth--; // Decrement the loop depth
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as WHILE has no meaningful result
        }

        case ASTNodeType.FOR: {
            console.log("Interpreting FOR loop initialization");        
            interpret(node.initialization); // Initialize the loop variable
        
            // Start with the loop body
            let conditionResult = interpret(node.condition);
            console.log("Initial Condition result: ", conditionResult);
        
            loopDepth++; // Increment the loop depth
            try {
                // Execute the loop as long as the condition is true
                while (conditionResult.value == true) {
                    console.log("Interpreting FOR loop body");

                    const bodyResult = interpret(node.body); // Execute the loop body
        
                    if (bodyResult.type === ValueTypes.BREAK) {
                        console.log("INSIDE LOOP BREAK statement encountered");
                        break; // Exit the loop if a BREAK statement was encountered
                    }

                    
        
                    console.log("Interpreting FOR loop increment");
                    interpret(node.increment); // Increment the loop variable
        

                    if (bodyResult.type === ValueTypes.CONTINUE) {
                        console.log("INSIDE LOOP CONTINUE statement encountered");
                        conditionResult = interpret(node.condition); // Reevaluate the condition
                        console.log("Updated Condition result: ", conditionResult);
                        continue; // Skip the rest of the loop body if a CONTINUE statement was encountered
                    }
                    // Reevaluate the condition after the increment
                    conditionResult = interpret(node.condition);
                    console.log("Updated Condition result: ", conditionResult);
                }
            } finally {
                loopDepth--; // Decrement the loop depth
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as FOR has no meaningful result
        }

        case ASTNodeType.IF: {
            if (hasExecuted) {
                return { type: ValueTypes.NULL, value: null }; // Skip this IF if another block was already executed
            }
            console.log("Interpreting IF condition");
            const conditionResult = interpret(node.condition); // Evaluate the condition
        
            if (conditionResult.value === true) {
                
                const result = interpret(node.body); // Execute the body if the condition is true
                hasExecuted = true; // Set the flag to true to skip other blocks

                if (result.type === ValueTypes.BREAK || result.type === ValueTypes.CONTINUE) {
                    return result; // Propagate BREAK if encountered
                }
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as IF has no meaningful result
        }

        case ASTNodeType.ELSE: {
            if (hasExecuted) {
                return { type: ValueTypes.NULL, value: null }; // Skip this IF if another block was already executed
            }

            console.log("Interpreting ELSE body");
            const result = interpret(node.body); // Execute the body

            hasExecuted = true; // Set the flag to true to skip other blocks

            if (result.type === ValueTypes.BREAK || result.type === ValueTypes.CONTINUE) {
                return result; // Propagate BREAK if encountered
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as ELSE has no meaningful result
        }

        case ASTNodeType.IFELSE: {
            if (hasExecuted) {
                return { type: ValueTypes.NULL, value: null }; // Skip this IF if another block was already executed
            }

            console.log("Interpreting IF condition");
            const conditionResult = interpret(node.condition); // Evaluate the condition
        
            if (conditionResult.value === true) {

                console.log("Interpreting IF body");
                const result = interpret(node.body); // Execute the body if the condition is true
                
                hasExecuted = true; // Set the flag to true to skip other blocks

                if (result.type === ValueTypes.BREAK || result.type === ValueTypes.CONTINUE) {
                    return result; // Propagate BREAK if encountered
                }
            }
        
            return { type: ValueTypes.NULL, value: null }; // Return null as IF has no meaningful result
        }

        case ASTNodeType.LOGICALOPERATOR: {

            console.log("Evaluating Logical Operator: ", node.value);

            // Recursively evaluate `node.left` and `node.right`
            const leftResult = interpret(node.left);
            const rightResult = interpret(node.right);

            console.log("Left result: ", leftResult);
            console.log("Right result: ", rightResult);
        
            // Ensure the results are booleans
            if (leftResult.type !== ValueTypes.BOOLEAN || rightResult.type !== ValueTypes.BOOLEAN) {
                throw new Error(
                    `Logical operation '${node.value}' requires boolean operands, got ${leftResult.type} and ${rightResult.type}.`
                );
            }
        
            // Perform the logical operation
            switch (node.value) {
                case "&&":
                    return {
                        type: ValueTypes.BOOLEAN,
                        value: leftResult.value && rightResult.value,
                    };
                case "||":
                    return {
                        type: ValueTypes.BOOLEAN,
                        value: leftResult.value || rightResult.value,
                    };
                default:
                    throw new Error(`Unknown logical operator '${node.value}'`);
            }
        }
        

        /*
            Comparison Operator
            It checks the left side if it is a boolean, literal or a number
            If it is a boolean, it returns true
            If it is a literal, it checks if it is a boolean and returns true
            If it is a number, it checks if the right side is a literal or a number
            If it is a literal, it checks if the right side is a literal or a number
            Returns the result of the comparison
        */
        case ASTNodeType.COMPARISONOPERATOR: {
            
            if (node.left.type === ASTNodeType.TRUE) {
                
                return { type: ValueTypes.BOOLEAN, value: true };

            }else if(node.left.type === ASTNodeType.LITERAL && variables[node.left.value].type === ValueTypes.BOOLEAN){
                if (variables[node.left.value].value === false){
                    throw new Error("It cannot be false");
                }
                return { type: ValueTypes.BOOLEAN, value: true };
            }else{
                
                if (node.left.type !== ASTNodeType.LITERAL && node.left.type !== ASTNodeType.NUMBER) {
                    throw new Error("Left side of comparison must be a literal or a number");
                }
                
                let leftValue: number = 0;
                if (node.left.type === ASTNodeType.LITERAL) {

                    const leftVariableName = node.left.value; // This should be the name of the variable, e.g., 'X'
                    const leftVariable = variables[leftVariableName]; // Retrieve the variable's value from the variables table
                
                    // This is to check if the variable exist on the table of literals
                    if (!leftVariable) {
                        throw new Error(`Variable '${leftVariableName}' is not defined.`);
                    }
                
                    // Ensure the left variable is a number
                    if (leftVariable.type !== ValueTypes.NUMBER) {
                        throw new Error(`Left side of comparison must be a number`);
                    }
                    leftValue = leftVariable.value;
                }else if (node.left.type === ASTNodeType.NUMBER) {
                    leftValue = parseFloat(node.left.value); // Convert string to number
                } else {
                    throw new Error("Left side of comparison must be a number or a literal");
                }
                
                // Resolve the right side of the comparison
                let rightValue: number = 0;
    
                // Check if the right side is a literal or a number
                if (node.right !== null) {
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
                }
                
            
                // Extract the comparison operator
                const operator = ComparisonOperators[node.value];
            
                if (!operator) {
                    throw new Error(`Unknown comparison operator ${node.value}`);
                }
            
                // Perform the comparison
                const result = operator({type: ValueTypes.NUMBER, value:leftValue}, { type: ValueTypes.NUMBER, value: rightValue });
            
                return result;
            }

            
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
            blockDepth++; // Increment block depth
            console.log("Block Depth: ", blockDepth);
        
            let lastResult: Value | null = null;
        
            if (node.children) {
                for (const child of node.children) {
                    console.log("Interpreting block child");
                    const result = interpret(child); // Interpret the child node
                    console.log("Child result: ", result);
        
                    // Propagate BREAK if encountered
                    if (result && result.type === ValueTypes.BREAK) {
                        console.log("BREAK statement encountered in block");
                        blockDepth--; // Decrement block depth
                        return result; // Immediately propagate the BREAK
                    }

                    // Propagate CONTINUE if encountered
                    if (result && result.type === ValueTypes.CONTINUE) {
                        console.log("CONTINUE statement encountered in block");
                        blockDepth--; // Decrement block depth
                        return result; // Immediately propagate the CONTINUE
                    }
        
                    lastResult = result; // Update the last result
                }
            }
        
            blockDepth--; // Decrement block depth
            console.log("Returning from BLOCK: ", lastResult || { type: ValueTypes.NULL, value: null });
            return lastResult || { type: ValueTypes.NULL, value: null }; // Return the last result or NULL
        } 

        case ASTNodeType.BREAK: {
            if (loopDepth === 0) {
                throw new Error("BREAK statement must be inside a loop");
            }
            console.log("Returning BREAK result");
            return { type: ValueTypes.BREAK, value: null };
        }

        case ASTNodeType.CONTINUE: {
            if (loopDepth === 0) {
                throw new Error("CONTINUE statement must be inside a loop");
            }
            console.log("Returning CONTINUE result");
            return { type: ValueTypes.CONTINUE, value: null };
        }

        case ASTNodeType.TRUE:{
            return { type: ValueTypes.BOOLEAN, value: true };
        }

        case ASTNodeType.FALSE:{
            return { type: ValueTypes.BOOLEAN, value: false };
        }

        case ASTNodeType.CASE: {
            console.log("Interpreting CASE body");
            const result = interpret(node.body); // Execute
            console.log("Returning from CASE: ", result);
            return result;
        }

        case ASTNodeType.SWITCH: {
            console.log("Interpreting SWITCH condition");
            
            /* Evaluate the switch condition
            const conditionResult = interpret(node.condition); 
            console.log("Switch Condition: ", conditionResult);
            */

            //if the condition is a literal with a number value
            // convert it to a number

            let conditionValue;

            if (node.condition.type === ASTNodeType.LITERAL && variables[node.condition.value].type === ValueTypes.NUMBER){ 
                const variableName = node.condition.value; // This should be the name of the variable, e.g., 'X'
                const variable = variables[variableName]; // Retrieve the variable's value from the variables table

                if (!variable) {
                    throw new Error(`Variable '${variableName}' is not defined.`);
                }
            
                if (variable.type !== ValueTypes.NUMBER) {
                    throw new Error(`Switch condition must be a number`);
                }
                conditionValue = variable.value;
            }

            

            //if the condition is a literal with a string value
            // convert it to a string

            if (node.condition.type === ASTNodeType.LITERAL && variables[node.condition.value].type === ValueTypes.STRING){
                conditionValue = variables[node.condition.value].value;
            }

            //if the condition is a literal with a boolean value
            // convert it to a boolean only accept true

            
            if (node.condition.type === ASTNodeType.LITERAL && variables[node.condition.value].type === ValueTypes.BOOLEAN){
                if (variables[node.condition.value] || variables[node.condition.value].value === false){
                    throw new Error("It cannot be false");
                }
                conditionValue = true;
            }

            // if the condition is a boolean

            if (node.condition.type === ASTNodeType.TRUE){
                conditionValue = true;
            }

            console.log("Switch Condition: ", conditionValue);
            
        
            for (const child of node.cases) { 
                console.log("Interpreting SWITCH case");
                
                // Retrieve the current case's condition
                const caseConditionResult = interpret(child.condition); 
                console.log("Case Condition: ", caseConditionResult);
                console.log("Condition Value: ", conditionValue);
        
                // Check if the current case condition matches the switch condition and if a match has not been found
                if (caseConditionResult.value === conditionValue && !matchFound) { 
                    console.log("Match found. Executing case body.");
                    
                    matchFound = true; // Set the flag to true to indicate a match was found

                    // Execute the matched case body
                    const result = interpret(child.body); 
        
                    // Handle `break` within the case body
                    if (result.type === ValueTypes.BREAK) {
                        console.log("BREAK statement encountered in SWITCH");
                        break; // Exit the switch statement
                    }
                }
            }

            // Execute the default case if no match was found
            if (node.default && !matchFound) { 
                console.log("Interpreting SWITCH default");
                const result = interpret(node.default.body); 
                console.log("Returning from SWITCH: ", result);
                return result;
            }

        
            // Return null as SWITCH has no meaningful result
            return { type: ValueTypes.NULL, value: null };
        }

        case ASTNodeType.DO: {
            console.log("Interpreting DO body");
            
            loopDepth++; // Increment the loop depth
            let result = interpret(node.body); // Execute
            console.log("Interpreting DO condition");
            
            let conditionResult = interpret(node.condition); // Evaluate the condition
            
            try {
                while (conditionResult.value === true) {
                    console.log("Interpreting DO loop body");
                    result = interpret(node.body); // Execute the loop body
        
                    if (result.type === ValueTypes.BREAK) {
                        console.log("BREAK statement encountered in DO");
                        break; // Exit the loop if a BREAK statement was encountered
                    }
        
                    console.log("Interpreting DO loop condition");
                    conditionResult = interpret(node.condition); // Reevaluate the condition
                }
            } finally {
                loopDepth--; // Decrement the loop depth
            }

            return { type: ValueTypes.NULL, value: null }; // Return null as DO has no meaningful result
        }
        
        case ASTNodeType.UNARYOPERATOR: {
        
            // The operand should be a variable reference, NOT its evaluated value.
            const operand = node.operand; 
        
            if (operand.type !== ASTNodeType.LITERAL) {
                throw new Error(`Unary operator (!) expects a variable, got ${operand.type}`);
            }
        
            const variableName = operand.value; // This should be 'Y'
    

            if (!(variableName in variables)) {
                throw new Error(`Variable '${variableName}' is not defined.`);
            }
        
            const variable = variables[variableName]; // Retrieve stored value
        
            if (typeof variable.value !== "boolean") {
                throw new Error(`Cannot negate non-boolean variable '${variableName}'`);
            }
        
            // Apply negation and store the new value
            variables[variableName] = { type: ValueTypes.BOOLEAN, value: !variable.value };
            return variables[variableName]; // Return new value
        }
        
            
        
        default:
            throw new Error(`Unknown node type ${node.type}`);
    }
}

