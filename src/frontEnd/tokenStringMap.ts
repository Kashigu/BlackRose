import { Token, TOKEN_TYPES } from './tokens';


export const tokenStringMap: Array<{
    key: string,
    value: Token
}> = [
    { key: '\n', value: { type: TOKEN_TYPES.LINEBREAK } },
    { key: 'create', value: { type: TOKEN_TYPES.VARIABLEDECLARATION } }, // if appears Create then it is a variable declaration
    { key: '=', value: { type: TOKEN_TYPES.ASSIGNMENTOPERATOR } }, // if appears = then it is an assignment operator
    { key: 'write', value: { type: TOKEN_TYPES.WRITE } }, // if appears write then it is a console.log
    { key: 'yap', value: { type: TOKEN_TYPES.WRITE } }, // if appears yap then it is a console.log
    { key: 'null', value: { type: TOKEN_TYPES.NULL } }, // if appears null then it is a null
    { key: 'stroke' , value: { type: TOKEN_TYPES.FOR } }, // if appears stroke then it is a for loop
    { key: 'betagain', value: { type: TOKEN_TYPES.IFELSE } }, // if appears betagain then it is an if else statement
    { key: 'bet', value: { type: TOKEN_TYPES.IF } }, // if appears bet then it is an if statement
    { key: 'badcall', value: { type: TOKEN_TYPES.ELSE } }, // if appears badcall then it is an else statement
    { key: 'bruh', value: { type: TOKEN_TYPES.BREAK } }, // if appears bruh then it is a break statement
    { key: 'grind', value: { type: TOKEN_TYPES.CONTINUE } }, // if appears grind then it is a continue statement
 ]
