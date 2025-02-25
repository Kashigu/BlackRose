const X = 1

let A = 1

function Write (A: number, B: number)
{
   console.log (A)
}

function Add (D: number,B: number)
{
  const C = A+B
  A = 300
  console.log (C)
  console.log (A)
}

console.log (A)

Write(2, 5)

Add(0,10)

console.log (A)