# BlackRose

BlackRose is a programming language that I created to understand how compilers work

## Stacks Used
- TypeScript


## 📚 Language Reference

### Keywords

|    BlackRose   | TS Equivalent | Implemented? |
| -------------- | ------------- | ------------ |
| create         | let           | ✅           |
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
| chat           | switch        | ✅           |
| null           | null          | ✅           |
| W              | true          | ✅           |
| L              | false         | ✅           |

### Supports

It supports these type of variables like:
- String
- Number
- Float
- Null
- Array ( with mix types ( [1, "text", W] ) )


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

## How to Install
- Clone the repository 
- Make sure you have ts-node installed globally on your system or else it will never work if you dont have it run:
- `npm install -g ts-node`
- Inside of the folder run: `npm install` and `npm link`

- If you receive a message about ExecutionPolicy go to your Windows Powershell in Administrator mode and write this command:
- `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- If answered write Y 

- If you desire to go back just run:
- `Set-ExecutionPolicy Restricted -Scope CurrentUser`
- If answered write Y 

### How to Use

After the installation process just run on your console
`blackrose "path of the folder" filename.blk`

## Important Notice
This project is intended for educational purposes only. It is a demonstration of my comprehension with how Compilers and Programming Languages work.
