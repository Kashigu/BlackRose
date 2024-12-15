// Token types
export enum TOKEN_TYPES  {
    VARIABLEDECLARATION = "VariableDeclaration", // like const or let
    WRITE = "Write", // console.log
    STRING = "String", // "Hello, World!"
    NUMBER = "Number", // 1, 2, 3, etc
    LITERAL = "Literal", // variable name
    OPEN_PAREN = "Open_Paren", // (
    CLOSE_PAREN = "Close_Paren", // )
    SEMICOLON = "Semicolon", // ; 
    LINEBREAK = "Linebreak",
    ASSIGNMENTOPERATOR = "AssignmentOperator", // =
    BINARYOPERATOR = "BinaryOperator", // +, -, *, /
    COMMENT = "Comment", // //
    NULL = "Null", // null
    FOR = "For", // for loop
    OPEN_BRACE = "Open_Brace", // {
    CLOSE_BRACE = "Close_Brace", // }
    COMPARISONOPERATOR = "Comparison", // ==, !=, <, >, <=, >=
    UNITARYOPERATOR = "UnitaryOperators", // ++ or --
}

//Create a TokenNode with the type of the token
interface TokenNode <T extends TOKEN_TYPES> {
    type: T;
}

//Create a TokenNode with the type of the token and the value
interface TokenNodeValue<T extends TOKEN_TYPES> extends TokenNode<T> {
    value: string;
}

export type  Token = 
                     TokenNode<TOKEN_TYPES.VARIABLEDECLARATION> | TokenNode<TOKEN_TYPES.ASSIGNMENTOPERATOR> |
                     TokenNode<TOKEN_TYPES.WRITE> | TokenNode<TOKEN_TYPES.OPEN_PAREN> | 
                     TokenNode<TOKEN_TYPES.CLOSE_PAREN> | TokenNode<TOKEN_TYPES.SEMICOLON> | 
                     TokenNode<TOKEN_TYPES.LINEBREAK> | TokenNode<TOKEN_TYPES.NULL> |
                     TokenNode<TOKEN_TYPES.FOR> |
                     TokenNode<TOKEN_TYPES.OPEN_BRACE> | TokenNode<TOKEN_TYPES.CLOSE_BRACE> |

                     TokenNodeValue<TOKEN_TYPES.COMPARISONOPERATOR> | TokenNodeValue<TOKEN_TYPES.UNITARYOPERATOR> |

                     TokenNodeValue<TOKEN_TYPES.NUMBER> | TokenNodeValue<TOKEN_TYPES.STRING> | 
                     TokenNodeValue<TOKEN_TYPES.LITERAL> | TokenNodeValue<TOKEN_TYPES.COMMENT> |
                     TokenNodeValue<TOKEN_TYPES.BINARYOPERATOR>;
                     




