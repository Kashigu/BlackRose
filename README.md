# BlackRose

BlackRose is a programming language that I created to understand how compilers work

## Stacks Used
- TypeScript


## 📚 Language Reference

### Keywords

|    BlackRose   | TS Equivalent | Implemented? |
| -------------- | ------------- | ------------ |
| create         | const         | ✅           |
| write/yap      | console.log   | ✅           |
| stroke         | for           | ✅           |
| bet            | if            | ✅           |
| betagain       | else if       | ✅           |
| badcall        | else          | ✅           |
| edge           | while         | ✅           |
| bruh           | break         | ✅           |
| grind          | continue      | ✅           |
| if             | case          | ✅           |
| well           | default       | ✅           |
| slay           | do            | ✅           |
| cook           | function      | ✅           |
| spit           | return        | ✅           |
|                | goto          | ❌           |
|                | long          | ❌           |
|                | short         | ❌           |
|                | signed        | ❌           |
|                | sizeof        | ❌           |
|                | static        | ❌           |
|                | struct        | ❌           |
| chat           | switch        | ✅           |
|                | union         | ❌           |
|                | unsigned      | ❌           |
|                | volatile      | ❌           |
| W              | true          | ✅           |
| L              | false         | ✅           |


### Operators

The language supports basic arithmetic operators:

- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `=` Assignment
- `<` Less than
- `<=` Less or Equal than
- `>` Greater than
- `>=` Greater or Equal than
- `==` Equal
- `!=` Different
- `&&` Logical AND
- `||` Logical OR
- `+=` Addition Assignment
- `-=` Subtraction Assignment
- `*=` Multiplication Assignment
- `/=` Division Assignment
- `!`  Logical Negation

## Code Example

```plaintext
create X = "Y is equal to "

create Y = 10

write (X Y)
// Y is equal to 10


// if statement
bet (Y < 15)
{
    yap ("Y is indeed less then 15 ")
    // yap is the same as write
}
betagain(Y > 15)
{
    write ("Y is indeed more then 15 ")
}
badcall
{
    yap (Y)
}

// for loop
stroke (create I = 0; I <= Y; I++)
{
    write (Y)
    write (I)
}
```

## Important Notice
This project is intended for educational purposes only. It is a demonstration of my comprehension with how compilers work.
