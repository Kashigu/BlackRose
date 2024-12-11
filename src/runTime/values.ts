export type ValueTypes = "null" | "string" | "number" | "literal";


export interface ValueNode<T extends ValueTypes> {
    type: T;
}

export interface ValueNodeValue<T extends ValueTypes, K> extends ValueNode<T> {
    value: K;
}

export type Value = 
                     ValueNodeValue<"string", string> | 
                     ValueNodeValue<"literal", string> | 
                     ValueNodeValue<"number", string> |
                     ValueNodeValue<"null", string> ;