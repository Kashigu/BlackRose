export enum ValueTypes {
    STRING = 'String',
    LITERAL = 'Literal',
    NUMBER = 'Number',
    NULL = 'Null',
    BOOLEAN = 'Boolean'
}


export interface ValueNode<T extends ValueTypes> {
    type: T;
}

export interface ValueNodeValue<T extends ValueTypes, K> extends ValueNode<T> {
    value: K;
}

export type Value = ValueNodeValue<ValueTypes.STRING, string> |
                    ValueNodeValue<ValueTypes.LITERAL, string> |
                    ValueNodeValue<ValueTypes.NUMBER, number> |
                    ValueNodeValue<ValueTypes.BOOLEAN, boolean> |
                    ValueNodeValue<ValueTypes.NULL, null>;