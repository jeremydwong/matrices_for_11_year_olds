# intro

You already know how to solve two equations at the same time — like finding where two lines cross. But what if I told you there's a **machine** that eats equations and spits out answers? That machine is a **matrix**.

Try changing the numbers below. You're writing two equations, and the matrix on the right is the same information — just organized differently.

# outro

Now you can state the whole game cleanly. The compact form **Ax = b** captures any system of linear equations. Solving means finding **x = A⁻¹b** — one matrix multiplication, given the inverse. The manual algebra above takes ~8 steps; the matrix form does it in 1, provided you have the inverse.

:::callout color=muted
Technical footnote: matrix multiplication is not commutative (order matters), so you have to multiply by A⁻¹ on the *left* of both sides. For now, just trust that the arithmetic works out. You'll see inverses more formally once you've met determinants (Chapter 5).
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
