# intro

You already know how to solve two equations at the same time — like finding where two lines cross. But what if I told you there's a **machine** that eats equations and spits out answers? Using a **matrix** representation of this problem, we can generally solve this kind of problem.

You might imagine that this is a bit of a toy problem, but this sort of thing happens all the time! You can thing of each row as being a true statement about the relationship between these two variables. It could be, for example, that x is really a variable representing time (where 0 is perhaps right now!), and y represents the amount of apples produced by my uncle Pete per day, and consumed by my uncle Doug per day (a bit of a contrived example perhaps! Hopefully Doug doesn't actually eat strictly as a function of time). Finding the intersection of these two true statements tells us when the amount of apples eaten, and consumed, per day are the same. 

Try changing the numbers below. You're writing two equations, and the matrix on the right is the same information — just organized differently.

Critically, try a few important ones to find a few interesting ones!
1. where the matrix is diagonal - only 1 times x in the first row, and only one times y on the second
2. where the two equations are equal
3. where the two lines are parallel and so they do not touch!

# middle

## How matrix multiplication works

So how does the matrix "contain" those two equations? There's a rule — **matrix multiplication** — and it's worth memorizing because it's the same rule every time, forever. It's weird, sort of. But you only have to learn it once, and trust me it's easy and sort of satisfying.

:::definition
To multiply a matrix by another matrix (or vector): take one **row** of the matrix, go across it left to right, and multiply each entry by the matching entry going **down** a column vector (or in our case with the xs and ys, just the vector itself. A Vector is just like an Nx1 matrix, really, where N is the number of rows). Add those products together. That gives you one number in the result. Repeat for every row.
:::playful
Across the row, down the column, multiply and add. Each row produces one number in the answer.
:::end

Let's see how it recovers our equations. Suppose the matrix holds the coefficients, and the vector holds our unknowns x and y:

- **Row 1**: go across — you pick up the first coefficient times x, plus the second coefficient times y. That sum equals the first entry on the right-hand side. That's just our first equation, written out!
- **Row 2**: same idea — across the second row, down the same vector. You get the second equation back.

So matrix multiplication is the bridge between the compact grid and the pair of equations you started with. The two notations say exactly the same thing. The matrix form is just tidier — and once you have a rule for multiplying, you can start *inverting* the process to solve for x and y directly.

:::callout color=muted
This "across-and-down" rule also works for multiplying two full matrices together (not just a matrix times a vector). Each row of the left matrix gets paired with each column of the right matrix. We'll see that later — for now, one column (a vector) is enough.
:::end

## The size check — something genuinely new is happening

Stop and notice something. Up to now, every multiplication in your life has been between things of the **same kind**: a number times a number. Matrices are the first time you're multiplying two objects that can have **different sizes** — a 2×2 grid times a 2×1 column, say. That's a real upgrade, and it comes with one new responsibility: not every pair of matrices *can* be multiplied. So whenever you read two matrices standing next to each other, do the quick ritual that every mathematician, physicist, and game programmer does silently, every time:

1. Write the two shapes side by side: {{(2×2)(2×1)}}.
2. Look at the two numbers in the **middle**. They must **match**. (That's the row going *across* meeting the column going *down* — they have to be the same length, or the pairs don't pair up.)
3. If they match, cross them out. The two **outer** numbers that remain are the shape of the answer: {{2×1}}.

:::callout color=cyan
**Middle numbers must match. Outer numbers are the shape of the answer.** If the middle numbers don't match, the multiplication simply doesn't exist — this isn't a rule someone invented to annoy you, it's the across-and-down rule protecting itself. Try to break it below.
:::end

# outro

Now you can state the whole game cleanly. The compact form **Ax = b** -- note this is sort of a different meaning of **x**, to just stand-in for __any__ kind of variable -- and captures any system of simple (linear) relationships. Solving means finding **x = A⁻¹b** — one matrix multiplication. Computers have a systematic way of getting that A⁻¹ , which means that our goal shifts from doing the manual variable substitutions by hand towards just writing down the relationship as a matrix. This is still where the most important understanding is: correctly interpreting the true statements as equations. 

:::callout color=muted
Technical footnote: any time we do matrix stuff, it is not commutative; so, that means that order matters! o you have to multiply by A⁻¹ on the *left* of both sides. For now, just trust that the arithmetic works out. You'll see inverses more formally once you've met determinants (Chapter 5).
:::end

:::takehome color=gold
:::major
- A system of two linear equations can be rewritten as a single **matrix equation**: coefficients go in the matrix, unknowns go in the vector, constants go on the right.
- Solving the system = finding the point where the two lines cross on the graph. The algebra and the geometry are the same thing seen two ways.
- The matrix form collapses the whole procedure into the compact expression **Ax = b**, whose solution is **x = A⁻¹b** — one multiplication.
:::minor
- The manual algebra takes ~8 steps; the matrix form does it in 1, provided you have the inverse.
- A⁻¹ exists exactly when the determinant of A is non-zero.
- When the two lines are parallel, det(A) = 0, the inverse doesn't exist, and there is no unique solution. The "machine" is not reversible.
:::end
