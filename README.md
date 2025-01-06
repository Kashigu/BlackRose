# BlackRose

BlackRose is a programming language that I created to understand how compilers work
It's built using Flex (lexical analyzer) and Bison (parser generator)

## Stacks Used
- TypeScript

## Screenshots



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
|         | while         | ❌           |
|         | break         | ❌           |
|         | continue      | ❌           |
|         | float         | ❌           |
|         | double        | ❌           |
|         | char          | ❌           |
|         | const         | ❌           |
|         | case          | ❌           |
|         | default       | ❌           |
|         | do            | ❌           |
|         | enum          | ❌           |
|         | extern        | ❌           |
|         | goto          | ❌           |
|         | long          | ❌           |
|         | short         | ❌           |
|         | signed        | ❌           |
|         | sizeof        | ❌           |
|         | static        | ❌           |
|         | struct        | ❌           |
|         | switch        | ❌           |
|         | union         | ❌           |
|         | unsigned      | ❌           |
|         | volatile      | ❌           |
|         | true          | ❌           |
|         | false         | ❌           |

## Code Example

create X = "Y is equal to"

create Y = 10

write X Y


bet (Y < 15)
{
    yap "Y is indeed less then 15 " 
}betagain(Y > 15)
{
    write "Y is indeed more then 15 "
}badcall
{
    yap Y
}


// for loop
stroke (create I = 0; I <= Y; I++)
{
    write Y
    write I
}

## Important Notice
This project is intended for educational purposes only. It is a demonstration of my comprehension with how compilers work.
