# intro

Now for the big reveal: **what matrix rotates things without stretching them?** From Chapter 3, you learned that perpendicular means "dot product = zero" and that lengths come from dot products too. A rotation must preserve both. There's exactly one family of matrices that does this — and it forces the functions cos and sin to appear.

This chapter has three parts. **Part A** introduces the rotation matrix R(θ) and shows how it acts on shapes in the plane. **Part B** derives that matrix from scratch by writing the new basis vectors in old-frame coordinates — using the same recipe from Chapter 2. **Part C** steps up to 3D, rotating around the z-axis, where the structure of the matrix becomes even clearer.

# outro

:::takehome color=orange
:::major
- Rotation by angle θ is captured by the matrix **R(θ) = [[cos θ, −sin θ], [sin θ, cos θ]]**. One angle, one matrix.
- **cos** and **sin** aren't mysterious. They are the **shadows** of a unit vector onto the x and y axes — cos θ is the x-shadow, sin θ is the y-shadow. The rotation matrix simply drops those two shadows into the right slots.
- Rotation matrices are the only 2×2 matrices that preserve all dot products, which means they preserve every length, every angle, and every perpendicular pair simultaneously.
:::minor
- Default to **radians** for formulas. A full turn is 2π; right angle is π/2. Radians are unit-free, which is why they play nicely with calculus and matrix algebra. Degrees are a display convenience for humans.
- Rotating by 0 or 2π gives the identity matrix — you end up exactly where you started.
- Rotating by π/2 (90°) swaps coordinates and flips a sign. Try it!
- Rotating by angle α, then by β, is the same as rotating by (α + β). This is where the angle-addition formulas come from.
:::end
