# intro

Here is an operation that unlocks a ton of geometry using nothing but arithmetic.

The **dot product** of two vectors is an operation, like multiplying or dividing. It takes two equally-sized vectors and produces a single number: multiply matching parts, add them up. From this one operation, you get information about perpendicularity, projection, and length — the entire toolkit of 2D geometry, expressed in pure arithmetic.

This chapter has two parts. **Part A** introduces the dot product as a definition and shows how a zero dot product means perpendicular. **Part B** reveals the *meaning* — the dot product is a shadow-measuring device, with a clean formula `a · b = ‖a‖ · ‖b‖ · s`, where `s` is the fractional alignment between the vectors, and `‖a‖` just means the length of vector `a`.

Actually, you can see that by using specifically vectors `a` and `b` having length 1 makes this dot product operation even simpler; then the step of "multiply matching parts, and add up" directly gives `s`, that (signed) fractional alignment (i like the word 'shadow') of the two vectors. 

# outro

:::takehome color=green
:::major
- The **dot product** of two vectors is a single number: a₁b₁ + a₂b₂. Pure arithmetic you can do in your head.
- Two vectors are **perpendicular** iff when their dot product is zero. This is the cleanest test for perpendicularity in all of math. (Aside: 'iff' wasn't a typo! iff means "if and only if")
- Geometrically, **a · b = ‖a‖ · ‖b‖ · s**, where **s** is the **shadow factor** in [−1, 1] — how aligned the two vectors are. The dot product is just the product of lengths times this fractional alignment.
- **Gram-Schmidt**: subtract one vector's shadow on another, and what's left is perpendicular to it. You can turn any two vectors into a perpendicular pair.
:::minor
- Sign hint: positive dot product means the vectors point roughly the same way; negative means roughly opposite.
- The **length of the shadow** of a on b (a signed number) is (a · b) / ‖b‖.
- The projection *vector* is that shadow length times the unit vector along b: (a · b / b · b) · **b**.
- A vector's **length-squared** is its dot product with itself. Length is just √(a · a).
- The shadow factor turns out to have a specific name from trigonometry: the 'cosine' of the angle between the vectors — but you don't need to know anything about angles to use dot products. I hope teaching it this way doesn't cause brain damage. But I'm curious, and you're good enough at this stuff that I think you'll do well regardless, as long as this is interesting. 
:::end
