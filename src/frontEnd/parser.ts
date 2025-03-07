import { ASTBlockNode, ASTNode, ASTNodeType , ASTCaseNode , ASTDefaultNode} from "./ast";
import { Token, TOKEN_TYPES } from "./tokens";


function getOperatorPrecedence(operator: string): number {
    switch (operator) {
        case '||':
            return 1;
        case '&&':
            return 2;
        case '+':
        case '-':
            return 3;
        case '*':
        case '/':
            return 4;
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

    if (currentToken.type === TOKEN_TYPES.NULL) {
        currentIndex.currentIndex++; // Consume 'null'
        return {
            type: ASTNodeType.NULL,
            value: null,
        };
    }

    // Handle literals
    if (currentToken.type === TOKEN_TYPES.LITERAL) {    
        currentIndex.currentIndex++; // Consume the literal token

        // Check if the next token is an assignment operator
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.ASSIGNMENTOPERATOR) {
            return parseAssignmentDeclaration(currentIndex, tokens);
        }

        // Check if the next token is open parenthesis
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.OPEN_PAREN) {
            return parseFunctionCall(currentIndex, tokens, currentToken.value);
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
        const expr = parseExpression(0,currentIndex, tokens);
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.CLOSE_PAREN) {
            currentIndex.currentIndex++; // Consume ')'
            return expr;
        }
    
        throw new Error(`Expected ')' after expression at line ${currentToken.line} and column ${currentToken.column}`);
    }
    

    if ( tokens[currentIndex.currentIndex].value === undefined)
    {
        throw new Error(`Unexpected "${tokens[currentIndex.currentIndex].type}" at line ${tokens[currentIndex.currentIndex].line} and column ${tokens[currentIndex.currentIndex].column}`);
    }else {
        throw new Error(`Unexpected "${tokens[currentIndex.currentIndex].value}" at line ${tokens[currentIndex.currentIndex].line} and column ${tokens[currentIndex.currentIndex].column}`);
    }
}

function parseUnitaryExpression(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    // Goes back to the previous token to get left 
    currentIndex.currentIndex--; // Go back to the previous token
    const left = parsePrimary(currentIndex, tokens);

    const operator = tokens[currentIndex.currentIndex];

    if (operator?.type !== TOKEN_TYPES.UNITARYOPERATOR) {
        throw new Error(`Unexpected "${operator.value}" at line ${operator.line} and column ${operator.column}`);
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
        throw new Error(`Expected Expression at position ${currentIndex.currentIndex} at line ${tokens[currentIndex.currentIndex].line}`);
    }

    let operator = tokens[currentIndex.currentIndex];

    //Comparison Operator first
    if (operator?.type === TOKEN_TYPES.COMPARISONOPERATOR) {
        currentIndex.currentIndex++; // Consume the comparison operator token
        let right = parsePrimary(currentIndex, tokens);
        left = {
            type: ASTNodeType.COMPARISONOPERATOR,
            left,
            right,
            value: operator.value,
        };
        operator = tokens[currentIndex.currentIndex];
    }

    // Handle binary, comparison, and logical operators in the same loop
    while (
        operator &&
        (operator.type === TOKEN_TYPES.BINARYOPERATOR ||
         operator.type === TOKEN_TYPES.LOGICALOPERATOR) &&
        getOperatorPrecedence(operator.value) >= precedence
    ) {
        const currentPrecedence = getOperatorPrecedence(operator.value);

        currentIndex.currentIndex++; // Consume the operator token
        let right = parseExpression(currentPrecedence + 1, currentIndex, tokens); // Ensure right-hand side is parsed correctly

        left = {
            type: operator.type === TOKEN_TYPES.BINARYOPERATOR ? ASTNodeType.BINARYOPERATOR : ASTNodeType.LOGICALOPERATOR, // Handle all cases in one place
            left, 
            right, 
            value: operator.value, 
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
        throw new Error("Expected '(' after 'write' or 'yap' statement at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }

    //save the line so it can be used in the error message
    const line = tokens[currentIndex.currentIndex].line;

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
            throw new Error(`Unauthorized value '${token.value}' at line ${token.line}`);
        }
    }

    // Consume the line break token after the write statement only consume one line break
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error(`Expected ')' at the end of 'write' or 'yap' statement at line ${line}`);
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
        throw new Error(`Expected ')' after expression at line ${currentToken.line} and column ${currentToken.column} ` );
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
        throw new Error(`Expected Variable Name after 'create', but got ${variableNameToken?.type} at line ${variableNameToken?.line} and column ${variableNameToken?.column}`);
    }
    const variableName = variableNameToken.value; 
    currentIndex.currentIndex++; // Consume the variable name
    const assignmentToken = tokens[currentIndex.currentIndex];
    if (!assignmentToken || assignmentToken.type
        !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
        throw new Error(`Expected '=' after Variable Name, but got ${assignmentToken?.type} at line ${assignmentToken?.line} and column ${assignmentToken?.column}`);
    }
    currentIndex.currentIndex++; // Consume '='
    const value = parseExpression(0, currentIndex, tokens);
    if (!value) {
        throw new Error(`Expected Expression after '=' for Variable Declaration at line ${assignmentToken.line} and column ${assignmentToken.column}`);
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

    const variableNameToken = tokens[currentIndex.currentIndex];

    if (!variableNameToken || variableNameToken.type !== TOKEN_TYPES.LITERAL) {
        throw new Error(`Expected Variable Name, but got ${variableNameToken?.type} at line ${variableNameToken?.line} and column ${variableNameToken?.column}`);
    }

    const variableName = variableNameToken.value;
    currentIndex.currentIndex++; // Consume variable name

    // Ensure next token is an Assignment Operator
    const assignmentToken = tokens[currentIndex.currentIndex];
    if (!assignmentToken || assignmentToken.type !== TOKEN_TYPES.ASSIGNMENTOPERATOR) {
        throw new Error(`Expected Assignment Operator, but got ${assignmentToken?.type} at line ${assignmentToken?.line} and column ${assignmentToken?.column}`);
    }

    const operator = assignmentToken.value; // Capture operator (`=`, `+=`, `-=`, etc.)
    currentIndex.currentIndex++; // Consume assignment operator

    // Parse the right-hand side expression
    const value = parseExpression(0, currentIndex, tokens);
    if (!value) {
        throw new Error(`Expected Expression after '${operator}' at line ${assignmentToken.line} and column ${assignmentToken.column}`);
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
        throw new Error(`Expected '{' but got '${startToken?.type}' at line ${startToken?.line} and column ${startToken?.column}`);
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
        currentIndex.currentIndex--; // Go back to the previous token
        const preveiousToken = tokens[currentIndex.currentIndex]
        throw new Error(`Expected '}' but got '${preveiousToken?.type}' at line ${preveiousToken?.line} and column ${preveiousToken?.column}`);
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
        throw new Error(`Expected ':' but got '${startToken?.type}' at line ${startToken?.line} and column ${startToken?.column}`);
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
    // As the block only can end with bruh as the while above says I dont need to check if the block ends with bruh
    currentIndex.currentIndex++; // Consume 'bruh'

    return block;
}

function parseFor(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'for'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error(`Expected '(' after 'stroke' at line ${tokens[currentIndex.currentIndex].line} and column ${tokens[currentIndex.currentIndex].column}`);
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
        throw new Error("Expected ';' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }
    currentIndex.currentIndex++; // Consume ';'

    // Parse the Expression (this should be a comparison, e.g., X == 1)
    const condition = parseExpression(0,currentIndex, tokens);

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.SEMICOLON) {
        throw new Error("Expected ';' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
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
        throw new Error("Unexpect value at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }

    
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' at the end of 'stroke' statement at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
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
        throw new Error("Expected '(' after 'bet' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the first condition
    let condition = parseExpression(0,currentIndex, tokens);

    // get the last token so I can get the line and column
    currentIndex.currentIndex--;
    const line = tokens[currentIndex.currentIndex].line;
    const column = tokens[currentIndex.currentIndex].column;
    // goes forward to the next token
    currentIndex.currentIndex++;

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after Condition in 'bet' Statement at line " + line + " and column " + column);
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
        throw new Error("Expected '(' after 'betagain' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition

    let condition = parseExpression(0,currentIndex, tokens);

    // get the last token so I can get the line and column
    currentIndex.currentIndex--;
    const line = tokens[currentIndex.currentIndex].line;
    const column = tokens[currentIndex.currentIndex].column;
    // goes forward to the next token
    currentIndex.currentIndex++;

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after condition in 'betagain' statement at line " + line + " and column " + column);
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
        throw new Error("Expected '(' after 'edge' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition

    let condition = parseExpression(0,currentIndex, tokens);

    // get the last token so I can get the line and column
    currentIndex.currentIndex--;
    const line = tokens[currentIndex.currentIndex].line;
    const column = tokens[currentIndex.currentIndex].column;
    // goes forward to the next token
    currentIndex.currentIndex++;

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after Condition in 'edge' loop at line " + line + " and column " + column);
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

    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.OPEN_PAREN) {
        currentIndex.currentIndex++; // Consume '('
    }
    
    let condition = parseExpression(0,currentIndex, tokens);

    if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.CLOSE_PAREN) {
        currentIndex.currentIndex++; // Consume ')'
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
        throw new Error("Expected ':' after 'well' at line " + tokens[currentIndex.currentIndex].line + " and column " + tokens[currentIndex.currentIndex].column);
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

    //get the last token so I can get the line
    currentIndex.currentIndex--;
    const line = tokens[currentIndex.currentIndex].line;
    const column = tokens[currentIndex.currentIndex].column;

    currentIndex.currentIndex++; // goes forward to the next token

    // Ensure the body ends with 'bruh'
    const endToken = tokens[currentIndex.currentIndex];
    if (!endToken || endToken.type !== TOKEN_TYPES.CLOSE_BRACE) {
        throw new Error(`Expected '}' to end 'well' statement at line ${line} and column ${column}`);
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
        throw new Error("Expected '(' after 'chat' at line " + tokens[currentIndex.currentIndex].line);
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the condition
    const condition = parseExpression(0, currentIndex, tokens);

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after Condition in 'chat' statement at line " + tokens[currentIndex.currentIndex].line);
    }

    currentIndex.currentIndex++; // Consume ')'

    // Ensure the body starts with '{'
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_BRACE) {
        throw new Error("Expected '{' after ')' in 'chat' statement at line " + tokens[currentIndex.currentIndex].line);
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
            break; // Exit the loop after reaching the end of the switch statement
        }
    }
    // Getting the last token so I can get the line
    currentIndex.currentIndex--; 

    const line = tokens[currentIndex.currentIndex].line;
    const column = tokens[currentIndex.currentIndex].column;

    // goes forward to the next token
    currentIndex.currentIndex++; 

    // Ensure the body ends with '}'
    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_BRACE) {
        throw new Error("Expected '}' at the end of 'bruh' to end 'chat' statement at line " + line + " and column " + column);
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
        throw new Error("Expected 'edge' after 'slay' block at line " + tokens[currentIndex.currentIndex].line);
    }

    currentIndex.currentIndex++; // Consume 'while'

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error("Expected '(' after 'edge' at line " + tokens[currentIndex.currentIndex].line);
    }

    currentIndex.currentIndex++; // Consume '('

    // Parse the EXPRESSION
    let condition = parseExpression(0,currentIndex, tokens);


    //get the last token so I can get the line and column
    currentIndex.currentIndex--; 
    const line = tokens[currentIndex.currentIndex].line;
    const colunm = tokens[currentIndex.currentIndex].column;
    //goes forward to the next token
    currentIndex.currentIndex++;

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error("Expected ')' after Condition in 'slay-edge' loop at line " + line + " and column " + colunm);
    }

    currentIndex.currentIndex++; // Consume ')'

    return {
        type: ASTNodeType.DO,
        condition,
        body,
    };
}

function parseFunction(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'function'

    const functionNameToken = tokens[currentIndex.currentIndex];
    if (!functionNameToken || functionNameToken.type !== TOKEN_TYPES.LITERAL) {
        throw new Error(`Expected Function Name after 'cook', but got ${functionNameToken?.type} at line ${functionNameToken?.line} and column ${functionNameToken?.column}`);
    }
    const functionName = functionNameToken.value;
    currentIndex.currentIndex++; // Consume the function name

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.OPEN_PAREN) {
        throw new Error(`Expected '(' after Function Name, but got ${tokens[currentIndex.currentIndex]?.type} at line ${tokens[currentIndex.currentIndex]?.line} and column ${tokens[currentIndex.currentIndex]?.column}`);
    }
    currentIndex.currentIndex++; // Consume '('

    const parameters: string[] = [];
    while (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        const parameterToken = tokens[currentIndex.currentIndex];
        if (!parameterToken || parameterToken.type !== TOKEN_TYPES.LITERAL) {
            throw new Error(`Expected Parameter Name, but got ${parameterToken?.type} at line ${parameterToken?.line} and column ${parameterToken?.column}`);
        }
        parameters.push(parameterToken.value);
        currentIndex.currentIndex++; // Consume the parameter name

        // If next token is a comma, consume it and continue
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.COMMA) {
            currentIndex.currentIndex++; // Consume ','

            // Prevent trailing comma before `)`
            if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.CLOSE_PAREN) {
                throw new Error(`Unexpected ',' before ')' in cook '${functionName}' at line ${tokens[currentIndex.currentIndex]?.line}, column ${tokens[currentIndex.currentIndex]?.column}`);
            }
        }
    }
    currentIndex.currentIndex++; // Consume ')'

    const body = parseBlock(currentIndex, tokens);

    return {
        type: ASTNodeType.FUNCTION,
        name: functionName,
        parameters,
        body,
    };

}

function parseFunctionCall(currentIndex: { currentIndex: number }, tokens: Token[], functionName: string): ASTNode {
    currentIndex.currentIndex++; // Consume '('

    const args: ASTNode[] = [];

    // Parse function arguments (expressions like literals or numbers)
    while (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        const argument = parsePrimary(currentIndex, tokens); // Parse argument (number, literal, etc.)
        args.push(argument);

        // If next token is a comma, consume it and continue parsing arguments
        if (tokens[currentIndex.currentIndex]?.type === TOKEN_TYPES.COMMA) {
            currentIndex.currentIndex++; // Consume ','
        }
    }

    if (tokens[currentIndex.currentIndex]?.type !== TOKEN_TYPES.CLOSE_PAREN) {
        throw new Error(`Expected ')' after function call '${functionName}', but got ${tokens[currentIndex.currentIndex]?.type} at line ${tokens[currentIndex.currentIndex]?.line}, column ${tokens[currentIndex.currentIndex]?.column}`);
    }
    currentIndex.currentIndex++; // Consume ')'

    return {
        type: ASTNodeType.FUNCTIONCALL,
        name: functionName,
        arguments: args,
    };
}

function parseReturn(currentIndex: { currentIndex: number }, tokens: Token[]): ASTNode {
    currentIndex.currentIndex++; // Advance past 'return'
    
    // Parse the return value
    const returnValue = parseExpression(0, currentIndex, tokens);

    return {
        type: ASTNodeType.RETURN,
        value: returnValue,
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
            value: null,
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
    // Handle Functions 
    if (currentToken.type === TOKEN_TYPES.FUNCTION) {
        return parseFunction(currentIndex, tokens);
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

    if (currentToken.type === TOKEN_TYPES.RETURN){
        return parseReturn(currentIndex, tokens);
    }

    if (!currentToken.value){
        throw new Error(`Unexpected '${currentToken.type}' at line ${currentToken.line} and column ${currentToken.column}`);
    }else {
        // Throw error for unexpected tokens
        throw new Error(`Unexpected token ${currentToken.value} of type '${currentToken.type}' at line ${currentToken.line} and column ${currentToken.column}`);
    }
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