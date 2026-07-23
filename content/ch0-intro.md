# intro

Hi Espen, I thought this might be a fun and educational thing to do. Nothing helps learning like building! Today we're going to try learning about matrices by building and playing, inspired by what I see you do on Brilliant all the time. 

A **matrix** is just a way of organizing numbers. You usually see them as a grid pattern, with filled rows and columns like a spreadsheet. At a glance they just look...unmanagable! But don't worry: matrices are just the standard way to represent relationships between things. 

- A **system of equations**: coefficients (for us now, just integers) stacked into a grid which we can then use to solve interactions systematically
- A **transformation of space**: rules for moving every point to a new location.
- A **rotation, stretch, shear, or flip**: these operations actually span _all_ of the possible linear operations!
- A **probability model**: the chances of changing between states over time.
- A **graph of connections**: who links to whom, who influences whom.
- An **image, a sound, a dataset**: anything that can be laid out as rows and columns, we can find the correlations between them the simplify the huge mass of numbers!

Note: nobody learns all of these different things at once! But with the right motivation, and some selective **cherry-picking** of a few good examples, I hope to be able to get us comfy with the idea of using matrices early in life. I think the earlier the better with this sort of thing.

Note 2: There are two ways of considering Matrices. In one sense you could think of them as just a way of structuring data as we move from thinking about things in one dimension (a simple x vs y graph) to thinking about things that could have many dimensions. I think that's pretty fair. But one key to this way of thinking is that it turns out that this organizational trick of using matrices can be studied on its own. Knowing things about them--at the level that you already know the elementary operations--is a secret goal that I have, by showing you these things early. It would be just so good if you felt the comfort of some matrix operations at the same level of the comfort you feel with multiplying: and one thought I have is that that comfort only comes with long exposure, over years. I'm trying to make some of these operations old habits, and matrices themselves old friends =) (#nerd).

Let's just start with something you already know: solving two equations at once. Matrices as a way to compactly write that down. I then show how to use matrices to describe transformations of space. Once we're talking about space, I thought it made a bit of sense to talk about some other operations like 'dot products' and 'cross products' that are kinda similar to multiplication, but which are slightly more exotic, since they work not on just numbers (like your addition and multiplication) but on vectors (Aside: Vectors, by the way, are just the individual rows or columns of a matrix and, yes, we even just call them 'row vectors' or 'column vectors'). Dot products have a connection to shadows that I think is intuitive. Then we talk about how Rotations in both 2D (which we do first) and 3D (which we do after) can be represented as matrices. Calculating volume of a box, or even a sheered/squished box like a parallelaploid--can be done with another operation on a matrix, called a determinant. Then we do something more exotic and talk about how we do computer vision with 2D cameras, in a method using 'homogeneous coordinates' add a clever dimension; Markov chains show that matrices can even represent *chance*; Google's original PageRank algorithm turns out to be one clever eigenvector calculation on a Markov chain the size of the internet; PCA shows how to find the natural axes of a real cloud of data (we use actual heart-study measurements from 300 people); and finally, neural networks reveal that all of modern AI is built on these same ideas.

:::callout color=gold
I really want to give you a flavour of matrices as one mathematical **language** — a way of writing down relationships so that a computer, or a person with a pencil, can manipulate them. Once you recognize the language, you'll start seeing it everywhere and hopefully just be relaxed about it.
:::end

## Prerequisites

All we need to know is Basic algebra: solving equations, substitution, and factoring quadratics. That's enough. No trigonometry required — we'll discover sine and cosine when we need them, as a consequence of what I think might be more basic ideas. 
