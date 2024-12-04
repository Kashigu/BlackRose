// Token types
export enum TOKEN_TYPES  {
    VariableDeclaration = "CREATE", // like const or let
    WRITE = "WRITE", // console.log
    STRING = "STRING",
    LITERAL = "LITERAL",
    OPEN_PAREN = "OPEN_PAREN",
    CLOSE_PAREN = "CLOSE_PAREN",
    SEMICOLON = "SEMICOLON",
    LINEBREAK = "LINEBREAK",
    AssignmentOperator = "AssignmentOperator", // =
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
                     TokenNode<TOKEN_TYPES.VariableDeclaration> |
                     TokenNode<TOKEN_TYPES.AssignmentOperator> |
                     TokenNode<TOKEN_TYPES.WRITE> | TokenNodeValue<TOKEN_TYPES.STRING> | 
                     TokenNodeValue<TOKEN_TYPES.LITERAL> | TokenNode<TOKEN_TYPES.OPEN_PAREN> | 
                     TokenNode<TOKEN_TYPES.CLOSE_PAREN> | TokenNode<TOKEN_TYPES.SEMICOLON> | 
                     TokenNode<TOKEN_TYPES.LINEBREAK>;



