var slideValue = 70,
    isSliding = false,
    countryGreyBlue = "#b6c5d0",
    currentWidth = $(".sankey-container").width(),
    mixpanelModuleName = 'StackedAllocationChart',
    sliderUsed = false;

if (currentWidth < 550) {
    currentWidth = 550
};
if (currentWidth > 840) {
    currentWidth = 840;
};

var currentHeight = currentWidth / 1.07;
if (currentHeight > 630) {
    currentHeight = 630;
}

var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    width = currentWidth - margin.left - margin.right,
    height = currentHeight - margin.top - margin.bottom;

var formatNumber = d3.format(",.2f%"), // two decimal places
    format = function(d) {
        return formatNumber(d) + " " + units;
    },
    color = d3.scale.category20c();

// append the svg canvas to the page
var svg = d3.select(".sankey").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(70)
    .nodePadding(1.5)
    .size([width, height]);

var path = sankey.link();

var startingAllocation = 70;
var graph, data, link, node, sliderEvent;
var portfolioValues = [];
var sliderDragVisible = true;

// load the data with d3.csv
d3.csv("etf-geo.csv", function(error, data) {

    graph = {
        "nodes": [],
        "links": []
    };

    data.forEach(function(d, i) {
        var item = {
            source: d.source,
            target: d.target,
            values: []
        };
        for (var j = 0; j < 101; j++) {
            item.values.push(d['value' + j.toString()]);
        }
        portfolioValues.push(item);
        graph.nodes.push({
            "name": d.source
        });
        graph.nodes.push({
            "name": d.target
        });
        graph.links.push({
            source: portfolioValues[i].source,
            target: portfolioValues[i].target,
            value: portfolioValues[i].values[startingAllocation]
        });
    });

    //this handy little function returns only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
        .key(function(d) {
            return d.name;
        })
        .map(graph.nodes));

    //it appears d3 with force layout wants a numeric source and target
    //so loop through each link replacing the text with its index from node
    graph.links.forEach(function(d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        portfolioValues[i].source = graph.links[i].source;
        portfolioValues[i].target = graph.links[i].target;
    });

    //now loop through each nodes to make nodes an array of objects rather than an array of strings
    graph.nodes.forEach(function(d, i) {
        graph.nodes[i] = {
            "name": d
        };
    });

    // contruct sankey
    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout();

    // add in the links
    link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("id",
            function(d, i) {
                d.id = i;
                return "link-" + i;
            })
        .attr("d", path)
        .on("mouseover", onLinkMouseover)
        .on("mouseout", onLinkMouseout)
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
            return b.dy - a.dy;
        })
        .style("visibility",
            function() {
                if (this.__data__.value == 0) {
                    return "hidden";
                } else {
                    return "visible";
                }
            });

    // add in the nodes
    node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform",
            function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
        .style("visibility",
            function() {
                if (this.__data__.value == 0) {
                    return "hidden";
                } else {
                    return "visible";
                }
            });

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .attr("class", function(d) {
            return d.name
        })
        .on("mouseover", highlight_node_links)
        .on("mouseout", onNodeMouseout)

    // add in the title for the nodes
    node.append("text")
        .attr("x", -15)
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(
            function(d) {
                var shortN = d.name;
                return shortNameSwitch(shortN);
            })
        .style("font-size",
            function() {
                var textSize = 1700 * this.__data__.value;
                if (textSize > 170) {
                    return "170%"
                } else {
                    return textSize.toString() + "%";
                }
            })
        .filter(function(d) {
            return d.x < width / 2;
        })
        .attr("x", 15 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // Switch short symbols for full names of countries and ETFS
    function shortNameSwitch(shortName) {
        switch (shortName) {
            case "VTI":
                x = "US Total Stock Market";
                break;
            case "IVE":
                x = "US Large-Cap Value";
                break;
            case "IWS":
                x = "US Mid-Cap Value";
                break;
            case "IWN":
                x = "US Small-Cap Value";
                break;
            case "VEA":
                x = "Intl. Developed Markets";
                break;
            case "VWO":
                x = "Emerging Markets";
                break;
            case "VWOB":
                x = "Emerging Markets Bonds";
                break;
            case "BNDX":
                x = "Intl. Bonds ";
                break;
            case "LQD":
                x = "US Corporate Bonds";
                break;
            case "AGG":
                x = "US High Quality Bonds";
                break;
            case "VTIP":
                x = "Inflation-Protected Bonds";
                break;
            case "SHV":
                x = "Short-Term Treasuries";
                break;
            case "AUS":
                x = "Australia";
                break;
            case "AUT":
                x = "Austria";
                break;
            case "BEL":
                x = "Belgium";
                break;
            case "BRA":
                x = "Brazil";
                break;
            case "CAN":
                x = "Canada";
                break;
            case "CHI":
                x = "Chile";
                break;
            case "CHN":
                x = "China";
                break;
            case "COL":
                x = "Colombia";
                break;
            case "GER":
                x = "Germany";
                break;
            case "DEN":
                x = "Denmark";
                break;
            case "ESP":
                x = "Spain";
                break;
            case "FRA":
                x = "France";
                break;
            case "GBR":
                x = "United Kingdom";
                break;
            case "HKG":
                x = "Hong Kong";
                break;
            case "INA":
                x = "Indonesia";
                break;
            case "IND":
                x = "India";
                break;
            case "ITA":
                x = "Italy";
                break;
            case "JOR":
                x = "Jordan";
                break;
            case "JPN":
                x = "Japan";
                break;
            case "KOR":
                x = "Korea";
                break;
            case "LIB":
                x = "Lebanon";
                break;
            case "LUX":
                x = "Luxembourg";
                break;
            case "MAS":
                x = "Malaysia";
                break;
            case "MEX":
                x = "Mexico";
                break;
            case "NED":
                x = "Netherlands";
                break;
            case "OTHER":
                x = "All others*";
                break;
            case "PAN":
                x = "Panama";
                break;
            case "PER":
                x = "Peru";
                break;
            case "CRO":
                x = "Croatia";
                break;
            case "HUN":
                x = "Hungary";
                break;
            case "KAZ":
                x = "Kazakhstan";
                break;
            case "PHI":
                x = "Philippines";
                break;
            case "POL":
                x = "Poland";
                break;
            case "QAT":
                x = "Qatar";
                break;
            case "RUS":
                x = "Russia";
                break;
            case "SER":
                x = "Serbia";
                break;
            case "SIN":
                x = "Singapore";
                break;
            case "SWE":
                x = "Sweden";
                break;
            case "SUPRA":
                x = "Supranational**";
                break;
            case "SUI":
                x = "Switzerland";
                break;
            case "UKR":
                x = "Ukraine";
                break;
            case "THA":
                x = "Thailand";
                break;
            case "TUR":
                x = "Turkey";
                break;
            case "TPE":
                x = "Taiwan";
                break;
            case "UAE":
                x = "United Arab Emirates";
                break;
            case "USA":
                x = "United States";
                break;
            case "VEN":
                x = "Venezuela";
                break;
            case "RSA":
                x = "South Africa";
                break;
            default:
                x = shortName;
        }
        return x
    }

    // HIGHLIGHT LINKS ON MOUSEOVER /////////////////////
    function onLinkMouseover() {
        if (isSliding) {
            return;
        }
        d3.select(this).transition().duration(150).delay(150).style("stroke-opacity", .25);
        var targName = shortNameSwitch(this.__data__.target.name);
        if (targName == "United States") {
            targName = "the United States"
        };
        if (targName == "United Kingdom") {
            targName = "the United Kingdom"
        };
        d3.select(".link-hover-text").transition().duration(200).delay(50).style("color", "rgba(51,51,51,.9)");
        d3.select(".link-target-name").text(targName).transition().duration(200).delay(50)
            .style("color", "rgba(0,45,86,.9)");
        d3.select(".link-source-name").text(shortNameSwitch(this.__data__.source.name))
            .transition().duration(200).delay(50)
            .style("color", "rgba(0,45,86,.9)");
        d3.select(".link-source-pct").text((100 * this.__data__.value).toFixed(1) + "%")
            .transition().duration(200).delay(50)
            .style("color", "rgba(52,124,180,.9)");
        d3.select("div.link-hover").transition().duration(200).style("background-color", "rgba(223,231,239,.99)").style("z-index", "3");
    };

    function onLinkMouseout() {
        d3.select(this).transition().duration(150).style("stroke-opacity", .07);
        d3.select(".link-hover").transition().duration(250)
            .style("background-color", "rgba(223,231,239,0)").style("z-index", "-1");
        d3.select(".link-hover-text").transition().duration(150)
            .style("color", "rgba(51,51,51,0)");
        d3.select(".link-source-pct")
            .transition().duration(150)
            .style("color", "rgba(52,124,180,0)");
        d3.select(".link-source-name")
            .transition().duration(150)
            .style("color", "rgba(0,45,86,0)");
        d3.select(".link-target-name")
            .transition().duration(150)
            .style("color", "rgba(0,45,86,0)");
    };

    // HIGHLIGHT NODES ON RECT MOUSEOVER /////////////////////
    function highlight_node_links(node, i) {
        if (isSliding) {
            return;
        }
        d3.select(this).transition().duration(150).delay(150)
            .style("fill-opacity", 1).style("fill", function() {
                var textSize = 300 * this.__data__.x;
                if (this.__data__.x > 100) {
                    return "#305275"
                }
            });

        this.__data__.targetLinks.sort(function(a, b) {
            return parseFloat(b.value) - parseFloat(a.value)
        });

        this.__data__.sourceLinks.sort(function(a, b) {
            return parseFloat(b.value) - parseFloat(a.value)
        });

        var targetValues = "";
        for (var i = 0; i < this.__data__.targetLinks.length; i++) {
            targetValues += "<tr><td class='comp-name'>" + shortNameSwitch(this.__data__.targetLinks[i].source.name) + " : </td><td class='comp-pct'>" + (100 * this.__data__.targetLinks[i].value).toFixed(1) + "%</td><td class='comp-blank'></td></tr>";
        };

        var sourceValues = "";
        for (var i = 0; i < this.__data__.sourceLinks.length; i++) {
            sourceValues += "<tr><td class='comp-name'>" + shortNameSwitch(this.__data__.sourceLinks[i].target.name) + " : </td><td class='comp-pct'>" + (100 * this.__data__.sourceLinks[i].value).toFixed(1) + "%</td><td class='comp-blank'></td></tr>";
        };

        var nodeSrcText = "";
        if (this.__data__.targetLinks.length > 0) {
            nodeSrcText = targetValues
        } else {
            nodeSrcText = sourceValues
        };

        var eX = this.__data__.x;
        var eY = this.__data__.y + 130;

        if (eX < width / 2) {
            eX = 110;
        } else {
            eX = width - 400;
            if (eY > (height + 100) * 0.9) {
                eY = (height + 100) * 0.9
            }
        };

        if (this.__data__.name == "VWOB") {
            eY = eY - 350
        };
        if (this.__data__.name == "BNDX") {
            eY = eY - 300
        };
        if (this.__data__.name == "VWO") {
            eY = eY - 100
        };

        d3.select(".hover-tooltip-sankey").transition().duration(150).delay(150)
            .style("top", eY + "px").style("left", eX + "px").style("background-color", "rgba(255,255,255,.9)").style("z-index", "5");
        d3.select(".hover-name").text(this.nextElementSibling.textContent + " : ").transition().duration(150).delay(150)
            .style("color", "rgba(0,45,86,.9");
        d3.select(".hover-name-pct").text((100 * this.__data__.value).toFixed(1)).transition().duration(150).delay(150)
            .style("color", "rgba(52,124,180,.9");
        d3.select(".node-source").html(nodeSrcText).transition().duration(150).delay(150)
            .style("color", "rgba(51,51,51,.9");

        var remainingNodes = [],
            nextNodes = [];
        var stroke_opacity = .25;
        var traverse = [{
            linkType: "sourceLinks",
            nodeType: "target"
        }, {
            linkType: "targetLinks",
            nodeType: "source"
        }];
        traverse.forEach(function(step) {
            node[step.linkType].forEach(function(link) {
                remainingNodes.push(link[step.nodeType]);
                highlight_link(link.id, stroke_opacity);
            });
            while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach(function(node) {
                    node[step.linkType].forEach(function(link) {
                        nextNodes.push(link[step.nodeType]);
                        highlight_link(link.id, stroke_opacity);
                    });
                });
                remainingNodes = nextNodes;
            }
        });
    }

    function highlight_link(id, opacity) {
        d3.select("#link-" + id).transition().duration(150).delay(150).style("stroke-opacity", opacity);
    }

    function onNodeMouseout() {
        d3.selectAll(".link").transition().duration(150).delay(150).style("stroke-opacity", 0.07);
        d3.select(".hover-tooltip-sankey").transition().duration(150).delay(150).style("background-color", "rgba(255,255,255,0)").style("z-index", "-1");
        d3.select(".hover-name").transition().duration(150).delay(150).style("color", "rgba(0,45,86,0");
        d3.select(".hover-name-pct").transition().duration(150).delay(150).style("color", "rgba(52,124,180,0");
        d3.select(".node-source").transition().duration(150).delay(150).style("color", "rgba(51,51,51,0");
        d3.select(this).transition().duration(150).delay(150).style("fill",
            function() {
                if (this.__data__.x > 100) {
                    return countryGreyBlue;
                }
            }).style("fill-opacity", .75);
    }

    function getValue(passedObj) {
        return passedObj.__data__.value;
    }

    /////////////////////////////////////////////////
    // UPDATE FUNCTION ///////////////////
    //////////////////////////////////////////////////

    function updateData(allocation) {

        currentWidth = $(".sankey-container").width();
        if (currentWidth < 550) {
            currentWidth = 550
        };
        if (currentWidth > 978) {
            currentWidth = 978
        };

        width = currentWidth;

        $("svg").width(currentWidth);

        var newLinks = [];

        portfolioValues.forEach(function(p, i) {
            newLinks.push({
                source: p.source,
                target: p.target,
                value: p.values[allocation]
            });
        });

        graph.links = newLinks;

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .size([width, height])
            .layout();

        d3.selectAll("rect").style("stroke-width", "20px");

        d3.selectAll(".link")
            .data(graph.links)
            .attr("d", path)
            .attr("id", function(d, i) {
                d.id = i;
                return "link-" + i;
            })
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy);
            })
            .sort(function(a, b) {
                return b.dy - a.dy;
            });

        d3.selectAll(".node").attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        d3.selectAll("rect")
            .attr("height", function(d) {
                return d.dy;
            })
            .on("mouseover", highlight_node_links)
            .on("mouseout", onNodeMouseout);

        d3.selectAll("text")
            .attr("y", function(d) {
                return d.dy / 2;
            })
            .style("font-size", function() {
                var textSize = 1700 * this.__data__.value;
                if (textSize > 170) {
                    return "170%"
                } else {
                    return textSize.toString() + "%";
                }
            });


        d3.selectAll("g.node")
            .style("visibility", function() {
                if (this.__data__.value < 0.0009) {
                    return "hidden";
                } else {
                    return "visible";
                }
            });

        d3.selectAll("path.link")
            .style("visibility", function() {
                if (this.__data__.value < 0.0009) {
                    return "hidden";
                } else {
                    return "visible";
                }
            });

        var usValue = d3.select("rect.USA").datum();
        var nonUS = 100 - parseInt(100 * usValue.value);
        d3.select(".outside-us").text(nonUS);
        d3.select(".inside-us").text(100 - nonUS);

    }
    $(document).mouseleave(
        function(event) {
            $(".sankey-container").trigger("mouseup");
            isSliding = false;
        }
    );

    $(".sankey-slider").bind("slider:changed", function(event, data) {

        if (!isSliding) {
            $(".sankey-container").one("mouseup", function() {
                isSliding = false;
            });
            isSliding = true;
        }

        slideValue = data.value;
        d3.select(".stock-percent").text(slideValue);
        d3.select(".bond-percent").text(100 - slideValue);

        updateData(parseInt(slideValue));

        if (!sliderUsed) {
            publicDataVizMixpanel.trackClick(mixpanelModuleName, 'UserChangesSlider', 'AboveChart');
            sliderUsed = true;
        }
    });

});

publicDataVizMixpanel.markPageAsViewed(mixpanelModuleName);