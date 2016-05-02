# Storyboard

In this storyboard, we will explain our process in stages and how we ended up with the final idea.

## Stage 1
![Stage 1](/storyboard/_raw_images/Step-1.jpg)

In the first stage, we started to think about what would be the best way to represent the data we have. We choose to work with the exit polls data from the CNN website, which is represented in tabular form across various web pages on the website in hierarchical form. This made it really hard to discover the various patterns that might appear in the data. Since this data essentially represents a flow we decided to use a Sankey diagram to represent it because it best depicts the flow and also our metric is percentages. Also, we thought about making a bidirectional Sankey for each party Democrats and Republican.

Right above the sankey diagram, we included a drop down menu that would allow you to choose a different question and update the diagram accordingly.

## Stage 2
![Stage 2](/storyboard/_raw_images/Step-2.jpg)

In the second stage, we started adding interactive features to the visualization that might help in data exploration. Since some of the links in the Sankey might be really small we decided to add a threshold value that will eliminate those links so that the visualization is clearer.

## Stage 3
![Stage 3](/storyboard/_raw_images/Step-3.jpg)

In the third stage, we added tooltips to the links that would give details about the particular link which would include the #people, percentage of the entire pool, and the candidates/response themselves.

## Stage 4
![Stage 4](/storyboard/_raw_images/Step-4.jpg)

In the fourth stage, we added a map below the diagram that would show which states these polls were held at and it would allow the users to select/unselect which would remove that states data from the Sankey diagram. We also included a legend that holds three values: selected, unselected, N/A

## Stage 5
![Stage 5](/storyboard/_raw_images/Step-5.jpg)

In the fifth stage, we added a concept of a shelf. It would allow us to remove/add candidates from the Sankey diagram and would allow us to explore further in detail while comparing a subset of candidates.

## Stage 6
![Stage 6](/storyboard/_raw_images/Step-6.jpg)

In the sixth stage, we improved our implementation of shelves by actually drawing two boxes that would allow us to keep the unselected candidates and responses respectively.
