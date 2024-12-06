import { Token, TOKEN_TYPES } from './tokens';

const tokenStringMap: Array<{
    key: string,
    value: Token
  }> = [
    { key: '\n', value: { type: TOKEN_TYPES.LINEBREAK } },
    { key: 'create', value: { type: TOKEN_TYPES.VARIABLEDECLARATION } },
    { key: '=', value: { type: TOKEN_TYPES.ASSIGNMENTOPERATOR } },
    { key: 'write', value: { type: TOKEN_TYPES.WRITE } },
    { key: '(', value: { type: TOKEN_TYPES.OPEN_PAREN } },
    { key: ')', value: { type: TOKEN_TYPES.CLOSE_PAREN } },
  ]


// Tokenize the code
export function tokenize(input: string): Token[] {
    const output: Token[] = [];
    let currentPosition = 0;

    while (currentPosition < input.length) {

        // Ignore whitespace
        if (input[currentPosition] === ' ') {
            currentPosition++;
            continue;
        }

        // Handle open parenthesis
        if (input[currentPosition] === '(') {
            output.push({ type: TOKEN_TYPES.OPEN_PAREN });
            currentPosition++;
            continue;
        }

        // Handle close parenthesis
        if (input[currentPosition] === ')') {
            output.push({ type: TOKEN_TYPES.CLOSE_PAREN });
            currentPosition++;
            continue;
        }

        // Handle strings (either single or double quotes)
        if (input[currentPosition] === '"' || input[currentPosition] === "'") {
            const quoteType = input[currentPosition]; // Remember which quote type was used
            currentPosition++;
        
            // Bucket to store the string
            const bucket = [];

            // Consume all characters until we reach the closing quote
            while (currentPosition < input.length && input[currentPosition] !== quoteType) {
                bucket.push(input[currentPosition]);
                currentPosition++;
            }

            // If we reached the end of the input and the string is not closed
            if (input[currentPosition] !== quoteType) {
                throw new Error(`Unterminated string starting at position ${currentPosition}`);
            }

            currentPosition++ // Consume the closing quote
        
            output.push({
                type: TOKEN_TYPES.STRING,
                value: bucket.join('')
            });

            continue;
        }

        // Handle numbers
        const numberRegex = /\d/;
        if (numberRegex.test(input[currentPosition])) {
            const numberBucket = lookAHead(new RegExp('[0-9]')); // Collect digits

            output.push({
                type: TOKEN_TYPES.NUMBER,
                value: numberBucket.join('')
            });

            currentPosition += numberBucket.length;
            continue;
        } 

        // Check for tokens in tokenStringMap first
        let foundToken = false;
        for (const { key, value } of tokenStringMap) {
            if (!lookAHeadString(key)) {
                continue;
            }

            output.push(value);
            currentPosition += key.length;
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
            const bucket = lookAHead(literalRegex, literalRegexNext);

            output.push({
                type: TOKEN_TYPES.LITERAL,
                value: bucket.join('')
            });

            currentPosition += bucket.length;

            continue;
        }

        throw new Error(`Unexpected token at position ${currentPosition}`);
    }

    function lookAHeadString(str: string): boolean {
        const parts = str.split('');

        for (let i = 0; i < parts.length; i++) {
            // if the current token does not match the current part of the string
            if (input[currentPosition + i] !== parts[i]) {
                return false;
            }
        }

        return true;
    }

    function lookAHead(match: RegExp, matchNext?: RegExp): string[] {
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

    return output;
}


console.log(tokenize(`
    create hello = "world_123 Ola"
    write (hello)
  `))
  

