import { ASTNode, ASTNodeType } from "./ast";
import { tokenize } from "./lexer";
import { Token, TOKEN_TYPES } from "./tokens";


function parse(tokens: Token[]): ASTNode {

    let currentIndex = 0;
    let parenStack: number[] = []; // Stack to keep track of open parenthesis

    function process(): ASTNode | null {
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
            currentIndex++;
            return {
                type: ASTNodeType.NUMBER,
                value: currentToken.value
            };
        }
    
        // Handle 'write' statements
        if (currentToken.type === TOKEN_TYPES.WRITE) {
            currentIndex++; // Consume 'write'
            const children: ASTNode[] = [];
    
            // Process content inside 'write'
            while (tokens[currentIndex] && tokens[currentIndex].type !== TOKEN_TYPES.LINEBREAK) {
                const childNode = process();
                if (childNode) {
                    children.push(childNode);
                }
            }
    
            return {
                type: ASTNodeType.WRITE,
                children
            };
        }
    
        // Handle variable declaration
        if (currentToken.type === TOKEN_TYPES.VARIABLEDECLARATION) {
            currentIndex++; // Consume 'create'
    
            const variableNameNode = process();
            if (!variableNameNode || variableNameNode.type !== ASTNodeType.LITERAL) {
                throw new Error(`Expected variable name after 'create', got ${currentToken.type}`);
            }
    
            const assignmentOperatorNode = tokens[currentIndex++];
            if (assignmentOperatorNode.type !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
                throw new Error(`Expected '=' after variable name, got ${assignmentOperatorNode.type}`);
            }
    
            const variableValueNode = process();
            if (!variableValueNode) {
                throw new Error(`Expected value after '=', got ${currentToken.type}`);
            }
    
            return {
                type: ASTNodeType.ASSIGNMENT,
                name: variableNameNode.value,
                value: variableValueNode
            };
        }
    
        // Throw error for unexpected tokens
        throw new Error(
            `Unexpected token '${currentToken.type}' of type '${currentToken.type}' at position ${currentIndex}`
        );
    }
    

    const children: ASTNode[] = [];

    while (currentIndex < tokens.length) {
        const node = process();
        if (node) {
            children.push(node);
        }
    }

    return {
        type: ASTNodeType.PROGRAM,
        children
    };

}


const DSL = `
create hello = "world_123 Ola"
    write (hello)

    create X = 5
    
`

const tokens = tokenize(DSL)

console.log({ tokens })

const AST = parse(tokens)

console.log('AST:', JSON.stringify(AST, null, 2)); // If you want it pretty-printed
console.log({ AST }); // To display it as a regular object

