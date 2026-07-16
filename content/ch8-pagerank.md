# intro

In 1998, two students — Larry Page and Sergey Brin — were annoyed at how bad web search was. Search engines back then mostly counted how many times a page repeated your search word, so a junk page that said "newts newts newts" a hundred times would beat the best newt page on Earth. Their fix became Google. And here's the wonderful part: the whole trick was the *previous chapter*.

Their idea was called **PageRank** (partly a pun on Larry Page's name): a page is important if important pages link to it. That sounds circular — importance defined using importance! — but matrices eat that kind of circularity for breakfast. Imagine a **random surfer** who starts anywhere on the web and just keeps clicking random links, forever. Pages the surfer keeps landing on are important. But "click a random link" is exactly a Markov-chain hop: the web is the movie complex, pages are the rooms, and links are the doors. The fraction of time the surfer spends on each page, in the long run, is the steady state of one gigantic transition matrix — a row and a column for every page on the web.

:::definition
An **eigenvector** of a matrix A is a nonzero vector **v** that the matrix does not turn — it only stretches it: A**v** = λ**v**, where the number λ (the **eigenvalue**) is the stretch factor. The steady state of a Markov chain is an eigenvector with λ = 1: the matrix leaves it completely alone.
:::playful
Most vectors, when a matrix hits them, get knocked off in some new direction. An eigenvector is a direction the matrix *respects*: point along it, and the matrix pushes along that very same line — just harder, softer, or backwards. Eigenvectors are the matrix's own natural axes: its directions of resonance.
:::end

Why call it *resonance*? Apply the same matrix over and over — hop, hop, hop — and whatever part of your vector points along the strongest eigenvector gets amplified compared to everything else. The other directions fade in comparison, and the vector settles onto that special line, the way a guitar string settles into its natural note no matter how messily you pluck it. That settling is exactly why last chapter's wanderer forgot where they started, and it's literally how Google computed PageRank: keep applying "follow a random link" until the visit-counts stop changing.

One honest warning, because it matters next chapter: a matrix's eigenvectors are its natural axes, but nobody promised those axes meet at **right angles**. Usually they don't! They're just the directions the matrix doesn't turn, and they can lean toward each other like a half-collapsed easel. Hold that thought.

## Feel the resonance first

Before the web, try it by hand. Below is a single 2×2 matrix. The <b>cyan</b> arrow is your vector **v** — sweep it around with the slider. The <b>gold</b> arrow is A**v**, where the matrix sends it. Most of the time they point different ways. Hunt for the directions where gold lines up exactly with cyan: those are the eigenvectors, and the moment you hit one you'll see it.

# middle

## Now rank a (tiny) web

Here are six little websites. An arrow means "links to." Press **Surf** to release the random surfer: each step is one multiplication by the link matrix, and the bars are the surfer's probability of being on each page. Watch them settle — that resting ranking *is* Google's original search result. Then edit the links and try to make a boring page important. (Hint: it's not how *many* links you get. It's *who* links to you.)

# outro

One more Page-and-Brin trick deserves a mention. What if a page has no links out? Or two pages link only to each other and trap the surfer forever? Their fix: with a small probability (they used about 15%), the surfer ignores links entirely and **teleports** to a random page. That guarantees every page can reach every page — which, as we saw last chapter, is exactly the condition for the steady state to exist and be unique. One tiny hack; one trillion-dollar company.

:::takehome color=purple
:::major
- An **eigenvector** of A is a direction A doesn't turn, only stretches: A**v** = λ**v**. Eigenvectors are a matrix's natural axes — its directions of resonance.
- Multiplying by the same matrix again and again amplifies the strongest eigenvector until it dominates. That's why Markov chains settle, and it's how PageRank is actually computed (the "power method").
- **PageRank** is the steady-state eigenvector of the web's link matrix. Google's original ranking of the entire internet was one eigenvector calculation.
:::minor
- Eigenvectors are generally **not** perpendicular to each other. Next chapter we meet the special matrices whose natural axes are.
- The 15% "teleport" makes the web's matrix behave, guaranteeing one unique ranking no matter where the surfer starts.
- "Eigen" is German for "own" — an eigenvector is the matrix's *own* vector.
:::end
