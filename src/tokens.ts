// Token types
export enum TOKEN_TYPES  {
    VARIABLEDECLARATION = "Create", // like const or let
    WRITE = "Write", // console.log
    STRING = "String",
    NUMBER = "Number",
    LITERAL = "Literal",
    OPEN_PAREN = "Open_Paren",
    CLOSE_PAREN = "Close_Paren",
    SEMICOLON = "Semicolon",
    LINEBREAK = "Linebreak",
    ASSIGNMENTOPERATOR = "AssignmentOperator", // =
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
                     TokenNode<TOKEN_TYPES.VARIABLEDECLARATION> |
                     TokenNode<TOKEN_TYPES.ASSIGNMENTOPERATOR> |
                     TokenNode<TOKEN_TYPES.WRITE> | TokenNodeValue<TOKEN_TYPES.STRING> | 
                     TokenNodeValue<TOKEN_TYPES.LITERAL> | TokenNode<TOKEN_TYPES.OPEN_PAREN> | 
                     TokenNode<TOKEN_TYPES.CLOSE_PAREN> | TokenNode<TOKEN_TYPES.SEMICOLON> | 
                     TokenNode<TOKEN_TYPES.LINEBREAK> | TokenNodeValue<TOKEN_TYPES.NUMBER>;




