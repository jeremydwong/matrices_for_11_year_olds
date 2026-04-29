# intro

Time to see matrices represent **chance** instead of geometry. Picture a person wandering through a movie complex with five places: **Lobby**, **ATM**, **Arcade**, **Washroom**, **Theatre**. Each minute they might stay where they are or move to another area, based on some reasonable habits:

- **ATM → Arcade**: if they just got cash, odds are high they head to the arcade.
- **Arcade → ATM**: games eat coins, so they often loop back for more.
- **Washroom → Theatre**: you go before the movie.
- **Theatre → Theatre**: once inside, they mostly stay watching.

:::definition
A **Markov chain** is a sequence of states X₀, X₁, X₂, … where the probability of the next state depends only on the current state. The probabilities are collected into a **transition matrix** **P**, with entry Pᵢⱼ giving the probability of going from state i to state j. Each row of **P** sums to 1.
:::playful
The matrix is a cheat sheet for the wanderer. Row i tells you "given that I'm at location i right now, here are my odds of being at each location next minute." The past doesn't matter — only where they are now.
:::end

The person starts in the **Lobby**. Click **Hop** to advance one minute. Mathematically, each hop is a matrix–vector multiplication: the probability row-vector times the transition matrix.

# outro

:::takehome color=cyan
:::major
- A **transition matrix** encodes all the state-to-state jump probabilities. Each row sums to 1 (because you have to go *somewhere* next).
- Multiplying the probability vector by the transition matrix advances time by **one step**. Multiplying by the matrix *n* times advances by *n* steps.
- After many steps, the probability vector converges to a **steady state** — a special vector that the matrix doesn't change. This is your first **eigenvector**.
:::minor
- The **Markov property** is "memoryless": only the current state matters; the path taken to get here is irrelevant.
- The steady state doesn't depend on where you started, provided every state can eventually reach every other one.
- Google's **PageRank** is exactly this construction: a giant Markov chain over the web whose steady state ranks pages by importance.
:::end
