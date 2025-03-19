export enum ValueTypes {
    STRING = 'String',
    LITERAL = 'Literal',
    NUMBER = 'Number',
    ARRAY = 'Array',
    ARRAYCALL = 'ArrayCall',
    NULL = 'Null',
    BOOLEAN = 'Boolean',
    BREAK = 'Break',
    CONTINUE = 'Continue',
    WRITE = 'Write',
    FUNCTION = 'Function',
}


export interface ValueNode<T extends ValueTypes> {
    type: T;
}

export interface ValueNodeValue<T extends ValueTypes, K> extends ValueNode<T> {
    value: K;
}

interface FunctionValue {
    type: ValueTypes.FUNCTION;
    value: {
        parameters: string[];
        body: any;
    };
}

export type Value = ValueNodeValue<ValueTypes.STRING, string> |
                    ValueNodeValue<ValueTypes.LITERAL, string> |
                    ValueNodeValue<ValueTypes.NUMBER, number> |
                    ValueNodeValue<ValueTypes.BOOLEAN, boolean> |
                    ValueNodeValue<ValueTypes.NULL, null> |
                    ValueNodeValue<ValueTypes.WRITE, null> |
                    ValueNodeValue<ValueTypes.CONTINUE, null> |
                    ValueNodeValue<ValueTypes.BREAK, null>|
                    ValueNodeValue<ValueTypes.ARRAY, any> |
                    ValueNodeValue<ValueTypes.ARRAYCALL, any> |
                    FunctionValue;