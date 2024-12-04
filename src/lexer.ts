import { Token, TOKEN_TYPES } from './tokens';

const tokenStringMap: Array<{
    key: string,
    value: Token
  }> = [
    { key: '\n', value: { type: TOKEN_TYPES.LINEBREAK } },
    { key: 'create', value: { type: TOKEN_TYPES.VariableDeclaration } },
    { key: '=', value: { type: TOKEN_TYPES.AssignmentOperator } },
    { key: 'write', value: { type: TOKEN_TYPES.WRITE } },
    { key: '(', value: { type: TOKEN_TYPES.OPEN_PAREN } },
    { key: ')', value: { type: TOKEN_TYPES.CLOSE_PAREN } },
  ]


// Tokenize the code
export function tokenize(input: string): Token[] {
    const output: Token[] = [];
    let currentPosition = 0;

    while (currentPosition < input.length) {
        if (input[currentPosition] === ' ') {
            currentPosition++;
            continue;
        }

        if (input[currentPosition] === '"' || input[currentPosition] === "'") {
            const quoteType = input[currentPosition]; // Remember which quote type was used
            currentPosition++;
        
            const bucket = lookAHead(new RegExp(`[^${quoteType}]`)); // Match until the same quote type is found
        
            output.push({
                type: TOKEN_TYPES.STRING,
                value: bucket.join('')
            });

            currentPosition += bucket.length + 1;

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
        const literalRegex = /[a-zA-Z]/;
        const literalRegexNext = /[a-zA-Z0-9]/;

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
    create hello = ("world")
    create world = ('hello')
    write (hello)
  `))
  

