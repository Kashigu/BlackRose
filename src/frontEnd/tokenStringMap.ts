import { Token, TOKEN_TYPES } from './tokens';

export const tokenStringMap: Array<{
    key: string,
    value: Token
}> = [
    { key: '\n', value: { type: TOKEN_TYPES.LINEBREAK } },
    { key: 'create', value: { type: TOKEN_TYPES.VARIABLEDECLARATION } }, // if appears Create then it is a variable declaration
    { key: '=', value: { type: TOKEN_TYPES.ASSIGNMENTOPERATOR } },
    { key: 'write', value: { type: TOKEN_TYPES.WRITE } },
    { key: 'yap', value: { type: TOKEN_TYPES.WRITE } },
    { key: '(', value: { type: TOKEN_TYPES.OPEN_PAREN } },
    { key: ')', value: { type: TOKEN_TYPES.CLOSE_PAREN } },
    { key: '+', value: { type: TOKEN_TYPES.BINARYOPERATOR, value: '+' } },
    { key: '-', value: { type: TOKEN_TYPES.BINARYOPERATOR, value: '-' } },
    { key: '*', value: { type: TOKEN_TYPES.BINARYOPERATOR, value: '*' } },
    { key: '/', value: { type: TOKEN_TYPES.BINARYOPERATOR, value: '/' } },
    { key: ';', value: { type: TOKEN_TYPES.SEMICOLON } },
    { key: '//', value: { type: TOKEN_TYPES.COMMENT, value: '//' } },
    { key: 'null', value: { type: TOKEN_TYPES.NULL } },
    { key: 'stroke' , value: { type: TOKEN_TYPES.FOR } },
    { key: '{', value: { type: TOKEN_TYPES.OPEN_BRACE } },
    { key: '}', value: { type: TOKEN_TYPES.CLOSE_BRACE } },
    { key: '==', value: { type: TOKEN_TYPES.COMPARISONOPERATOR, value:"==" } },
    { key: '++', value: { type: TOKEN_TYPES.UNITARYOPERATOR, value:"++" } },
    { key: '+=', value: { type: TOKEN_TYPES.BINARYOPERATOR, value:"+=" } },
 ]
