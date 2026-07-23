# intro

You already know how to solve two equations at the same time — like finding where two lines cross. But what if I told you (#thematrix; which you have not seen yet!) there's a **machine** that eats equations and spits out answers? Using a **matrix** representation of this problem, we can generally solve this kind of problem without even thinking about it.

You might imagine that this is a bit of a toy problem, but this sort of thing happens all the time! You can thing of each row as being a true statement about the relationship between these two variables. It could be, for example, that x is really a variable representing time (where 0 is perhaps right now!), and y represents the amount of apples produced by my uncle Pete per day, and consumed by my uncle Doug per day (a bit of a contrived example perhaps! Hopefully Doug doesn't actually eat strictly as a function of time). Finding the intersection of these two true statements tells us when the amount of apples eaten, and consumed, per day are the same. 

You might imagine (more interestingly?) that we need to do the same sorts of estimates for the whole world -- all of humans will eventually want to eat like us lucky North Americans, for which we'd need yields (food per acre) to rise by more than 2x; and the same might be said for energy production vs energy consumption.

Try changing the numbers below. You're writing two equations, and the matrix on the right is the same information — just organized differently.

Critically, try a few important ones to find a few interesting ones!
1. where the matrix is diagonal - only 1 times x in the first row, and only one times y on the second
2. where the two equations are equal
3. where the two lines are parallel and so they do not touch!

# middle

## How matrix multiplication works

So how does the matrix "contain" those two equations? There's a rule — **matrix multiplication** — and it's worth memorizing because it's the same rule every time, forever. It's weird, sort of (I almost don't want to say why it's weird, so that maybe you don't notice). But you only have to learn it once, and trust me it's easy and sort of satisfying.

:::definition
To multiply a matrix by another matrix (or vector): take one **row** of the FIRST matrix, go across it left to right, and multiply each entry by the matching entry going **down** a column vector (or in our case with the xs and ys, just the vector itself. A Vector is just like an Nx1 matrix, really, where N is the number of rows). Add those products together. That gives you one number in the result. Repeat for every row.
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

## The size check — Two new thingys

Stop and notice that, before now, every multiplication in your life has been between things of the **same size**: one number times another number. Matrices are the first time you're multiplying two objects that can have **different sizes** — a 2×2 grid times a 2×1 column, say. That's a genuine upgrade--some math folks use the term 'overloading', where, in this case, we've now loaded the idea of multiplying to encompass a similar but more general notion. It comes with one new responsibility: not every pair of matrices *can* be multiplied. So whenever you read two matrices standing next to each other, do the quick ritual that every mathematician, physicist, and game programmer does silently, every time:

1. Write the two shapes side by side: {{(2×2)(2×1)}}.
2. Look at the two numbers in the **middle**. They must **match**. (That's the row going *across* meeting the column going *down* — they have to be the same length, or the pairs don't pair up.)
3. If they match, cross them out. The two **outer** numbers that remain are the shape of the answer: {{2×1}}.

:::callout color=cyan
**Middle numbers must match. Outer numbers are the shape of the answer.** If the middle numbers don't match, the multiplication simply doesn't exist — this isn't a rule someone invented to annoy you, it's the across-and-down rule protecting itself. Try to break it below.
:::end

The second new thing: It might not be apparent yet, but matrices are also the first time you're seeing multiplication order mattering. Of course, you already know your order of operations, so you know about order mattering for doing math. But here, multiplication also loses its order-indifferent nature to operations: AxB in general does not equal BxA, and sometimes of course despite being able to compute AxB you might not even be albe to do BxA if the sizes don't work.

Aside: I hated this when I was learning about matrices. It seemed like a violation of my old trustworthy friend, multiplication, which had an intuition: the area of a field defined by height A and B is always the same, no matter whether you do AxB or BxA. But what i didn't understand is this

:::callout color=cyan
**Matrix order also reflects true intuitions, just about more complicated things.** There are a number of examples that we could get into, but one think you could convince yourself with is rotations of 3D things. Try your Rubix cube: if you do a few different rotations, and then start over again with those rotations shuffled up, you'll see that order matters. So: be better than I was when I learned about matrices; don't be too offended that now, for matrices, order matters. It reflects how real things work.
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
