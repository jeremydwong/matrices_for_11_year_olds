# intro

You made it all the way through, and thank you for your patience =). Let's zoom out and look at the whole map — starting with the spellbook: the short list of input → output machines you now know how to cast. Below the spells, the summary cards revisit each chapter, and at the bottom there's a "Big Picture" reflection and pointers on where to go next.

# outro

:::callout color=gold
**The Big Picture.** Everything here was meant to be a digestable story. Linear equations became matrices. Matrices became transformations of space. Dot products gave us perpendicularity, lengths, and projections — and those were exactly the tools needed to discover sin and cos hiding inside rotation matrices. Determinants tied it all back to systems of equations. Homogeneous coordinates let us compose transformations. Markov chains showed that a matrix can encode not just geometry but *probability*, with a steady state that quietly introduced eigenvectors. PageRank turned that one eigenvector into a search engine for the entire internet. PCA revealed the deepest structural fact of all — every matrix is just turn, stretch, turn — and used it to find the hidden axes of real medical data. And neural networks revealed that all of modern AI is just stacks of these same matrix transformations, with a tiny non-linear squish in between, tuned to warp space until problems become solvable.
:::end

## Where to go next

- **Matrix inverses in general**: the formal "undo" operation for n×n systems — A⁻¹ exists exactly when det ≠ 0.
- **Eigenvalues with feeling**: complex eigenvalues (they're what pure rotations were hiding), repeated ones, and what they say about stability — why bridges wobble and populations boom or bust.
- **3D vectors and matrices**: everything generalizes; rotation becomes 3×3, and you get cross products.
- **More decompositions**: QR, LU, and the full n-dimensional SVD — the workhorses inside every serious numerical program.
- **Backpropagation**: the calculus-on-matrices that lets neural networks learn from data.
- **Quantum mechanics** (eventually): the universe, as far as anyone can tell, runs on linear algebra.
