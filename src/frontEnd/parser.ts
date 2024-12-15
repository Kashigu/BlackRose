import { ASTNode, ASTNodeType } from "./ast";
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

function parsePrimary(currentIndex: {currentIndex:number}, tokens:Token[]): ASTNode {
    const currentToken = tokens[currentIndex.currentIndex];

    // Handle literals
    if (currentToken.type === TOKEN_TYPES.LITERAL) {
        console.log("Literal", currentToken.value);
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.LITERAL,
            value: currentToken.value,
        };
    }

    // Handle numbers
    if (currentToken.type === TOKEN_TYPES.NUMBER) {
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.NUMBER,
            value: currentToken.value,
        };
    }

    // Handle strings
    if (currentToken.type === TOKEN_TYPES.STRING) {
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.STRING,
            value: currentToken.value,
        };
    }

    // Handle variable declarations (e.g., create X = 1)
    if (currentToken.type === TOKEN_TYPES.VARIABLEDECLARATION) {
       
        currentIndex.currentIndex++; // Consume 'create'
       

        // Fetch the variable name
        const variableNameToken = tokens[currentIndex.currentIndex];
        if (!variableNameToken || variableNameToken.type !== TOKEN_TYPES.LITERAL) {
            throw new Error(`Expected variable name after 'create', but got ${variableNameToken?.type}`);
        }
        const variableName = variableNameToken.value;
        currentIndex.currentIndex++; // Consume the variable name

        // Fetch the assignment operator
        const assignmentToken = tokens[currentIndex.currentIndex];
        if (!assignmentToken || assignmentToken.type !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
            throw new Error(`Expected '=' after variable name, but got ${assignmentToken?.type}`);
        }
        currentIndex.currentIndex++; // Consume '='

        // Parse the value assigned to the variable
        const value = parseExpression(0, currentIndex, tokens);
        if (!value) {
            throw new Error(`Expected expression after '=' for variable declaration`);
        }

        return {
            type: ASTNodeType.ASSIGNMENT,
            name: variableName,
            value,
        };
    }

    // Handle parenthesis
    if (currentToken.type === TOKEN_TYPES.OPEN_PAREN) {
        currentIndex.currentIndex++; // Consume '('
        const expr = parseExpression(0, currentIndex, tokens);
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.CLOSE_PAREN) {
            currentIndex.currentIndex++; // Consume ')'
            return expr;
        }
        throw new Error(`Expected ')' after expression`);
    }

    throw new Error(`Unexpected token '${currentToken.type}' at position ${currentIndex}`);
}

function parseExpression(precedence: number, currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    let left = parsePrimary(currentIndex, tokens);
    if (!left) {
        throw new Error(`Expected expression at position ${currentIndex}`);
    }

    let operator = tokens[currentIndex.currentIndex];

    while (
        operator &&
        operator.type === TOKEN_TYPES.BINARYOPERATOR &&
        getOperatorPrecedence(operator.value) >= precedence
    ) {
        const currentPrecedence = getOperatorPrecedence(operator.value);

        currentIndex.currentIndex++; // Consume the operator token
        let right = parseExpression(currentPrecedence + 1, currentIndex, tokens);

        left = {
            type: ASTNodeType.BINARYOPERATOR,
            left,
            right,
            value: operator.value,
        } as ASTNode;

        operator = tokens[currentIndex.currentIndex];
    }

    return left;
}

function parseIgnore(currentIndex: { currentIndex: number }, tokens: Token[]): null {
    currentIndex.currentIndex++;
    return null;
}

function parseWrite(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++;
    const children: ASTNode[] = [];

    while (tokens[currentIndex.currentIndex] && 
        (tokens[currentIndex.currentIndex].type === TOKEN_TYPES.STRING || tokens[currentIndex.currentIndex].type === TOKEN_TYPES.LITERAL)) 
        {

        const token = tokens[currentIndex.currentIndex];

        if (token.type === TOKEN_TYPES.STRING) {
            children.push({
                type: ASTNodeType.STRING,
                value: token.value,
            });
            currentIndex.currentIndex++; // Consume string token
        } else if (token.type === TOKEN_TYPES.LITERAL) {
            children.push({
                type: ASTNodeType.LITERAL,
                value: token.value,
            });
            currentIndex.currentIndex++; // Consume literal token
        } else {
            throw new Error(`Unexpected token in 'write' statement at position ${currentIndex}: ${token.type}`);
        }
    }

    // Optionally consume the LINEBREAK token if present
    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LINEBREAK) {
        currentIndex.currentIndex++;
    }

    return {
        type: ASTNodeType.WRITE,
        children,
    };
}

function parseBraceAndParen(currentIndex: { currentIndex: number }, tokens: Token[], parenStack: number[]): ASTNode {
    const currentToken = tokens[currentIndex.currentIndex];

    // Handle open parenthesis
    if (currentToken.type === TOKEN_TYPES.OPEN_PAREN) {
        currentIndex.currentIndex++;
        const expr = parseExpression(0, currentIndex, tokens);
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.CLOSE_PAREN) {
            currentIndex.currentIndex++; // Consume ')'
            return expr;
        }
        throw new Error(`Expected ')' after expression`);
    }

    // Handle open brace
    if (currentToken.type === TOKEN_TYPES.OPEN_BRACE) {
        currentIndex.currentIndex++;
        const children: ASTNode[] = [];
        while (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_BRACE) {
            const node = READ_FILE(currentIndex, tokens, parenStack);
            if (node) {
                children.push(node);
            }
        }
        currentIndex.currentIndex++; // Consume '}'
        return {
            type: ASTNodeType.BLOCK,
            children,
        };
    }

    throw new Error(`Unexpected token '${currentToken.type}' at position ${currentIndex}`);
}

function parseVariableDeclaration(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++;
    const variableNameToken = tokens[currentIndex.currentIndex];
    if (!variableNameToken || variableNameToken.type !== TOKEN_TYPES.LITERAL) {
        throw new Error(`Expected variable name after 'create', but got ${variableNameToken?.type}`);
    }
    const variableName = variableNameToken.value;
    currentIndex.currentIndex++; // Consume the variable name
    const assignmentToken = tokens[currentIndex.currentIndex];
    if (!assignmentToken || assignmentToken.type
        !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
        throw new Error(`Expected '=' after variable name, but got ${assignmentToken?.type}`);
    }
    currentIndex.currentIndex++; // Consume '='
    const value = parseExpression(0, currentIndex, tokens);
    if (!value) {
        throw new Error(`Expected expression after '=' for variable declaration`);
    }
    return {
        type: ASTNodeType.ASSIGNMENT,
        name: variableName,
        value,
    };
}


// Function to read the file
function READ_FILE(currentIndex: { currentIndex: number }, tokens: Token[], parenStack: number[]): ASTNode | null {
    const currentToken = tokens[currentIndex.currentIndex]; // Get the current token

    // Ignore linebreaks and semicolons
    if (currentToken.type === TOKEN_TYPES.LINEBREAK || currentToken.type === TOKEN_TYPES.SEMICOLON) {
        parseIgnore(currentIndex, tokens);
    }

    // Handle open parenthesis and braces
    // Delegate to parseBraceAndParen to handle the contents of the parenthesis or braces by recursively calling READ_FILE
    if (currentToken.type === TOKEN_TYPES.OPEN_PAREN || currentToken.type === TOKEN_TYPES.OPEN_BRACE) {
        parseBraceAndParen(currentIndex, tokens, parenStack);
    }

    // Handle literals
    if (currentToken.type === TOKEN_TYPES.LITERAL) {
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.LITERAL,
            value: currentToken.value
        };
    }
    
    // Handle strings
    if (currentToken.type === TOKEN_TYPES.STRING) {
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.STRING,
            value: currentToken.value
        };
    }

    // Handle numbers
    if (currentToken.type === TOKEN_TYPES.NUMBER) {
        if (parenStack.length > 0 || tokens[currentIndex.currentIndex + 1]?.type === TOKEN_TYPES.BINARYOPERATOR) {
            // Delegate to parseExpression if inside parentheses or part of a binary operation
            return parseExpression(0, currentIndex, tokens);
        }
        currentIndex.currentIndex++; // Consume the number token
        return {
            type: ASTNodeType.NUMBER,
            value: currentToken.value,
        } as ASTNode;

    }

    // Handle binary operators
    if (currentToken.type === TOKEN_TYPES.BINARYOPERATOR) {
        currentIndex.currentIndex++; // Consume the operator token
        return parseExpression(getOperatorPrecedence(currentToken.value), currentIndex, tokens);
    }
    
    // Handle Write statements
    if (currentToken.type === TOKEN_TYPES.WRITE) {
        return parseWrite(currentIndex, tokens);
    }

    // Handle 'null' literals
    if (currentToken.type === TOKEN_TYPES.NULL) {
        currentIndex.currentIndex++; // Consume 'null'
        return {
            type: ASTNodeType.NULL,
            value: 'null'
        };
    }

    // Handle comments
    if (currentToken.type === TOKEN_TYPES.COMMENT) {
        // Extract the value directly from the token
        const commentContent = currentToken.value || ''; // Fallback to an empty string if value is missing
        currentIndex.currentIndex++; // Move to the next token after the comment
    
        return {
            type: ASTNodeType.COMMENT,
            value: commentContent.trim() // Trim any unwanted spaces
        };
    }

    // Handle variable declaration
    if (currentToken.type === TOKEN_TYPES.VARIABLEDECLARATION) {
        return parseVariableDeclaration(currentIndex, tokens);
    }

    // Throw error for unexpected tokens
    throw new Error(
        `Unexpected token '${currentToken.type}' of type '${currentToken.type}' at position ${currentIndex}`
    );
}

export function parse(tokens: Token[]): ASTNode {

    let currentIndex = { currentIndex: 0 }; // Index of the current token being processed
    let parenStack: number[] = []; // Stack to keep track of open parenthesis

    const children: ASTNode[] = [];

    while (currentIndex.currentIndex < tokens.length) {
        const node = READ_FILE(currentIndex, tokens, parenStack);
        if (node) {
            children.push(node);
        }
    }

    return {
        type: ASTNodeType.PROGRAM,
        children
    };

}
