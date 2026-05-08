# intro

You already know how to solve two equations at the same time — like finding where two lines cross. But what if I told you there's a **machine** that eats equations and spits out answers? Using a **matrix** representation of this problem, we can generally solve this kind of problem.

You might imagine that this is a bit of a toy problem, but this sort of thing happens all the time! You can thing of each row as being a true statement about the relationship between these two variables. It could be, for example, that x is really a variable representing time (where 0 is perhaps right now!), and y represents the amount of apples produced by my uncle Pete per day, and consumed by my uncle Doug per day (a bit of a contrived example perhaps! Hopefully Doug doesn't actually eat strictly as a function of time). Finding the intersection of these two true statements tells us when the amount of apples eaten, and consumed, per day are the same. 

Try changing the numbers below. You're writing two equations, and the matrix on the right is the same information — just organized differently.

Critically, try a few important ones to find a few interesting ones!
1. where the matrix is diagonal - only 1 times x in the first row, and only one times y on the second
2. where the two equations are equal
3. where the two lines are parallel and so they do not touch!

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
