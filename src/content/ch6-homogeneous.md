# intro

Here's a problem: matrix multiplication can rotate and scale things, but it can't **slide** (translate) them — because multiplying by a matrix always keeps the origin fixed.

The clever trick: add a fake extra dimension! Instead of a 2D point [x, y], write it as [x, y, **1**]. Now a **3×3 matrix** can encode translation in its last column. All three operations — scale, rotate, translate — become one single matrix multiply.

:::definition
An **affine transformation** of the plane is a function of the form **T(v) = Mv + t**, where **M** is a 2×2 matrix (the linear part) and **t** is a 2D translation vector. Equivalently, in homogeneous coordinates, **T** is the action of a 3×3 matrix whose top-left 2×2 block is **M**, whose top-right 2×1 block is **t**, and whose bottom row is [0, 0, 1].
:::playful
"Affine" = "linear + slide." So an affine transformation is anything you can do to space by combining a stretch/rotate/shear (from Chapter 2) with a translation. Lines stay lines, parallel lines stay parallel — but the origin is no longer guaranteed to stay put.
:::end

# outro

Now you can state the whole picture cleanly. The augmented 3×3 arrangement represents **any affine transformation**: the top-left 2×2 block stores the *linear part* (stretch, rotate, shear, flip), the top-right 2×1 column stores the *translation* (the slide), and the bottom row [0, 0, 1] preserves the extra "1" so it stays a "1" after multiplying.

:::takehome color=purple
:::major
- A plain 2×2 matrix multiplication **cannot** translate (slide) because the origin always maps to itself. This is a real limitation.
- The fix: add an extra dimension. Represent a 2D point [x, y] as a 3D point [x, y, **1**]. Now a 3×3 matrix can slide points around via its last column.
- The augmented 3×3 matrix represents any **affine transformation** (T(v) = Mv + t). Scale, rotate, shear, and translate all combine into a single matrix that you multiply once.
:::minor
- "Affine" = "linear + slide." Linear transformations are affine transformations whose translation vector happens to be zero.
- Affine transformations preserve **straight lines** and **parallelism**, but not lengths or angles in general.
- The bottom row of a homogeneous transform is always [0, 0, 1] — it keeps the extra "1" slot equal to 1.
- This same trick extends to 3D: represent points as [x, y, z, 1] and use 4×4 matrices. Every video game and 3D graphics pipeline works this way.
- Matrix multiplication is not commutative — rotating then translating gives a different result than translating then rotating. Order matters.
:::end
