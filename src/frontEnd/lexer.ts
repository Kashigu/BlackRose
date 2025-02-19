import { Token, TOKEN_TYPES } from './tokens';
import { tokenStringMap } from './tokenStringMap';
import { ValidBinaryOperators, ValidComparisonOperators, ValidUnitaryOperators, ValidLogicalOperators, ValidAssignmentOperators, ValidUnaryOperators } from "../validOperators";

function lookAHeadString(str: string, currentPosition: number , input:string): boolean {
    const parts = str.split('');
    const matchLength = parts.length;

    for (let i = 0; i < parts.length; i++) {
        // if the current token does not match the current part of the string
        if (input[currentPosition + i] !== parts[i]) {
            return false;
        }
    }

    // Ensure the keyword is not part of a longer identifier (e.g., "WriteTest")
    const nextChar = input[currentPosition + matchLength];
    if (nextChar && /[a-zA-Z0-9_]/.test(nextChar)) {
        return false;
    }

    return true;
}

function lookAHead(input: string, currentPosition:number ,match: RegExp, matchNext?: RegExp ): string[] {
    const bucket: string[] = [];

    while (true) {
        // Check if we reached the end of the input
        const nextIndex = currentPosition + bucket.length;
        const nextToken = input[nextIndex];
        if (!nextToken) {
            break;
        }
        // m is either a string or a regex
        let m: string | RegExp = match;

        // if matchNext is provided and the bucket is not empty, use matchNext
        if (matchNext && bucket.length) {
            m = matchNext;
        }
        // if matchNext is provided and the bucket is empty, use match
        if (m && !m.test(nextToken)) {
            break;
        }
        // push the next token to the bucket
        bucket.push(nextToken);
    }

    return bucket;
}


// Tokenize the code
export function tokenize(input: string): Token[] {
    const output: Token[] = [];
    let currentPosition = 0;
    let currentLine = 1;
    let currentColumn = 1;

    while (currentPosition < input.length) {

        // Ignore whitespace
        if (input[currentPosition] === ' ' || input[currentPosition] === '\t' || input[currentPosition] === '\r') { 
            currentPosition++;
            currentColumn++;
            continue;
        }

        // Handle line breaks
        if (input[currentPosition] === '\n') {
            currentPosition++;
            currentLine++;
            currentColumn = 1;
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
        if (lookAHeadString('//', currentPosition, input)) {
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

        // Handle first the Comparison Operators
        // Check if the value is on the list and then push it to the function
        if (ValidComparisonOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidComparisonOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.COMPARISONOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
            continue;
        }

        // Handle Valid Assignment Operators
        if (ValidAssignmentOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidAssignmentOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.ASSIGNMENTOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
            continue;
        }

        // Handle Unary Operators
        if (ValidUnaryOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidUnaryOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.UNARYOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
            continue;
        }

        // Handle ValidLogicalOperators
        if (ValidLogicalOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidLogicalOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.LOGICALOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
            continue;
        }

        // Handle Secondly the Unitary Operators
        if (ValidUnitaryOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidUnitaryOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.UNITARYOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
            continue;
        }

        // Handle Thirdly the Binary Operators
        if (ValidBinaryOperators.some(op => lookAHeadString(op, currentPosition, input))) {
            const matchedOperator = ValidBinaryOperators.find(op => lookAHeadString(op, currentPosition, input))!;
            output.push({ type: TOKEN_TYPES.BINARYOPERATOR, value: matchedOperator , line: currentLine, column: currentColumn });
            currentPosition += matchedOperator.length; // Consume the matched operator
            currentColumn += matchedOperator.length;
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

        // Handle numbers
        const numberRegex = /\d/;
        if (numberRegex.test(input[currentPosition])) {
            const numberBucket = lookAHead(input, currentPosition, new RegExp('[0-9]'), new RegExp('[0-9.]')); // Collect digits

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
            if (!lookAHeadString(key, currentPosition, input)) {
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
        const literalRegex = /[a-zA-Z_]/;
        const literalRegexNext = /[a-zA-Z0-9_]/;

        
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

        throw new Error(`Unexpected token at line ${currentLine} and column ${currentColumn}`);
    }

    return output;
}
