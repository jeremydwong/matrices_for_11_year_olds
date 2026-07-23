# intro

A 2×2 matrix doesn't just hold numbers — it acts on space. This chapter unfolds that idea in three parts.

In **Part A**, we'll see what one matrix does to one point — and discover that the matrix's columns are building blocks. Every output is a recipe of "x times column 1, plus y times column 2."

In **Part B**, we'll let the matrix loose on every point in the plane. The whole grid warps. But you don't need to track every point: You only need two — where {{x̂}} and {{ŷ}}, what we call *basis vectors* representing the x and y axes, land. Those two destinations *are* the two columns of the matrix.

# parta

Now let's **see** what that multiplication does. The green vector is your input. The matrix grabs it and spits out the gold vector. Drag the input around — the matrix transforms every point to a new location.

# parta_end

:::callout color=cyan
See the cyan dashed and pink dashed arrows? The output is **x × (first column) + y × (second column)**. The matrix's columns are like building blocks — the input vector says how much of each to use. This is the secret of matrix multiplication: it's a **recipe** for mixing the columns.
:::end

# partb

:::definition
A **linear transformation** of the plane is a function T that maps every vector to another vector, while respecting two properties: it preserves addition (T(u + v) = T(u) + T(v)) and scalar multiplication (T(k · v) = k · T(v)). Every 2×2 matrix **M** defines exactly one linear transformation via the rule T(v) = Mv, and every linear transformation arises from a unique 2×2 matrix.
:::playful
In plain English: a matrix can **stretch** space (pull or squish along some direction), **rotate** it, **shear** it, or **flip** it. It can combine these operations. But there's one thing a matrix *cannot* do on its own: it can never **slide** (translate) space, because the origin always stays put. We'll unlock translation with a clever trick in Chapter 6 (Homogeneous Coordinates).
:::end

If a matrix can move **one** point, it can move **every** point. Below, every blue dot is an original grid point. The gold dot is where the matrix sends it.

Here's the key insight: you don't need to think about every point. You only need two special vectors: {{x̂}} = [1, 0] and {{ŷ}} = [0, 1] — the **basis vectors**. Watch where the matrix sends *those two*, and everything else follows.

# partb_end

:::callout color=gold
The dashed **cyan** is where {{x̂}} used to be; the bold **cyan** is where the matrix sends it — and that's just the first column of the matrix! Same for **ŷ and the second column**. The entire gold grid is built from these two arrows. Every other point is just some amount of x̂ʼ plus some amount of ŷʼ.

Try the presets: **Stretch X** pulls x̂ further while leaving ŷ alone. **Shear** tilts ŷ sideways. **Flip** reverses x̂. **Rotate 45°** spins both basis vectors together.
:::end

# outro

:::takehome color=cyan
:::major
- Matrix × vector is **defined** row-by-row: each row of the matrix multiplies matching parts with the vector and adds them up.
- The output always equals **x · (column 1) + y · (column 2)**. The matrix's columns are building blocks; the vector is the recipe for mixing them.
- The entire transformation is really captured by where the basis vectors {{x̂}} and {{ŷ}} land. Those two destinations *are* the columns of the matrix.
:::minor
- The identity matrix [1 0 / 0 1] leaves every vector alone.
- Under a linear transformation, straight lines stay straight, and the origin never moves.
- Once you know where {{x̂}} and {{ŷ}} go, you can predict where every other vector goes without doing any new arithmetic.
:::end
