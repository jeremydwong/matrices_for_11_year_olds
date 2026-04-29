# intro

A **matrix** is just a rectangle of numbers. That's it. What makes matrices interesting is not what they *are*, but what they can *stand for*. The same rectangle of numbers can represent:

- A **system of equations**: coefficients stacked into a grid.
- A **transformation of space**: a rule for moving every point to a new location.
- A **rotation, stretch, shear, or flip**: geometry encoded as numbers.
- A **probability model**: chances of hopping between states over time.
- A **graph of connections**: who links to whom, who influences whom.
- An **image, a sound, a dataset**: anything that can be laid out as rows and columns.

Nobody learns all of these at once. This short course **cherry-picks** a handful — the ones most useful for modelling the world — and walks through them in an order that lets each idea build on the previous one.

You'll start with something you already know (solving two equations at once), meet matrices as a way to compactly write that down, and then discover that the *same* rectangle of numbers secretly describes transformations of space. From there: dot products unlock perpendicularity and projections; rotations emerge as a special family of matrices; determinants tell you when things collapse; homogeneous coordinates add a clever dimension; Markov chains show that matrices can even represent *chance*; and finally, neural networks reveal that all of modern AI is built on these same ideas.

:::callout color=gold
The goal isn't to master linear algebra. It's to see matrices as a **language** — a way of writing down relationships so that a computer, or a person with a pencil, can manipulate them. Once you recognize the language, you'll start seeing it everywhere.
:::end

## Prerequisites

Basic algebra: solving equations, substitution, and factoring quadratics. That's enough. No trigonometry required — we'll discover sin and cos when we need them, as a consequence of more primitive ideas.
