# intro

Real data almost never arrives as tidy x-and-y pairs that are definitely unrelated (like our "x is time, y is apples" examples from pages ago). Instead we often get a mess of variables, and we'd love to boil down that mess of variables to essentials. 

Some data to motivate: the **Framingham Heart Study**: starting in 1948, doctors began measuring almost everyone in one Massachusetts town — blood pressure, cholesterol, heart rate, and more — and kept going for decades, through their children and grandchildren. It's one of the most important datasets in medical history (it's where the phrase "risk factor" comes from). Below you'll play with 300 real people from its teaching version, seven measurements each.

Seven numbers per person means every person is a point in **seven-dimensional space**, and nobody can picture that. But here's the thing: measurements are often redundant. People with high systolic blood pressure usually have high diastolic pressure too — those two numbers mostly move *together*. So the data isn't really a round seven-dimensional blob. It's a flattened cloud: long in a few directions, thin in the rest. **Principal Component Analysis (PCA)** finds the cloud's own axes — the direction it's most spread out, then the most-spread direction perpendicular to that, and so on.

:::definition
**PCA** finds perpendicular axes for a data cloud, ordered by how much of the cloud's spread (its variance) each one captures. It rests on the **Singular Value Decomposition (SVD)**: *every* matrix, no exceptions, can be written as (rotation) × (stretch along perpendicular axes) × (rotation). SO: PCA takes a matrix, and spits out those 3 things. 
:::playful
Every matrix is secretly just: **turn, stretch, turn**. PCA aims the "stretch" axes at your data so the first one runs down the cloud's long direction. To simplify the data, keep the long axes and politely ignore the thin ones.
:::end

Notice the contrast with last chapter. PageRank's eigenvectors were the link matrix's natural axes, and they leaned however they pleased. PCA's axes come out **guaranteed perpendicular**. Why? They're the eigenvectors of a *symmetric* matrix — the covariance matrix, the grid whose entry (i, j) says "how much does measurement i move together with measurement j" (and moving-with is the same both ways, hence symmetric). Symmetric matrices are exactly the polite ones whose resonance axes stand at right angles. That's the deal SVD offers for every matrix: perpendicular axes in, perpendicular axes out, with all the leaning packed into the stretch numbers in the middle. 

Of course, you give something up with PCA: one thing is the easy units of your inputs. PCA gives you the principle components which are now going off in directions that are mixes of your original variables. That makes it slightly less intuitive, but you can gain a lot: by comparing the size of these components you can often get quick answers to some basic properties of the data, for example: "just how many real directions of variation does this data have, anyway?" is answered by the size of the PCA stretches (the middle matrix that comes out of the SVD).

Pick any two of the seven measurements. Every dot is a real person from Framingham. The <b>gold</b> arrow is the cloud's long axis (PC1); <b>purple</b> is its perpendicular partner (PC2). Then flip the switch to rotate the cloud onto its own axes — that rotation is nothing but a rotation matrix from Chapter 4, applied to every person at once.

# outro

The real move is doing this with all seven measurements at once: compute the 7×7 covariance matrix, find its seven perpendicular axes, and you'll usually discover that two or three of them carry most of the spread. Seven numbers per person compress down to two or three, with little lost. That's how scientists plot "un-plottable" data, how faces get compressed for recognition, and how genetics labs squeeze millions of DNA measurements into maps that reveal ancient migrations. Same spell every time: rotate to the data's own axes, keep the long ones.

:::takehome color=orange
:::major
- **PCA** finds a data cloud's own perpendicular axes, ranked by spread. Keeping only the long axes summarizes many measurements with just a few — that's dimensionality reduction.
- **SVD** says every matrix is (rotation) × (stretch) × (rotation). All the "action" of any matrix is stretching along perpendicular axes; the rotations just aim those axes.
- Symmetric matrices (like covariance matrices) have perpendicular eigenvectors — unlike matrices in general. That's why PCA's axes are orthogonal while PageRank's weren't.
:::minor
- Standardize first (subtract the mean, divide by the spread) so "age in years" and "cholesterol in mg/dL" get a fair fight.
- The % of variance along each axis tells you how honest your simplification is: PC1 + PC2 at 95% means a flat picture barely lies.
- Correlation is the covariance of standardized variables — the number r you see in the widget is exactly the off-diagonal entry of the little 2×2 matrix being diagonalized.
:::end
