# a3-willium-ayush29feb

## Team Members

1. Will Strimling (willium)
2. Ayush Saraf (ayush29f)

## Exit Poll Exploration

![Screenshot](/storyboard/screenshot.png)

We used the exit polls data collected by CNN available [here](http://www.cnn.com/election/primaries/polls) in tabular form and created a interactive sanky diagram and made exit poll exploration a lot concise and interactive.

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
and automagically reloads the browser!

```bash
gulp watch
```
Open http://localhost:8080/ to access the visualisation

## Story Board

To help us plan out our process of creating this visulisation we used the process of storyboarding. You can find our storyboard [here](/storyboard/storyboard.md)

### Changes between Storyboard and the Final Implementation

Compared to the final implementation and the initial storyboard design, we had a couple of changes. Most of the features were implemented but just in a different way from what we planned before.
- We decided to remove the threshold bar because its motive could be achieved by just removing the nodes with minimal value.
- Instead of using a map to represent states we just decided to use checkboxes because the geographical location of these states did not add much value to what we were trying to represent. Also, it would distract the user from the main visualisation that is the Sankey diagram.
- We also eliminated the shelves for responses
- Instead of using a heavy tooltip with redundant imformation we used % labels that help user understand the ratios of links better.

## Development Process

Include:
- Breakdown of how the work was split among the group members.
- A commentary on the development process, including answers to the following questions:
  - Roughly how much time did you spend developing your application?
  - What aspects took the most time?
