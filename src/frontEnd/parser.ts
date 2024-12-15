import { ASTBlockNode, ASTNode, ASTNodeType } from "./ast";
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
        return parseVariableDeclaration(currentIndex, tokens);
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

    // Check if the current token is a unitary operator (like ++ or --)
    if (operator?.type === TOKEN_TYPES.UNITARYOPERATOR) {
        // Consume the unitary operator token (e.g., '++')
        console.log("Unitary operator found:", operator.value);
        currentIndex.currentIndex++;  // Consume the unitary operator token

        // Apply the unitary operator on the left expression
        left = {
            type: ASTNodeType.UNITARYOPERATOR,
            value: operator.value,
            operand: left,  // The operand is the left expression
        } as ASTNode;
    }


    while (
        operator &&
        operator.type === TOKEN_TYPES.BINARYOPERATOR &&
        getOperatorPrecedence(operator.value) >= precedence
    ) {
        const currentPrecedence = getOperatorPrecedence(operator.value);

        console.log("Current operator:", operator.value);
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

function parseBlock(currentIndex: { currentIndex: number }, tokens: Token[]): ASTBlockNode {
    const block: ASTBlockNode = {
        type: ASTNodeType.BLOCK,
        children: []
    };

    // Ensure the body starts with '{'
    const startToken = tokens[currentIndex.currentIndex];
    if (!startToken || startToken.type !== TOKEN_TYPES.OPEN_BRACE) {
        throw new Error(`Expected '{' to start block, but got '${startToken?.type}'`);
    }
    currentIndex.currentIndex++; // Consume '{'

    // Parse all statements within the block
    while (
        currentIndex.currentIndex < tokens.length &&
        tokens[currentIndex.currentIndex].type !== TOKEN_TYPES.CLOSE_BRACE
    ) {
        const statement = READ_FILE(currentIndex, tokens, []); // Parse each statement
        if (statement) {
            block.children!.push(statement);
        }
    }

    // Ensure the block ends with '}'
    const endToken = tokens[currentIndex.currentIndex];
    if (!endToken || endToken.type !== TOKEN_TYPES.CLOSE_BRACE) {
        throw new Error(`Expected '}' to end block, but got '${endToken?.type}'`);
    }
    currentIndex.currentIndex++; // Consume '}'

    return block;
}

function parseFor(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'for'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'for'");
    }
    currentIndex.currentIndex++; // Consume '('

    // Parse initialization
    let initialization = null;
    const currentToken = tokens[currentIndex.currentIndex];
    
    // If the current token is a variable declaration, treat it as the initialization
    if (currentToken.type === TOKEN_TYPES.VARIABLEDECLARATION) {
        initialization = parseVariableDeclaration(currentIndex, tokens);
    } else {
        initialization = parseExpression(0, currentIndex, tokens);
    }

    // Check for semicolon after initialization
    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.SEMICOLON) {
        currentIndex.currentIndex++; // Consume ';'
    } else {
        throw new Error("Expected ';' after initialization in 'for' loop");
    }

    // Parse condition (this should be a comparison, e.g., X == 1)
    const condition = parseCondition(currentIndex, tokens);

    // Check for semicolon after condition (it may or may not be there)
    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.SEMICOLON) {
        currentIndex.currentIndex++; // Consume ';'
    } else if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.UNITARYOPERATOR) {
        // If there's a unitary operator, consume it (like '++')
        currentIndex.currentIndex++;
    } else {
        throw new Error("Expected ';' or unitary operator after condition in 'for' loop");
    }

    // Parse increment (could be a unitary operator like '++')
    let increment = parseExpression(0, currentIndex, tokens);

    // Do not expect semicolon here (this is different from the usual `for` loop parsing)
    // The increment does not require a semicolon in this case

    // Check for closing parenthesis after increment
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after increment in 'for' loop");
    }
    currentIndex.currentIndex++; // Consume ')'

    // Parse body
    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.FOR,
        initialization,
        condition,
        increment,
        body,
    };
}

function parseCondition(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    const leftOperand = parseExpression(0, currentIndex, tokens); // Parse the left operand (e.g., X)
    
    const comparisonOperator = tokens[currentIndex.currentIndex];
    if (comparisonOperator?.type !== TOKEN_TYPES.COMPARISONOPERATOR) {
        throw new Error("Expected comparison operator in condition");
    }
    currentIndex.currentIndex++; // Consume the comparison operator (e.g., '==')
    
    const rightOperand = parseExpression(0, currentIndex, tokens); // Parse the right operand (e.g., 1)

    return {
        type: ASTNodeType.COMPARISONOPERATOR,
        left: leftOperand,
        right: rightOperand,
        value: comparisonOperator.value,
    }as ASTNode;
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

    // Handle for loops
    if (currentToken.type === TOKEN_TYPES.FOR) {
        return parseFor(currentIndex, tokens);
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
