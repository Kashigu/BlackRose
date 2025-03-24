import { Token, TOKEN_TYPES } from './tokens';
import { tokenStringMap } from './tokenStringMap';
import { ValidBinaryOperators, ValidComparisonOperators, ValidUnitaryOperators, ValidLogicalOperators, ValidAssignmentOperators, ValidUnaryOperators } from "../validOperators";

function lookAHeadString(str: string, currentPosition: number , input:string , match:RegExp): boolean {
    const matchLength = str.length; // Get the length of the string to match

    for (let i = 0; i < matchLength; i++) {
        // if the current token does not match the current part of the string
        if (input[currentPosition + i] !== str[i]) {
            return false;
        }
    }

    // Ensure the keyword is not part of a longer identifier (e.g., "WriteTest")
    const nextChar = input[currentPosition + matchLength];
    if (nextChar && nextChar.match(match)) {
        const backchar = input[currentPosition + matchLength - 1];
        // Only return false if backchar is a valid identifier character and not an '='
        if (backchar && backchar.match(match) && backchar !== "=") {
            return false;
        }
    }

    return true;
}

function lookAHead(input: string, currentPosition:number ,match: RegExp, matchNext?: RegExp ): string[] {
    const bucket: string[] = [];
    const length = input.length;

    while (currentPosition + bucket.length < length) {
        
        const nextIndex = currentPosition + bucket.length;
        const nextToken = input[nextIndex];

        // If the next token does not match the regex, break
        if (!nextToken || !match.test(nextToken)) {
            break;
        }

        // If matchNext is provided, and the bucket is not empty, use matchNext
        if (matchNext && bucket.length > 0 && !matchNext.test(nextToken)) {
            break;
        }

        // push the next token to the bucket
        bucket.push(nextToken);
    }

    return bucket;
}

function validOperator(
    operators: string[], 
    operatorType: TOKEN_TYPES.ASSIGNMENTOPERATOR | TOKEN_TYPES.BINARYOPERATOR | TOKEN_TYPES.COMPARISONOPERATOR | TOKEN_TYPES.LOGICALOPERATOR | TOKEN_TYPES.UNITARYOPERATOR | TOKEN_TYPES.UNARYOPERATOR, 
    currentPosition: number, 
    currentLine: number, 
    currentColumn: number, 
    input: string, 
    output: Token[]
): number { // Return the updated position
    const matchedOperator = operators.find(op => input.startsWith(op, currentPosition));
    if (matchedOperator) {
        output.push({
            type: operatorType,
            value: matchedOperator,
            line: currentLine,
            column: currentColumn
        });
        currentPosition += matchedOperator.length; // Consume the matched operator
        currentColumn += matchedOperator.length;
    }
    return currentPosition; // Return the updated currentPosition
}



// Tokenize the code
export function tokenize(input: string): Token[] {
    const output: Token[] = [];
    let currentPosition = 0;
    let currentLine = 1;
    let currentColumn = 1;
    const numberRegex = /\d/;
    const regex = new RegExp('[0-9]');
    const regex1 = new RegExp('[0-9.]'); 
    const literalRegex = /[a-zA-Z_]/;
    const literalRegexNext = /[a-zA-Z0-9_]/;

    while (currentPosition < input.length) {
        
        // Ignore whitespace
        if ([' ', '\t', '\r'].includes(input[currentPosition])) { 
            
            while ([' ', '\t', '\r'].includes(input[currentPosition])) {
                currentPosition++;
                currentColumn++;
            }
            
            continue;
        }

        // Handle line breaks
        if (input[currentPosition] === '\n') {
            while (input[currentPosition] === '\n') {
                currentPosition++;
                currentLine++;
                currentColumn = 1;
            }
            continue;
        }

        // Handle open parenthesis
        if (input[currentPosition] === '(') {
            output.push({ type: TOKEN_TYPES.OPEN_PAREN, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle close parenthesis
        if (input[currentPosition] === ')') {
            output.push({ type: TOKEN_TYPES.CLOSE_PAREN , line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle open brace
        if (input[currentPosition] === '{') {
            output.push({ type: TOKEN_TYPES.OPEN_BRACE , line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle close brace
        if (input[currentPosition] === '}') {
            output.push({ type: TOKEN_TYPES.CLOSE_BRACE, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

       
        // Handle semi-colons
        if (input[currentPosition] === ';') {
            output.push({ type: TOKEN_TYPES.SEMICOLON , line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        if (input[currentPosition] === '['){
            output.push({ type: TOKEN_TYPES.OPEN_RETOS, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        if (input[currentPosition] === ']'){
            output.push({ type: TOKEN_TYPES.CLOSE_RETOS, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle commas
        if (input[currentPosition] === ',') {
            output.push({ type: TOKEN_TYPES.COMMA, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // handle double dots
        if (input[currentPosition] === ':') {
            output.push({ type: TOKEN_TYPES.DOUBLE_DOT, line: currentLine, column: currentColumn });
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle comments First of all
        if (lookAHeadString('//', currentPosition, input, literalRegexNext)) {
            currentPosition += 2; // Consume the `//`
        
            // Collect characters until a line break
            const commentBucket = [];
            while (currentPosition < input.length && input[currentPosition] !== '\n') {
                commentBucket.push(input[currentPosition]);
                currentPosition++;
                currentColumn++;
            }
        
            output.push({
                type: TOKEN_TYPES.COMMENT,
                value: commentBucket.join(''),
                line: currentLine,
                column: currentColumn
            });
        
            continue;
        }

        // Handle Firstly the Comparison Operators
        if (ValidComparisonOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidComparisonOperators, TOKEN_TYPES.COMPARISONOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle Secondly ValidLogicalOperators
        if (ValidLogicalOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidLogicalOperators, TOKEN_TYPES.LOGICALOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle Thirdly the Unitary Operators
        if (ValidUnitaryOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidUnitaryOperators, TOKEN_TYPES.UNITARYOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle Fourthly Valid Assignment Operators
        if (ValidAssignmentOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidAssignmentOperators, TOKEN_TYPES.ASSIGNMENTOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle Fifthly Valid Unary Operators
        if (ValidUnaryOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidUnaryOperators, TOKEN_TYPES.UNARYOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle Sixthly Binary Operators
        if (ValidBinaryOperators.find(op => input.startsWith(op, currentPosition))) { 
            currentPosition = validOperator(ValidBinaryOperators, TOKEN_TYPES.BINARYOPERATOR, currentPosition, currentLine, currentColumn, input, output);
            continue;
        }

        // Handle strings (either single or double quotes)
        if (input[currentPosition] === '"' || input[currentPosition] === "'") {
            const quoteType = input[currentPosition]; // Remember which quote type was used
            currentPosition++;
            currentColumn++;
        
            // Bucket to store the string
            const bucket = [];

            // Consume all characters until we reach the closing quote
            while (currentPosition < input.length && input[currentPosition] !== quoteType) {
                bucket.push(input[currentPosition]);
                currentPosition++;
                currentColumn++;
            }

            // If we reached the end of the input and the string is not closed
            if (input[currentPosition] !== quoteType) {
                throw new Error(`Unterminated string at line ${currentLine} and column ${currentColumn}`);
            }

            currentPosition++ // Consume the closing quote
            currentColumn++;
        
            output.push({
                type: TOKEN_TYPES.STRING,
                value: bucket.join(''),
                line: currentLine,
                column: currentColumn
            });

            continue;
        }

        // Handle numbers // create a regex ouside of the loop to avoid unnecessary recompilation
        
        if (numberRegex.test(input[currentPosition])) {
            const numberBucket = lookAHead(input, currentPosition, regex, regex1); // Collect digits

            output.push({
                type: TOKEN_TYPES.NUMBER,
                value: numberBucket.join(''),
                line: currentLine,
                column: currentColumn
            });

            currentPosition += numberBucket.length;
            currentColumn += numberBucket.length;
            continue;
        } 

        // Check for tokens in tokenStringMap first
        let foundToken = false;
        for (const { key, value } of tokenStringMap) {
            if (!lookAHeadString(key, currentPosition, input, literalRegexNext)) {
                continue;
            }

            // push the token to the output with the line and column
            output.push({
                ...value,
                line: currentLine,
                column: currentColumn
            });

            currentPosition += key.length;
            currentColumn += key.length;
            foundToken = true;
            break; // Exit the loop once a token is matched
        }
        if (foundToken) {
            continue;
        }

        // Process LITERAL tokens only if no other token matches 
        if (literalRegex.test(input[currentPosition])) {
            const bucket = lookAHead(input, currentPosition, literalRegex, literalRegexNext);

            output.push({
                type: TOKEN_TYPES.LITERAL,
                value: bucket.join(''),
                line: currentLine,
                column: currentColumn
            });

            currentPosition += bucket.length;
            currentColumn += bucket.length;

            continue;
        }
        

        console.log(`Current Position: ${currentPosition}, Character: ${input[currentPosition]}`);

        throw new Error(`Unexpected token ${input[currentPosition]} at line ${currentLine} and column ${currentColumn} in lexer`);
    }
    

    return output;
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