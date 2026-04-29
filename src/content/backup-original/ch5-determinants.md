# intro

Two vectors form a parallelogram. A single number captures how "big" that parallelogram is — and that number is packed with hidden information about the matrix.

:::definition
The **determinant** of a 2×2 matrix [[a, b], [c, d]] is defined as the number det = ad − bc. For a matrix whose columns are vectors **u** and **v**, |det| equals the area of the parallelogram spanned by **u** and **v**.
:::playful
Multiply diagonals, subtract. The answer tells you two things at once: how much the matrix scales area, and whether it flips orientation (negative = flipped).
:::end

# outro

:::takehome color=magenta
:::major
- For a 2×2 matrix [[a, b], [c, d]], the determinant is **det = ad − bc**.
- The absolute value of the determinant is the **area** of the parallelogram formed by the matrix's columns. The matrix stretches or shrinks area by this factor.
- When **det = 0**, the parallelogram collapses to a line — the matrix is not invertible, and the system of equations from Chapter 1 has no unique solution. This closes the loop between algebra and geometry.
:::minor
- Positive determinant = orientation preserved (counterclockwise). Negative = flipped (clockwise).
- Every rotation matrix has determinant 1 — rotations preserve area exactly.
- A reflection matrix has determinant −1 — same area, flipped orientation.
:::end
