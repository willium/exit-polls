# a3-willium-ayush29feb

## Team Members

1. Will Strimling (willium)
2. Ayush Saraf (ayush29f)

## Exit Poll Exploration

![Screenshot](/storyboard/screenshot.png)

This exploration makes use of a Sankey diagram, which is used to show 'flow'. Though they're often used for systems and other purposes, we decided it was a great representation of proportionality, cause and effect, and segmentation, without losing any information.
They can be hard to read, but using interactivity and highlighting, we made it very simple to learn from the data in a meaningful way. At the top of the visualization, you can toggle by party. Some questions were asked to only one of the two parties, so this helps filter the possible questions.
Next, you can choose a question. These questions were asked to voters at their polling places. It utilized statistical sampling methods to make the data as representative of the population as possible.
Sometimes, CNN provided the data with multiple bin choices, so if you choose the question 'Age', you can further explore by different binning. By default, we show all answers and all the currently running candidates.
If you want to focus on a specific candidate you can click the node, and all the others will return to the shelf. Similarly, if you want to remove a candidate, you can right-click on the node and just that one will return to the shelf.
To add candidates back from the shelf, simply click them. Because some questions were asked in many states, you can toggle which states are visible in the visualization. Black is active and gray is inactive. We chose to encode the party to color, as is common with
election data. Viewers are accustomed to red being Republican and blue being Democrat. We chose purple as a neutral color for the answer nodes and the links because its the color between blue and red on a color scale. The height of the nodes
show the percent of the voters per the answer or per the candidate (given the current states selected). Similarly, the size of the link represents the % of the total number of people represented in the visualization.

## Running Instructions

Live here: http://cse512-16s.github.io/a3-willium-ayush29feb/

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

We noticed that while many news sites provide exit poll data, they do so in a minimally interactive tabluar form: [NyTimes](http://www.nytimes.com/interactive/2016/02/09/us/elections/new-hampshire-democrat-poll.html?_r=0), [CNN](http://www.cnn.com/election/primaries/polls). 
While everyone seems to talk about exit polls, and reference it in their writing, they're hard to read and reason about, considering their form. We decided that if we could represent the data in a more intuitive, interactive manner, one could learn more from it. 
In its current form, its relatively difficult to compare the polls across states or per candidate. We wanted to enable a richer form of exploration. We utilized the data provided on [CNN](http://www.cnn.com/election/primaries/polls) and cleaned, aggregated, and manipulated it to our needs in [data/generate.py](data/generate.py).


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

## Development Process

### Time breakdown
- Collecting, parsing, manipulating, and aggregating data (6 hours)
- Storyboarding and ideation (3 hours)
- Original version of the code (11 hours)
- Creation of UI and (4 hours)
- Rewrite, conversion to browserify, build tools (10 hours)
- Implementation of labels (1 hour)
- Implementation of shelf (2 hours)
- Implementation of UI toggles for question, bin, states, and party (3 hours)

**Total**: 6+3+10+4+10+1+2+3 = 40 hours.

The writing and architecting of the codebase overall deffinitely took the most time. Creating the diagram was relatively easy once we got the right data to be in the right place at the right time to best utilize d3's data binding methods.

### Division of labor

Include:
- Breakdown of how the work was split among the group members.
- A commentary on the development process, including answers to the following questions:
  - Roughly how much time did you spend developing your application?
  - What aspects took the most time?
