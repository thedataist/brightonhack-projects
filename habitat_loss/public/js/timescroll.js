
var leapFrame;
var delayReset = 50; // increase to reduce leap motion "frame"
var delay = delayReset;

var margin = {top: 200, right: 40, bottom: 200, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain([new Date(2010, 12, 1), new Date(2013, 6, 1)])
    .range([0, width]);

var brush = d3.svg.brush()
    .x(x)
    .extent([new Date(2011, 7, 1), new Date(2011, 8, 1)])
    .on("brushend", brushended);

var svg = d3.select(".slider-wrap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.month, 3)
        .tickSize(-height)
        .tickFormat(""))
  .selectAll(".tick")
    .classed("minor", function(d) { return d.getHours(); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.month, 3)
      .tickPadding(0))
  .selectAll("text")
    .attr("x", 6)
    .style("text-anchor", null);

var gBrush = svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.event);

gBrush.selectAll("rect")
    .attr("height", height);

function brushended() {
  if (delay-- < 0) { // need to reduce leap motion "frame rate"
        delay = delayReset;
        //chart.drawHomelessData(counter++);
        // if (counter > (chart.quarters2.length -1)) { // hardcoded length of homeless data: 8 here
        //     counter = 0;
        // }
    }
  if (!d3.event.sourceEvent) return; // only transition after input
  var extent0 = brush.extent(),
      extent1 = extent0.map(d3.time.month.round);

  // if empty when rounded, use floor & ceil instead
  if (extent1[0] >= extent1[1]) {
    extent1[0] = d3.time.month.floor(extent0[0]);
    extent1[1] = d3.time.month.ceil(extent0[1]);
  }

  d3.select(this).transition()
      .call(brush.extent(extent1))
      .call(brush.event);
}

Leap.loop(function (frame) {
    leapFrame = frame;
    if (leapFrame) { // not a programmatic event
        if (leapFrame.pointables[0]) {
          /*  bug here: 
            . Error: Invalid value for <rect> attribute x="NaN"      d3.v3.js:578
            . Error: Invalid value for <rect> attribute width="NaN"  d3.v3.js:578
          */
            gBrush.call(brush.extent(frame.pointables[0].tipPosition[0])) // <-- bug here: d3.v3.js:578
                  .call(brush.event);
        }
    }
});