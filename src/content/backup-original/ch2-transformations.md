# intro

A 2×2 matrix doesn't just hold numbers — it acts on space. This chapter unfolds that idea in three parts.

In **Part A**, we'll lay down the rule for matrix-times-vector multiplication. There's nothing natural about it; mathematicians defined it the way they did because it turns out to be enormously useful. Once you know the rule, the rest of linear algebra is bookkeeping.

In **Part B**, we'll see what one matrix does to one point — and discover that the matrix's columns are building blocks. Every output is a recipe of "x times column 1, plus y times column 2."

In **Part C**, we'll let the matrix loose on every point in the plane. The whole grid warps. But here's the punchline: you don't need to track every point. You only need two — where {{x̂}} and {{ŷ}} land. Those two destinations *are* the two columns of the matrix.

# outro

:::takehome color=cyan
:::major
- Matrix × vector is **defined** row-by-row: each row of the matrix multiplies matching parts with the vector and adds them up.
- The output always equals **x · (column 1) + y · (column 2)**. The matrix's columns are building blocks; the vector is the recipe for mixing them.
- The entire transformation is captured by where the basis vectors {{x̂}} and {{ŷ}} land. Those two destinations *are* the columns of the matrix.
:::minor
- The identity matrix [1 0 / 0 1] leaves every vector alone.
- Under a linear transformation, straight lines stay straight, and the origin never moves.
- Once you know where {{x̂}} and {{ŷ}} go, you can predict where every other vector goes without doing any new arithmetic.
:::end
