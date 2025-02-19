// Token types
export enum TOKEN_TYPES  {
    VARIABLEDECLARATION = "VariableDeclaration", // like const or let
    WRITE = "write", // console.log
    STRING = "String", // "Hello, World!"
    NUMBER = "Number", // 1, 2, 3, etc
    LITERAL = "Literal", // variable name
    OPEN_PAREN = "Open_Paren", // (
    CLOSE_PAREN = "Close_Paren", // )
    SEMICOLON = "Semicolon", // ; 
    DOUBLE_DOT = "Double_Dot", // :
    LINEBREAK = "Linebreak", // \n
    ASSIGNMENTOPERATOR = "AssignmentOperator", // = , +=, -=, *=, /=
    BINARYOPERATOR = "BinaryOperator", // +, -, *, / , +=, -=
    COMMENT = "Comment", // //
    NULL = "Null", // null
    FOR = "Stroke", // for loop
    OPEN_BRACE = "Open_Brace", // {
    CLOSE_BRACE = "Close_Brace", // }
    COMPARISONOPERATOR = "Comparison", // ==, !=, <, >, <=, >=
    UNITARYOPERATOR = "UnitaryOperators", // ++ or --
    IF = "If", // if statement
    ELSE = "Else", // else statement
    IFELSE = "IfElse", // if else statement
    BREAK = "Break", // break statement
    CONTINUE = "Continue", // continue statement,
    WHILE = "While", // while loop
    TRUE = "True", // true
    FALSE = "False", // false
    LOGICALOPERATOR = "LogicalOperator", // &&, ||
    UNARYOPERATOR = "UnaryOperator", // !
    SWITCH = "Switch", // switch statement
    CASE = "Case", // case statement
    DEFAULT = "Default", // default statement
    DO = "Do", // do statement
    FUNCTION = "Function", // function statement
    RETURN = "Return", // return statement
    COMMA = "Comma", // ,
}

//Create a TokenNode with the type of the token
interface TokenNode <T extends TOKEN_TYPES> {
    type: T;
    line?: number;
    column?: number;
    value?: string; // this is making the function below useless
}

//Create a TokenNode with the type of the token and the value
interface TokenNodeValue<T extends TOKEN_TYPES> extends TokenNode<T> {
    value: string;
}

export type  Token = 
                     TokenNode<TOKEN_TYPES.VARIABLEDECLARATION> | 
                     TokenNode<TOKEN_TYPES.WRITE> | TokenNode<TOKEN_TYPES.OPEN_PAREN> | 
                     TokenNode<TOKEN_TYPES.CLOSE_PAREN> | TokenNode<TOKEN_TYPES.SEMICOLON> | 
                     TokenNode<TOKEN_TYPES.DOUBLE_DOT> |
                     TokenNode<TOKEN_TYPES.LINEBREAK> | TokenNode<TOKEN_TYPES.NULL> |
                     TokenNode<TOKEN_TYPES.FOR> |
                     TokenNode<TOKEN_TYPES.WHILE> |
                     TokenNode<TOKEN_TYPES.IF> |
                     TokenNode<TOKEN_TYPES.SWITCH> |
                     TokenNode<TOKEN_TYPES.CASE> |
                     TokenNode<TOKEN_TYPES.DEFAULT> |
                     TokenNode<TOKEN_TYPES.BREAK> | 
                     TokenNode<TOKEN_TYPES.CONTINUE> |
                     TokenNode<TOKEN_TYPES.DO> |
                     TokenNode<TOKEN_TYPES.ELSE> |
                     TokenNode<TOKEN_TYPES.IFELSE> |
                     TokenNode<TOKEN_TYPES.OPEN_BRACE> | TokenNode<TOKEN_TYPES.CLOSE_BRACE> |
                     TokenNode<TOKEN_TYPES.FUNCTION> | TokenNode<TOKEN_TYPES.RETURN> |
                     TokenNode<TOKEN_TYPES.COMMA> |
                     
                     TokenNodeValue<TOKEN_TYPES.COMPARISONOPERATOR> | TokenNodeValue<TOKEN_TYPES.UNITARYOPERATOR> |
                     TokenNodeValue<TOKEN_TYPES.LOGICALOPERATOR> | TokenNodeValue<TOKEN_TYPES.UNARYOPERATOR> |
                     TokenNodeValue<TOKEN_TYPES.TRUE> | TokenNodeValue<TOKEN_TYPES.FALSE> |
                     TokenNodeValue<TOKEN_TYPES.NUMBER> | TokenNodeValue<TOKEN_TYPES.STRING> | 
                     TokenNodeValue<TOKEN_TYPES.LITERAL> | TokenNodeValue<TOKEN_TYPES.COMMENT> |
                     TokenNodeValue<TOKEN_TYPES.BINARYOPERATOR> |
                     TokenNodeValue<TOKEN_TYPES.ASSIGNMENTOPERATOR> ;
                     




