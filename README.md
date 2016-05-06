# Exit Poll Exploration

![Screenshot](/storyboard/screenshot.png)

## Running Instructions

Live here: http://hologr.am/exit-polls

#### Run Locally

```bash
# Install dependencies
npm install

# To use global command `gulp`
npm install -g gulp
```

Runs an initial build, listens on your files changes, rebuilds them when necessary
and should reload the browser.

```bash
gulp watch
```
## Data

We noticed that while many news sites provide exit poll data, they do so in a minimally interactive, often tabluar form (see [NYTimes](http://www.nytimes.com/interactive/2016/02/09/us/elections/new-hampshire-democrat-poll.html?_r=0), [CNN](http://www.cnn.com/election/primaries/polls)). 
While everyone seems to talk about exit polls and reference them in their commentary, we've found that the polls themselves are difficult to read and reason about in their current form. We decided that if we could represent the data in a more intuitive, interactive manner, one could learn more from it. 

Exit Poll data was provided by Edison Media Research to [CNN](http://www.cnn.com/election/primaries/polls). We then transposed, cleaned, aggregated, and manipulated it for our needs.


## Story Board

To help us plan out our process of creating this visulisation we used the process of storyboarding. You can find our storyboard [here](/storyboard/storyboard.md)

### Changes between Storyboard and the Final Implementation

Compared to the final implementation and the initial storyboard design, we had a couple of changes. Most of the features were implemented but just in a different way from what we planned before.
- We decided to remove the threshold bar because its motive could be achieved by just removing the nodes with minimal value. It added confusion, and based on the data, eliminating smaller or larger values is not a common request.
- Instead of using a map to represent states we just decided to use checkboxes because the geographical location of these states did not add much value to what we were trying to represent. Adding another visualization would distract the user from the main visualization that is the Sankey diagram. Also, small states like Rhode Island would be difficult to toggle. 
- We also eliminated the shelves for responses, because only looking at one response doesn't provide the context needed to understand the scope of the question as a whole.
- Instead of using a heavy tooltip with redundant information we used % labels that help a user understand the ratios of links better. We also used svg's title elements to show some information on hover (and instructions on how to interact).
- We decided to not use a bi-directional diagram. This was for two reasons. First, some questions existed for only one party, and it would be confusing to show that and not the other direction. 
And secondly (and more importantly), it's unnatural to read a snakey diagram from the middle out. Traditionally, it's left to right, with the middle representing filters or sub-processes.
This would be broken by making the diagram bi-directional.