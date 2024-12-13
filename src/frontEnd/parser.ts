import { ASTNode, ASTNodeType } from "./ast";
import { tokenize } from "./lexer";
import { Token, TOKEN_TYPES } from "./tokens";


function getOperatorPrecedence(operator: string): number {
    switch (operator) {
        case '+':
        case '-':
            return 1;
        case '*':
        case '/':
            return 2;
        default:
            return 0;
    }
}




export function parse(tokens: Token[]): ASTNode {

    let currentIndex = 0;
    let parenStack: number[] = []; // Stack to keep track of open parenthesis

    function READ_FILE(): ASTNode | null {
        const currentToken = tokens[currentIndex]; // Get the current token
        
        // Ignore line breaks
        if (currentToken.type === TOKEN_TYPES.LINEBREAK) {
            currentIndex++;
            return null;
        }

        // Handle open parenthesis
        if (currentToken.type === TOKEN_TYPES.OPEN_PAREN) {
            parenStack.push(currentIndex); // Push index of open parenthesis onto stack
            currentIndex++;
            return null; // OPEN_PAREN doesn't immediately produce an AST node
        }
    
        // Handle close parenthesis
        if (currentToken.type === TOKEN_TYPES.CLOSE_PAREN) {
            if (parenStack.length === 0) {
                throw new Error(`Unexpected ')' at position ${currentIndex}`);
            }
            parenStack.pop(); // Pop the matching OPEN_PAREN
            currentIndex++;
            return null; // CLOSE_PAREN doesn't immediately produce an AST node
        }
    
        // Handle literals
        if (currentToken.type === TOKEN_TYPES.LITERAL) {
            currentIndex++;
            return {
                type: ASTNodeType.LITERAL,
                value: currentToken.value
            };
        }
    
        // Handle strings
        if (currentToken.type === TOKEN_TYPES.STRING) {
            currentIndex++;
            return {
                type: ASTNodeType.STRING,
                value: currentToken.value
            };
        }

        // Handle numbers
        if (currentToken.type === TOKEN_TYPES.NUMBER) {
            currentIndex++; // Consume the number token
            return {
                type: ASTNodeType.NUMBER,
                value: currentToken.value,
            } as ASTNode;

        }

        // Handle binary operators
        if (currentToken.type === TOKEN_TYPES.BINARYOPERATOR) {
            currentIndex++; // Consume the operator token
            return parseExpression(getOperatorPrecedence(currentToken.value));
        }

        // Handle 'write' statements
        if (currentToken.type === TOKEN_TYPES.WRITE) {
            currentIndex++; // Consume 'write'
            const children: ASTNode[] = [];
    
            // Process content inside 'write'
            while (tokens[currentIndex] && tokens[currentIndex].type !== TOKEN_TYPES.LINEBREAK) {
                const childNode = READ_FILE();
                if (childNode) {
                    children.push(childNode);
                }
            }
    
            return {
                type: ASTNodeType.WRITE,
                children
            };
        }

        // Handle 'null' literals
        if (currentToken.type === TOKEN_TYPES.NULL) {
            currentIndex++; // Consume 'null'
            return {
                type: ASTNodeType.NULL,
                value: 'null'
            };
        }

        // Handle comments
        if (currentToken.type === TOKEN_TYPES.COMMENT) {
            // Extract the value directly from the token
            const commentContent = currentToken.value || ''; // Fallback to an empty string if value is missing
            currentIndex++; // Move to the next token after the comment
        
            return {
                type: ASTNodeType.COMMENT,
                value: commentContent.trim() // Trim any unwanted spaces
            };
        }


        // Handle variable declaration
        if (currentToken.type === TOKEN_TYPES.VARIABLEDECLARATION) {
            currentIndex++; // Consume 'create'
            
            const variableNameNode = READ_FILE();
            if (!variableNameNode || variableNameNode.type !== ASTNodeType.LITERAL) {
                throw new Error(`Expected variable name after 'create', got ${currentToken.type}`);
            }
        
            const assignmentOperatorNode = tokens[currentIndex++];
            if (assignmentOperatorNode.type !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
                throw new Error(`Expected '=' after variable name, got ${assignmentOperatorNode.type}`);
            }
        
            const expr = parseExpression(0); // Parse the full expression on the RHS
        
            return {
                type: ASTNodeType.ASSIGNMENT,
                name: variableNameNode.value,
                value: expr
            };
        }
        

    
        // Throw error for unexpected tokens
        throw new Error(
            `Unexpected token '${currentToken.type}' of type '${currentToken.type}' at position ${currentIndex}`
        );
    }

    function parseExpression(precedence: number): ASTNode {
        let left = parsePrimary();
        if (!left) {
            throw new Error(`Expected expression at position ${currentIndex}`);
        }

        let operator = tokens[currentIndex];

        while (
            operator &&
            operator.type === TOKEN_TYPES.BINARYOPERATOR &&
            getOperatorPrecedence(operator.value) >= precedence
        ) {
            const currentPrecedence = getOperatorPrecedence(operator.value);

            currentIndex++; // Consume the operator token
            let right = parseExpression(currentPrecedence + 1);

            left = {
                type: ASTNodeType.BINARYOPERATOR,
                left,
                right,
                value: operator.value,
            } as ASTNode;

            operator = tokens[currentIndex];
        }

        return left;
    }

    function parsePrimary(): ASTNode {
        if (tokens[currentIndex].type === TOKEN_TYPES.NUMBER) {
            currentIndex++;
            return {
                type: ASTNodeType.NUMBER,
                value: (tokens[currentIndex - 1] as any).value,
            } as ASTNode;
        }
    
        if (tokens[currentIndex].type === TOKEN_TYPES.OPEN_PAREN) {
            currentIndex++;
            const expr = parseExpression(0);
            if (tokens[currentIndex].type === TOKEN_TYPES.CLOSE_PAREN) {
                currentIndex++;
                return expr;
            }
        }
    
        throw new Error(`Unexpected token at position ${currentIndex}`);
    }

    const children: ASTNode[] = [];

    while (currentIndex < tokens.length) {
        const node = READ_FILE();
        if (node) {
            children.push(node);
        }
    }

    return {
        type: ASTNodeType.PROGRAM,
        children
    };

}




/*
console.log ("Parser Code")

const DSL = `
     (0 / 5) * 2
    
`

const tokens = tokenize(DSL)

console.log({ tokens })

const AST = parse(tokens)

console.log('AST:', JSON.stringify(AST, null, 2)); // If you want it pretty-printed
console.log({ AST }); // To display it as a regular object

*/