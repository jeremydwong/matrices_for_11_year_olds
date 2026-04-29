# intro

Here is an operation that unlocks an enormous amount of geometry using nothing but arithmetic you already know.

The **dot product** of two vectors is a single number: multiply matching parts, add them up. From this one operation, you get perpendicularity, projection, and length — the entire toolkit of 2D geometry, expressed in pure arithmetic.

This chapter has two parts. **Part A** introduces the dot product as a definition and shows how a zero dot product means perpendicular. **Part B** reveals the *meaning* — the dot product is a shadow-measuring device, with a clean formula `a · b = ‖a‖ · ‖b‖ · s`, where `s` is the fractional alignment between the vectors.

# outro

:::takehome color=green
:::major
- The **dot product** of two vectors is a single number: a₁b₁ + a₂b₂. Pure arithmetic you can do in your head.
- Two vectors are **perpendicular** exactly when their dot product is zero. This is the cleanest test for perpendicularity in all of math.
- Geometrically, **a · b = ‖a‖ · ‖b‖ · s**, where **s** is the **shadow factor** in [−1, 1] — how aligned the two vectors are. The dot product is just the product of lengths times this fractional alignment.
- **Gram-Schmidt**: subtract one vector's shadow on another, and what's left is perpendicular to it. You can turn any two vectors into a perpendicular pair.
:::minor
- Sign hint: positive dot product means the vectors point roughly the same way; negative means roughly opposite.
- The **length of the shadow** of a on b (a signed number) is (a · b) / ‖b‖.
- The projection *vector* is that shadow length times the unit vector along b: (a · b / b · b) · **b**.
- A vector's **length-squared** is its dot product with itself. Length is just √(a · a).
- The shadow factor turns out to be the cosine of the angle between the vectors — but you don't need to know anything about angles to use it.
:::end
