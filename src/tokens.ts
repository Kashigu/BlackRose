export type Token = { type: string; value: string };

// Token types
export const TOKEN_TYPES = {
    WRITE: "WRITE",
    READ: "READ",
    ADD: "ADD",
    SUB: "SUB",
    MUL: "MUL",
    DIV: "DIV",
    STRING: "STRING",
    NUMBER: "NUMBER",
    VARIABLECONTENT: "VARIABLE", //represents a variable (ex:a)
    TYPEOFNODE: "TYPEOF", //represents a type of node (ex: string, number, boolean)
    VALUENODE: "VALUE", //represents a fixed value (ex:5 / "Hello")
    VARIABLEREFENRENCENODE: "VARIABLE_REFERENCE", //represents a variable reference (ex:a)
    OPEN_PAREN: "OPEN_PAREN",
    CLOSE_PAREN: "CLOSE_PAREN",
    SEMICOLON: "SEMICOLON",
    EOF: "EOF", // End of file (input)
    INVALID: "INVALID", // Invalid token
};
