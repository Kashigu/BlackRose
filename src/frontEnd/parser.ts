import { ASTBlockNode, ASTNode, ASTNodeType , ASTCaseNode , ASTDefaultNode} from "./ast";
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

    // Handle Unary operators
    if (currentToken.type === TOKEN_TYPES.UNARYOPERATOR) {

        currentIndex.currentIndex++; // Consume the unary operator token
        // Parse the expression that follows the unary operator
        const expr = parseExpression(0, currentIndex, tokens); // ex: !true

        return {
            type: ASTNodeType.UNARYOPERATOR,
            operator: currentToken.value,           // ex: !
            operand: expr,                          // ex: true
        };
        
    }

    // Handle literals
    if (currentToken.type === TOKEN_TYPES.LITERAL) {    
        currentIndex.currentIndex++; // Consume the literal token

        // Check if the next token is an assignment operator
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.ASSIGNMENTOPERATOR) {
            return parseAssignmentDeclaration(currentIndex, tokens);
        }

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

    //Handle false literals
    if (currentToken.type === TOKEN_TYPES.FALSE) {
        currentIndex.currentIndex++;
        return {
            type: ASTNodeType.FALSE,
            value: 'false'
        };
    }

    //Handle true literals
    if (currentToken.type === TOKEN_TYPES.TRUE) {
        currentIndex.currentIndex++; // Advance past 'true'
        return {
            type: ASTNodeType.TRUE,
            value: 'true'
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

function parseComparisonExpression(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    const left = parsePrimary(currentIndex, tokens);
    const operator = tokens[currentIndex.currentIndex];

    if (operator?.type !== TOKEN_TYPES.COMPARISONOPERATOR) {
        throw new Error(`Expected comparison operator at position ${currentIndex.currentIndex}`);
    }

    currentIndex.currentIndex++; // Consume the comparison operator token

    const right = parsePrimary(currentIndex, tokens);

    return {
        type: ASTNodeType.COMPARISONOPERATOR,
        left,
        right,
        value: operator.value,
    };
}

function parseUnitaryExpression(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    // Goes back to the previous token to get left 
    currentIndex.currentIndex--; // Go back to the previous token
    const left = parsePrimary(currentIndex, tokens);

    const operator = tokens[currentIndex.currentIndex];

    if (operator?.type !== TOKEN_TYPES.UNITARYOPERATOR) {
        throw new Error(`Expected unitary operator at position ${currentIndex.currentIndex}`);
    }

    currentIndex.currentIndex++; // Consume the unitary operator token

    return {
        type: ASTNodeType.UNITARYOPERATOR,
        left,
        value: operator.value,
    };
}

function parseExpression(precedence: number, currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    let left = parsePrimary(currentIndex, tokens);
    if (!left) {
        throw new Error(`Expected expression at position ${currentIndex.currentIndex}`);
    }

    let operator = tokens[currentIndex.currentIndex];

    // Handle binary operators
    while (
        operator &&
        operator.type === TOKEN_TYPES.BINARYOPERATOR &&
        getOperatorPrecedence(operator.value) >= precedence
    ) {
        const currentPrecedence = getOperatorPrecedence(operator.value);

        currentIndex.currentIndex++; // Consume the binary operator token
        let right = parseExpression(currentPrecedence + 1, currentIndex, tokens);

        left = {
            type: ASTNodeType.BINARYOPERATOR,
            left, 
            right, 
            value: operator.value, // Operator symbol (e.g., +,/,*,- *) but it doesnt work with (+=, -=, *=, /=)
        } as ASTNode;

        operator = tokens[currentIndex.currentIndex]; // Update to the next operator
    }

    return left;
}

function parseIgnore(currentIndex: { currentIndex: number }, tokens: Token[]): null {
    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LINEBREAK ||
        tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.SEMICOLON) {
     currentIndex.currentIndex++; // Skip all consecutive LINEBREAK and SEMICOLON tokens
    }
    return null;
}

function parseWrite(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'write'
    const children: ASTNode[] = [];

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'write' or 'yap' statement");
    }
    currentIndex.currentIndex++; // Consume '('

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

    // Consume the line break token after the write statement only consume one line break
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error(`Expected ')' after 'write' statement`);
    }
    currentIndex.currentIndex++; // Consume ')'

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
    currentIndex.currentIndex++; // Advance past 'create'
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
        type: ASTNodeType.VARIABLEDECLARATION,
        name: variableName,
        value,
    };
}

function parseAssignmentDeclaration(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    // Go back to get the variable name (literal)
    currentIndex.currentIndex--;
    const token = tokens[currentIndex.currentIndex];

    if (token.type !== TOKEN_TYPES.LITERAL) {
        throw new Error(`Expected variable name, but got ${token.type}`);
    }

    const variableNameToken = tokens[currentIndex.currentIndex];
    if (!variableNameToken || variableNameToken.type !== TOKEN_TYPES.LITERAL) {
        throw new Error(`Expected variable name, but got ${variableNameToken?.type}`);
    }

    const variableName = variableNameToken.value;
    currentIndex.currentIndex++; // Consume variable name

    // Ensure next token is an Assignment Operator
    const assignmentToken = tokens[currentIndex.currentIndex];
    if (!assignmentToken || assignmentToken.type !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
        throw new Error(`Expected assignment operator, but got ${assignmentToken?.type}`);
    }

    const operator = assignmentToken.value; // Capture operator (`=`, `+=`, `-=`, etc.)
    currentIndex.currentIndex++; // Consume assignment operator

    // Parse the right-hand side expression
    const value = parseExpression(0, currentIndex, tokens);
    if (!value) {
        throw new Error(`Expected expression after '${operator}'`);
    }

    // Handle compound assignments (+=, -=, *=, /=)
    if (operator !== "=") {
        const actualOperator = operator[0]; // Extract the arithmetic operator (+, -, *, /)
        
        return {
            type: ASTNodeType.ASSIGNMENT,
            name: variableName,
            value: {
                type: ASTNodeType.BINARYOPERATOR,
                left: { type: ASTNodeType.LITERAL, value: variableName },
                right: value,
                value: actualOperator, // Use the extracted operator
            },
        };
    }

    // Normal assignment `X = 6`
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

function parseCaseBlock(currentIndex: { currentIndex: number }, tokens: Token[]): ASTBlockNode {
    const block: ASTBlockNode = {
        type: ASTNodeType.BLOCK,
        children: []
    };

    // Ensure the body starts with ':'
    const startToken = tokens[currentIndex.currentIndex];
    
    if (!startToken || startToken.type !== TOKEN_TYPES.DOUBLE_DOT) {
        throw new Error(`Expected ':' to start block, but got '${startToken?.type}'`);
    }
    currentIndex.currentIndex++; // Consume ':'

    // Parse all statements within the block
    while (
        currentIndex.currentIndex < tokens.length &&
        tokens[currentIndex.currentIndex].type !== TOKEN_TYPES.BREAK
    ) {
        const statement = READ_FILE(currentIndex, tokens, []); // Parse each statement
        if (statement) {
            block.children!.push(statement);
        }
    }

    // Ensure the block ends with 'bruh'
    const endToken = tokens[currentIndex.currentIndex];
    
    if (!endToken || endToken.type !== TOKEN_TYPES.BREAK) {
        throw new Error(`Expected 'bruh' to end block, but got '${endToken?.type}'`);
    }
    currentIndex.currentIndex++; // Consume 'bruh'

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
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.SEMICOLON) {
        throw new Error("Expected ';' after initialization in 'for' loop");
    }
    currentIndex.currentIndex++; // Consume ';'

    // Parse condition (this should be a comparison, e.g., X == 1)
    const condition = parseCondition(currentIndex, tokens);
    //console.log(condition);

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.SEMICOLON) {
        throw new Error("Expected ';' after condition in 'for' loop");
    }
    currentIndex.currentIndex++; // Consume ';' after condition

    // Now to parse the increment I need to know two steps ahead so I can know if it is a unitary operator or a assignment operator
    currentIndex.currentIndex++; // Advance past the Literal (ex: I)
    //console.log(tokens[currentIndex.currentIndex]); // this should be an operator

    let increment = null;
    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.ASSIGNMENTOPERATOR) {
        increment = parseAssignmentDeclaration(currentIndex, tokens);
    }else if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.UNITARYOPERATOR) {
        increment = parseUnitaryExpression(currentIndex, tokens);
    }
    //console.log(increment);
    if (increment === null) {
        throw new Error("Expected increment in 'for' loop");
    }

    //console.log(tokens[currentIndex.currentIndex]);
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

function parseIf(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode | null {
    currentIndex.currentIndex++; // Advance past 'if'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'if'");
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the first condition
    let condition = parseCondition(currentIndex, tokens);

    // Check for logical operators (&&, ||) and chain conditions
    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LOGICALOPERATOR) {
        const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Store the operator (e.g., && or ||)
        currentIndex.currentIndex++; // Consume '&&' or '||'

        const nextCondition = parseCondition(currentIndex, tokens); // Parse the second condition

        // Combine the conditions into a new AST node
        condition = {
            type: ASTNodeType.LOGICALOPERATOR,
            value: logicalOperator,
            left: condition,
            right: nextCondition,
        };
    }

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'if' statement");
    }

    currentIndex.currentIndex++; // Consume ')'

    // Parse the body
    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.IF,
        condition,
        body,
    };
}

function parseIfElse(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode | null {
    currentIndex.currentIndex++; // Advance past 'if-else'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'if-else'");
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition

    let condition = parseCondition(currentIndex, tokens);

    // Check for logical operators (&&, ||) and chain conditions
    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LOGICALOPERATOR) {
        const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Store the operator (e.g., && or ||)
        currentIndex.currentIndex++; // Consume '&&' or '||'

        const nextCondition = parseCondition(currentIndex, tokens); // Parse the second condition

        // Combine the conditions into a new AST node
        condition = {
            type: ASTNodeType.LOGICALOPERATOR,
            value: logicalOperator,
            left: condition,
            right: nextCondition,
        };
    }

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'if' statement");
    }

    currentIndex.currentIndex++; // Consume ')'

    // Parse the body

    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.IFELSE,
        condition,
        body
    };
}

function parseElse (currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode | null {
    currentIndex.currentIndex++; // Advance past 'else'

    // Parse the body

    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.ELSE,
        body
    };
}

function parseBreak (currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode | null {
    currentIndex.currentIndex++; // Advance past 'break'

    return {
        type: ASTNodeType.BREAK
    };
}

function parseContinue (currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode | null {
    currentIndex.currentIndex++; // Advance past 'continue'
    return {
        type: ASTNodeType.CONTINUE
    };
}

function parseWhile(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'while'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'while'");
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition

    let condition = parseCondition(currentIndex, tokens);

    // Check for logical operators (&&, ||) and chain conditions
    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LOGICALOPERATOR) {
        const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Store the operator (e.g., && or ||)
        currentIndex.currentIndex++; // Consume '&&' or '||'

        const nextCondition = parseCondition(currentIndex, tokens); // Parse the second condition

        // Combine the conditions into a new AST node
        condition = {
            type: ASTNodeType.LOGICALOPERATOR,
            value: logicalOperator,
            left: condition,
            right: nextCondition,
        };
    }

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'while' loop");
    }

    currentIndex.currentIndex++; // Consume ')'

    // Parse the body

    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.WHILE,
        condition,
        body,
    };
}


function parseCondition(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    const leftOperand = parseExpression(0, currentIndex, tokens); // Parse the left operand (e.g., X)
    
    const comparisonOperator = tokens[currentIndex.currentIndex];

    if (leftOperand?.type === ASTNodeType.TRUE || leftOperand?.type === ASTNodeType.FALSE) {
        return {
            type: ASTNodeType.COMPARISONOPERATOR,
            left: leftOperand,
            right: null,
            value: leftOperand.value,
        }as ASTNode;
    }else if (leftOperand?.type === ASTNodeType.LITERAL) { // I am checking if the literal is a variable true or false that is wrong 
                                                            // I should check if its a literal and see if there is a right operand anyway
            if (comparisonOperator?.type === TOKEN_TYPES.COMPARISONOPERATOR) {
                currentIndex.currentIndex++; // Consume the comparison operator (e.g., '==')
    
                const rightOperand = parseExpression(0, currentIndex, tokens); // Parse the right operand (e.g., 1)

                return {
                    type: ASTNodeType.COMPARISONOPERATOR,
                    left: leftOperand,
                    right: rightOperand,
                    value: comparisonOperator.value,
                }as ASTNode;
            }else {
            
                return {
                    type: ASTNodeType.COMPARISONOPERATOR,
                    left: leftOperand,
                    right: null,
                    value: leftOperand.value,
                }as ASTNode;
            }
    
    }else if (comparisonOperator?.type !== TOKEN_TYPES.COMPARISONOPERATOR) {
        throw new Error("Expected comparison operator in condition");
    }
    currentIndex.currentIndex++; // Consume the comparison operator (e.g., '==')
    
    const rightOperand = parseExpression(0, currentIndex, tokens); // Parse the right operand (e.g., 1)

    // this method should work for any number like 1 <= 2
    return {
        type: ASTNodeType.COMPARISONOPERATOR,
        left: leftOperand,
        right: rightOperand,
        value: comparisonOperator.value,
    }as ASTNode;
}

function parseLogicalOperator(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    const leftOperand = parseExpression(0, currentIndex, tokens); // Parse the left operand (e.g., true)
    const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Get the logical operator token (e.g., '&&' or '||')
    currentIndex.currentIndex++; // Consume the logical operator token

    const rightOperand = parseExpression(0, currentIndex, tokens); // Parse the right operand (e.g., false)

    return {
        type: ASTNodeType.LOGICALOPERATOR,
        left: leftOperand,
        right: rightOperand,
        value: logicalOperator
    } as ASTNode;
}

function parseCase(currentIndex: { currentIndex: number }, tokens: Token[]): ASTCaseNode{
    currentIndex.currentIndex++; // Advance past 'case'

    // Parse the condition by getting the comparison expression
    let condition = parseComparisonExpression(currentIndex, tokens);

    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LOGICALOPERATOR) {
        const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Store the operator (e.g., && or ||)
        currentIndex.currentIndex++; // Consume '&&' or '||'

        const nextCondition = parseComparisonExpression( currentIndex, tokens); // Parse the second condition

        // Combine the conditions into a new AST node
        condition = {
            type: ASTNodeType.LOGICALOPERATOR,
            value: logicalOperator,
            left: condition,
            right: nextCondition,
        };
    }

    // Parse the body
    const body = parseCaseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.CASE,
        condition,
        body,
    };
}

function parseDefault(currentIndex: { currentIndex: number }, tokens: Token[]): ASTDefaultNode {
    currentIndex.currentIndex++; // Advance past 'default'

    // Ensure the body starts with ':'
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.DOUBLE_DOT) {
        throw new Error("Expected ':' after 'default'");
    }
    currentIndex.currentIndex++; // Consume ':'

    // Parse the body directly
    const body: ASTBlockNode = {
        type: ASTNodeType.BLOCK,
        children: []
    };

    // Parse all statements within the block
    while (
        currentIndex.currentIndex < tokens.length &&
        tokens[currentIndex.currentIndex].type !== TOKEN_TYPES.CLOSE_BRACE
    ) {
        const statement = READ_FILE(currentIndex, tokens, []); // Parse each statement
        if (statement) {
            body.children!.push(statement);
        }
    }

    // Ensure the body ends with 'bruh'
    const endToken = tokens[currentIndex.currentIndex];
    if (!endToken || endToken.type !== TOKEN_TYPES.CLOSE_BRACE) {
        throw new Error(`Expected '}' to end 'default' block, but got '${endToken?.type}'`);
    }
    // currentIndex.currentIndex++; // doesnt consume '}' so it can end 

    return {
        type: ASTNodeType.DEFAULT,
        body,
    };
}


function parseSwitch(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'switch'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'switch'");
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition
    const condition = parseExpression(0, currentIndex, tokens);

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'switch' statement");
    }

    currentIndex.currentIndex++; // Consume ')'

    // Ensure the body starts with '{'
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_BRACE) {
        throw new Error("Expected '{' after condition in 'switch' statement");
    }

    currentIndex.currentIndex++; // Consume '{'

    const cases: ASTCaseNode[] = [];
    let defaultCase: ASTDefaultNode | null = null;

    // Parse all cases and the default case
    while (currentIndex.currentIndex < tokens.length) {
        const currentToken = tokens[currentIndex.currentIndex];

        if (currentToken.type === TOKEN_TYPES.CASE) {
            cases.push(parseCase(currentIndex, tokens));
        } else if (currentToken.type === TOKEN_TYPES.DEFAULT) {
            defaultCase = parseDefault(currentIndex, tokens);
            break; // Exit the loop after parsing the default case
        } else {
            throw new Error(`Unexpected token '${currentToken.type}' in 'switch' statement`);
        }
    }

    // Ensure the body ends with '}'
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_BRACE) {
        throw new Error("Expected '}' after cases in 'switch' statement.");
    }
    currentIndex.currentIndex++; // Consume '}'

    return {
        type: ASTNodeType.SWITCH,
        condition,
        cases,
        default: defaultCase,
    };
}

function parseDo(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'do'

    // Parse the body
    const body = parseBlock(currentIndex, tokens);


    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.WHILE) {
        throw new Error("Expected 'while' after 'do' block");
    }

    currentIndex.currentIndex++; // Consume 'while'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'while'");
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition
    let condition = parseCondition(currentIndex, tokens);

    //Logical operators
    while (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.LOGICALOPERATOR) {
        const logicalOperator = (tokens[currentIndex.currentIndex] as Token & { value: string }).value; // Store the operator (e.g., && or ||)
        currentIndex.currentIndex++; // Consume '&&' or '||'

        const nextCondition = parseCondition(currentIndex, tokens); // Parse the second condition

        // Combine the conditions into a new AST node
        condition = {
            type: ASTNodeType.LOGICALOPERATOR,
            value: logicalOperator,
            left: condition,
            right: nextCondition,
        };
    }

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'do-while' loop");
    }

    currentIndex.currentIndex++; // Consume ')'

    return {
        type: ASTNodeType.DO,
        condition,
        body,
    };
}


// Function to read the file
function READ_FILE(currentIndex: { currentIndex: number }, tokens: Token[], parenStack: number[]): ASTNode | null {
    const currentToken = tokens[currentIndex.currentIndex]; // Get the current token

    // Ignore linebreaks and semicolons (they are not needed in the AST)
    if (currentToken.type === TOKEN_TYPES.LINEBREAK || currentToken.type === TOKEN_TYPES.SEMICOLON) {
        parseIgnore(currentIndex, tokens);
    }

    // Handle open parenthesis and braces
    // Delegate to parseBraceAndParen to handle the contents of the parenthesis or braces by recursively calling READ_FILE
    if (currentToken.type === TOKEN_TYPES.OPEN_PAREN || currentToken.type === TOKEN_TYPES.OPEN_BRACE) {
        parseBraceAndParen(currentIndex, tokens, parenStack);
    }

    // Handle strings
    if (currentToken.type === TOKEN_TYPES.STRING) {
        return parsePrimary(currentIndex, tokens);
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

    // Handle literals
    if (currentToken.type === TOKEN_TYPES.LITERAL) {
        return parsePrimary(currentIndex, tokens);
    }

    // Handle Logical Operators
    if (currentToken.type === TOKEN_TYPES.LOGICALOPERATOR) {
        return parseLogicalOperator(currentIndex, tokens);
    }

    // Handle true literals
    if (currentToken.type === TOKEN_TYPES.TRUE) {
        return parsePrimary(currentIndex, tokens);
    }

    // Handle false literals
    if (currentToken.type === TOKEN_TYPES.FALSE) {
        return parsePrimary(currentIndex, tokens);
    }

    // Handle break statements
    if (currentToken.type === TOKEN_TYPES.BREAK) {
        return parseBreak(currentIndex, tokens);
    }

    // Handle continue statements
    if (currentToken.type === TOKEN_TYPES.CONTINUE) {
        return parseContinue(currentIndex, tokens);
    }

    // Handle for loops
    if (currentToken.type === TOKEN_TYPES.FOR) {
        return parseFor(currentIndex, tokens);
    }

    // Handle while loops
    if (currentToken.type === TOKEN_TYPES.WHILE) {
        return parseWhile(currentIndex, tokens);
    }

    // Handle do-while loops
    if (currentToken.type === TOKEN_TYPES.DO) {
        return parseDo(currentIndex, tokens);
    }
   
    // Handle if statements 
    if (currentToken.type === TOKEN_TYPES.IF) {
        return parseIf(currentIndex, tokens);
    }

    // Handle else statements
    if (currentToken.type === TOKEN_TYPES.ELSE) {
        return parseElse(currentIndex, tokens);
    }

    // Handle if-else statements
    if (currentToken.type === TOKEN_TYPES.IFELSE) {
        return parseIfElse(currentIndex, tokens);
    }

    // Handle switch statements
    if (currentToken.type === TOKEN_TYPES.SWITCH) {
        return parseSwitch(currentIndex, tokens);
    }

    // Handle case statements
    if (currentToken.type === TOKEN_TYPES.CASE) {
        return parseCase(currentIndex, tokens);
    }

    // Handle default statements
    if (currentToken.type === TOKEN_TYPES.DEFAULT) {
        return parseDefault(currentIndex, tokens);
    }

    // Unitary operators
    if (currentToken.type === TOKEN_TYPES.UNITARYOPERATOR) {
        return parseUnitaryExpression(currentIndex, tokens);
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
