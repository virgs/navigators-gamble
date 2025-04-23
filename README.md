### The game

Describe how the game works and its graph-like features

### Goals

1. Study pure monte carlo tree search (provide real links)
2. [Study react](https://react.dev/)
3. [Study HTML/CSS](#htmlcss)
4. Last but not least: **to have fun**. Yay!

#### Artificial Intelligence

A pure version of the MCTS is used to decide the next direction to move to. In order to do so, **1500** games are randomly played until the game is over having one direction fixed as the next move. The direction that has the better average score in each direction is chosen as "next move".

##### Monte Carlos Tree Search

Monte Carlo tree search (MCTS) is a heuristic search algorithm for some kinds of decision processes, most notably those employed in software that plays board games. In that context MCTS is used to solve the game tree.

- **Selection**: Start at the root of the tree and recursively select nodes until a leaf node is reached. The selection can be random or based on a simple policy.
- **Expansion**: If the selected node hasn't been fully expanded (i.e., there are unexplored moves from that state), expand it by adding a child node corresponding to an unexplored move.
- **Simulation (Rollout)**: Conduct a simulation (also known as a rollout or playout) from the newly added node or the previously existing one. This involves making random moves or using a simple heuristic until a terminal state is reached.
- **Backpropagation**: Update the statistics of all nodes traversed during the selection and expansion steps. This involves incrementing visit counts and adjusting the cumulative value based on the outcome of the simulation.

Repeat these steps for a specified number of iterations or until a time limit is reached. The final move is typically chosen based on the statistics gathered at the root node.

##### Pure MTCS

The [pure version of MCTS](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search#Pure_Monte_Carlo_game_search) doesn't incorporate heuristics like UCB, making it more straightforward but potentially less efficient in balancing exploration and exploitation. It serves as a foundational framework upon which various enhancements can be applied to tailor the algorithm to specific problems.

This basic procedure can be applied to any game whose positions necessarily have a finite number of moves and finite length. Such as 2048. For each position, all feasible moves are determined: k random games are played out to the very end, and the scores are recorded. The move leading to the best score is chosen. Ties are broken by fair coin flips.

Pure Monte Carlo Game Search results in strong play in several games with random elements, as described below in the [outcome section](#outcome). It converges to optimal play (as k tends to infinity) in board filling games with random turn order.

#### React

It's kinda embarrassing, but I confess I need to strengthen my React skills. It's been at least 5 years since the last time I professionally worked with it, and the front-end personal projects I've been working on in this meantime were developed based on Vue.

Needless to say, react has solidified itself as a cornerstone in contemporary web development. Its relevance in the present landscape is unmistakable, providing developers with an efficient tool to manage complex UI logic and seamlessly update the view when the underlying data changes.

#### HTML/CSS

I feel like there is always something new to learn in HTML/CSS. For good reason, not just because it's a rapidly evolving stack, but mostly because I'm not very strong with it. I'm constantly surprised by what people do with them, and most of the time I have no idea how to do even 20% of what they're capable of.

I'm sure there's a long road paved with CSS and HTML blocks ahead, but I'm happy to be making progress.

## Outcome

If you didn't skip the goals section or weren't getting distracted playing a game like, let's say, 2048, you'll remember that the main goal was to have a better ratio win than me. As mentioned earlier, I'm a terrible player, and I don't think I've managed to win this game more than 2 or 3 times in my lifetime.

## Code It Yourself

### Project Setup

```sh
npm install
```

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile, and Minify for Production

```sh
npm run build
```

#### Format

```sh
npm run format
```
