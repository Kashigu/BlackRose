import { ASTNode, ASTNodeType } from "../frontEnd/ast";
import { ValidBinaryOperators, ValidComparisonOperators, ValidUnitaryOperators, ValidLogicalOperators, ValidUnaryOperators } from "../validOperators";


let pendingIfElse: ASTNode | null = null;
const declaredVariables = new Set<string>(); // Tracks explicitly created variables 


export function analyze(node: ASTNode): void {
    switch (node.type) {      
        case ASTNodeType.PROGRAM:
            for (const child of node.children) {
                analyze(child); // Analyze each child
            }
            break;

        case ASTNodeType.ASSIGNMENT:
            if (!node.name) {
                throw new Error("Assignment must have a variable name.");
            }
            if (!declaredVariables.has(node.name)) {
                throw new Error(`Variable ${node.name} is not declared.`);
            }
            analyze(node.value); // Validate the assigned value
            break;

        case ASTNodeType.VARIABLEDECLARATION:
            if (!node.name) {
                throw new Error("Variable declaration must have a variable name.");
            }
            declaredVariables.add(node.name); // Add the declared variable
            if (node.value) {
                analyze(node.value); // Validate the assigned value
            }
            break;
            
        case ASTNodeType.BINARYOPERATOR:
            analyze(node.left); // Validate left operand
            if (node.left.type === ASTNodeType.STRING) {
                throw new Error("Left operand cannot be a string.");
            }
            analyze(node.right); // Validate right operand
            if (node.right.type === ASTNodeType.STRING) {
                throw new Error("Right operand cannot be a string.");
            }
            if (!ValidBinaryOperators.includes(node.value)) {
                throw new Error(`Unknown operator ${node.value}`);
            }
            break;

        case ASTNodeType.NUMBER:
            break;
        
        case ASTNodeType.STRING:
            break;
        
        case ASTNodeType.LITERAL:
            // No further validation required for literals
            break;

        case ASTNodeType.COMMENT:
            // No validation required for comments
            break;
        
        case ASTNodeType.NULL:
            // No further validation required for null values
            break;

        case ASTNodeType.WRITE:
            const child = node.children[0];
            analyze(child); // Validate the child 
            if (child.type !== ASTNodeType.STRING && child.type !== ASTNodeType.LITERAL && child.type !== ASTNodeType.ARRAYCALL) {
                throw new Error("WRITE node must have a STRING child.");
            }
            break;

        case ASTNodeType.FOR:
            // Validate the loop variable
            if (!node.initialization) {
                throw new Error("FOR loop must have a variable.");
            }
            analyze(node.initialization);

            // Validate the loop condition
            if (!node.condition) {
                throw new Error("FOR loop must have a condition.");
            }
            analyze(node.condition);

            // Validate the loop increment
            if (!node.increment) {
                throw new Error("FOR loop must have an increment.");
            }
            analyze(node.increment);

            // Validate the loop body
            if (!node.body) {
                throw new Error("FOR loop must have a body.");
            }
            analyze(node.body);
            
            break;

        case ASTNodeType.COMPARISONOPERATOR:
            
            if (node.left.type === ASTNodeType.TRUE || node.left.type === ASTNodeType.LITERAL) {
                analyze(node.left); // Validate left operand
                
            }else if(node.left.type === ASTNodeType.FALSE){
                throw new Error("The comparison operator cannot be a false value");
            }else{
                if (!ValidComparisonOperators.includes(node.value)) {
                    throw new Error(`Unknown comparison operator ${node.value}`);
                }
                analyze(node.left); // Validate left operand
                if (node.right !== null){
                    analyze(node.right); // Validate right operand
                }
                
            }
            break;
                
        case ASTNodeType.LOGICALOPERATOR:
            if (!ValidLogicalOperators.includes(node.value)) {
                throw new Error(`Unknown logical operator ${node.value}`);
            }
            analyze(node.left); // Validate left operand
            analyze(node.right); // Validate right operand
            break;   

        case ASTNodeType.UNITARYOPERATOR:
            // Validate the unitary operator
            if (!ValidUnitaryOperators.includes(node.value)) {
                throw new Error(`Unknown unitary operator ${node.value}`);
            }
           
            analyze(node.left); // Validate the operand

            break;

        case ASTNodeType.BLOCK:
            // Validate each child of the block
            if (node.children) {
                for (const child of node.children) {
                    analyze(child);
                }
            }
            break;

        case ASTNodeType.IF:
            
            // Check for 'if' condition
            if (!node.condition) {
                throw new Error("IF statement must have a condition.");
            }
            
            analyze(node.condition);

            // Validate the 'if' body
            if (!node.body) {
                throw new Error("IF statement must have a body.");
            }
           
            analyze(node.body);

            // Mark this 'if' as pending for a possible 'else'
            pendingIfElse = node;
            break;

        case ASTNodeType.ELSE:

            // Check if there was a preceding 'if' or 'ifelse'
            if (!pendingIfElse) {
                throw new Error("ELSE must be preceded by an IF or IFELSE statement.");
            }

            // Validate the 'else' body
            if (!node.body) {
                throw new Error("ELSE statement must have a body.");
            }
        
            analyze(node.body);

            // Reset the pendingIfElse to null after processing 'else'
            pendingIfElse = null;
            break;

        case ASTNodeType.IFELSE:
        
            // Check for 'ifelse' condition
            if (!node.condition) {
                throw new Error("IF-ELSE statement must have a condition.");
            }
        
            analyze(node.condition);

            // Validate the 'ifelse' body
            if (!node.body) {
                throw new Error("IF-ELSE statement must have a body.");
            }
        
            analyze(node.body);

            // Mark this 'ifelse' as pending for a possible 'else'
            pendingIfElse = node;
            break;

        case ASTNodeType.BREAK:
            // No further validation required for break statements
            break;

        case ASTNodeType.CONTINUE:
            // No further validation required for continue statements
            break;

        case ASTNodeType.TRUE:
            break;

        case ASTNodeType.FALSE:
            break;

        case ASTNodeType.WHILE:
            // Validate the loop condition
            if (!node.condition) {
                throw new Error("WHILE loop must have a condition.");
            }
            analyze(node.condition);

            // Validate the loop body
            if (!node.body) {
                throw new Error("WHILE loop must have a body.");
            }
            analyze(node.body);
            break;

        case ASTNodeType.SWITCH:
            // Validate the switch condition
            if (!node.condition) {
                throw new Error("SWITCH statement must have a condition.");
            }
            analyze(node.condition);

            // Validate each case
            for (const child of node.cases) {
                analyze(child);
            }
            break;
        
        case ASTNodeType.CASE:
            // Validate the case condition
            if (!node.condition) {
                throw new Error("CASE statement must have a condition.");
            }
            analyze(node.condition);

            // Validate the case body
            if (!node.body) {
                throw new Error("CASE statement must have a body.");
            }
            analyze(node.body);
            break;

        case ASTNodeType.DEFAULT:
            // Validate the default body
            if (!node.body) {
                throw new Error("DEFAULT statement must have a body.");
            }
            analyze(node.body);
            break;
            
        case ASTNodeType.DO:
            // Validate the loop condition
            if (!node.condition) {
                throw new Error("DO loop must have a condition.");
            }
            analyze(node.condition);

            // Validate the loop body
            if (!node.body) {
                throw new Error("DO loop must have a body.");
            }
            analyze(node.body);
            break;

        case ASTNodeType.UNARYOPERATOR:
            // Validate the unary operator
            if (!ValidUnaryOperators.includes(node.operator)) {
                throw new Error(`Unknown unary operator ${node.operator}`);
            }
            analyze(node.operand); // Validate the operand
            break;

        case ASTNodeType.FUNCTION:
            // Validate the function body
            if (!node.body) {
                throw new Error("FUNCTION must have a body.");
            }
            analyze(node.body);
            break;
        
        case ASTNodeType.FUNCTIONCALL:
            // Validate the function arguments
            if (node.arguments) {
                for (const arg of node.arguments) {
                    analyze(arg);
                }
            }
            break;
        
        case ASTNodeType.RETURN:
            // Validate the return value
            if (node.value) {
                analyze(node.value);
            }
            break;    
            
        case ASTNodeType.ARRAY:
            // Validate the array elements aka children
            if (node.children) {
                for (const element of node.children) {
                    analyze(element);
                }
            }
            break;
        case ASTNodeType.ARRAYCALL:
            // Validate the array index
            if (!node.name) {
                throw new Error("ArrayCall must have a name.");
            }
            if (!node.value) {
                throw new Error("ArrayCall must have a value.");
            }
            if (node.value.type !== ASTNodeType.NUMBER && node.value.type !== ASTNodeType.LITERAL) {
                throw new Error("Array index must be a number.");
            }
        
            analyze(node.value);
            break;
            
        default:
            throw new Error(`Unknown node type ${(node as ASTNode).type} in semantic analysis.`);
    }
}

// function to send the declared variables to the interpreter
export function DeclaredVariables(): Set<string> {
    return declaredVariables;
}

/*
 * Copyright 2025 Kashigu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */