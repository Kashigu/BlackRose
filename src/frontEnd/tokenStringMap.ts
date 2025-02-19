import { Token, TOKEN_TYPES } from './tokens';


export const tokenStringMap: Array<{
    key: string,
    value: Token
}> = [
    { key: '\n', value: { type: TOKEN_TYPES.LINEBREAK } },
    { key: 'create', value: { type: TOKEN_TYPES.VARIABLEDECLARATION } }, // if appears Create then it is a variable declaration
    { key: 'write', value: { type: TOKEN_TYPES.WRITE } }, // if appears write then it is a console.log
    { key: 'yap', value: { type: TOKEN_TYPES.WRITE } }, // if appears yap then it is a console.log
    { key: 'null', value: { type: TOKEN_TYPES.NULL } }, // if appears null then it is a null
    { key: 'stroke' , value: { type: TOKEN_TYPES.FOR }  }, // if appears stroke then it is a for loop
    { key: 'betagain', value: { type: TOKEN_TYPES.IFELSE } }, // if appears betagain then it is an if else statement
    { key: 'bet', value: { type: TOKEN_TYPES.IF } }, // if appears bet then it is an if statement
    { key: 'badcall', value: { type: TOKEN_TYPES.ELSE } }, // if appears badcall then it is an else statement
    { key: 'bruh', value: { type: TOKEN_TYPES.BREAK } }, // if appears bruh then it is a break statement
    { key: 'grind', value: { type: TOKEN_TYPES.CONTINUE } }, // if appears grind then it is a continue statement
    { key: 'edge', value: { type: TOKEN_TYPES.WHILE } }, // if appears loop then it is a while loop
    { key: 'W', value: { type: TOKEN_TYPES.TRUE, value: 'true'  } } , // if appears W then it is a true
    { key: 'L', value: { type: TOKEN_TYPES.FALSE, value: 'false' } }, // if appears L then it is a false
    { key: 'chat', value: { type: TOKEN_TYPES.SWITCH } }, // if appears chat then it is a switch statement
    { key: 'if', value: { type: TOKEN_TYPES.CASE } }, // if appears if then it is a case statement
    { key: 'well', value: { type: TOKEN_TYPES.DEFAULT } }, // if appears well then it is a default statement
    { key: 'slay', value: { type: TOKEN_TYPES.DO } }, // if appears slay then it is a do statement
    { key: 'cook', value: { type: TOKEN_TYPES.FUNCTION } }, // if appears cook then it is a function statement
    { key: 'spit', value: { type: TOKEN_TYPES.RETURN } }, // if appears spit then it is a return statement

 ]
