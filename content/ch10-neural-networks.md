# intro

Time to use everything together. A **neural network** is a stack of matrix multiplications with a tiny non-linear function squished between each pair. That's it. The matrices contain the **weights** — millions or billions of numbers in modern networks — and the magic is that they can be tuned, by gradient descent, to make the network do almost anything you want.

:::definition
A neural network **layer** is a function L(**x**) = σ(W**x** + **b**), where W is a weight matrix, **b** is a bias vector, and σ is a non-linear "activation" function applied element-wise (e.g., tanh or ReLU). A network is a composition L₃(L₂(L₁(**x**))) of such layers.
:::playful
Each layer = (matrix multiply) + (slide) + (gentle non-linear squish). The matrix multiply stretches and rotates space. The slide is the homogeneous-coordinates translation from Chapter 6. The squish is what makes the whole thing capable of more than just rotations and stretches — it lets the network learn *curved* decision boundaries.
:::end

Here's the key fact: **neural networks are universal function approximators.** Given enough hidden units, they can approximate any continuous function. So you can train them to map photos → "cat" or "dog," or sentences → "happy" or "sad," or sensor readings → "tumor" or "healthy."

For a beautiful example, consider this dataset: a **red blob in the center, surrounded by a blue ring**. No straight line can separate them — the inner blob is completely encircled. So how does a neural network solve this? It **warps the space** until they *are* linearly separable. Watch.

# outro

Notice what just happened. The network never "saw" the rings as rings — it only sees coordinates. It started with random weight matrices, and gradient descent nudged them, step by step, toward a configuration where the hidden representation makes the two classes linearly separable. Each row of **W₁** is a direction in input space; the hidden unit "fires" (outputs near +1) when the input has positive overlap with that direction. The bias **b₁** shifts the firing threshold. With 3+ such directions, the network learns to lift the inner blob out of the plane.

## Going deeper

Two essential reads:

- **Christopher Olah**, [Neural Networks, Manifolds, and Topology](https://colah.github.io/posts/2014-03-NN-Manifolds-Topology/) — the original argument that low-dim networks face topological barriers, with beautiful animations of layers as continuous deformations of space.
- **Andrej Karpathy**, [ConvNetJS 2D classification demo](https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html) — interactively try different datasets, watch deeper networks learn more elaborate decision boundaries in real time.

:::takehome color=green
:::major
- A neural network **layer** is just a matrix multiplication followed by a tiny non-linearity. A whole network is a chain of these.
- Networks are **universal function approximators**: given enough hidden units, they can learn any continuous mapping from input to output.
- Classification works by **warping space** until the classes become linearly separable. The hidden layer learns a representation in which a flat hyperplane can slice the classes apart.
- Topology sets a hard limit: separating a blob from a ring around it **requires at least 3 hidden units**, no matter how deep the network. With 2 units, the rings stay tangled. With 3, the network can lift one blob out of the plane.
:::minor
- The non-linearity is what lets the network do anything beyond a single matrix transformation. Without it, a stack of layers would collapse to a single linear map.
- "Universal" doesn't mean easy: *finding* the right weights via gradient descent can be slow, and many architectures get stuck in local minima.
- Modern networks (image, language) follow the same recipe at vastly larger scale — billions of weights organized into matrices, often with tricks like attention to share information across positions.
- Each row of the first weight matrix is a "feature detector": a direction in input space that the corresponding hidden unit responds to.
:::end
