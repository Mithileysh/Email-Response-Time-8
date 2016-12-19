
var svg = d3.select("#mainView").append("svg")
  .attr("width", 600)
  .attr("height", 320)
  .attr("id", "dotGroup");

var width = 600,
  height = 300,
  margin = { top: 20, left: 30, right: 20, bottom: 20 },
  innerWidth = width - margin.left - margin.right,
  innerHeight = height - margin.top - margin.bottom;

var list = d3.select("#userList");
var chart = d3.select("#dotGroup");
var data;


var dotGroup = chart.append("g")
  .attr("transform", "translate(" + 40 + "," + margin.top + ")");

var xAxisGroup = chart.append("g")
  .attr("transform", "translate(" + 40 + "," + (margin.top + innerHeight) + ")");

var yAxisGroup = chart.append("g")
  .attr("transform", "translate(" + 40 + "," + margin.top + ")");

var xLabel = chart.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width - 20)
  .attr("y", height + 10)
  .text("average response time to others(hours)");

var yLabel = chart.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("x", - 20)
  .attr("y", -1)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("average responded time from others(hours)");

function filterForMain(res) {
  var mainArray = [];
  for (var key in res) {
    var temp = key;
    key = res[key];
    key.name = temp;
    mainArray.push(key);
  }
  return mainArray;
}

//functions
function renderMainView(data) {
  var filteredData = filterForMain(data).filter(function (d) {
    return d.recNum > 9 && d.replyTime < 1200000000 && d.replyTime > 0 && d.repliedTime < 1200000000 && d.repliedTime > 0;
  });
  renderChart(data, filteredData);
}

function renderChart(data, chartData) {
  var xScale = d3.scale.linear()
    .range([0, innerWidth])
    .domain([0, d3.max(chartData, function (d) { return d.replyTime / 3600000.0 })]);

  var yScale = d3.scale.linear()
    .range([innerHeight, 0])
    .domain([0, d3.max(chartData, function (d) { return d.repliedTime / 3600000.0 })]);

  var sizeScale = d3.scale.linear()
    .range([3, 10])
    .domain(d3.extent(chartData, function (d) { return d.recNum }));

  var colorScale = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickSize(-260)
    .tickFormat(function (d) {
      var prefix = d3.formatPrefix(d)
      return prefix.scale(d) + prefix.symbol
    })
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(-550)
    .tickFormat(function (d) {
      var prefix = d3.formatPrefix(d)
      return prefix.scale(d) + prefix.symbol
    })
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
  var selection = dotGroup.selectAll("circle").data(chartData, function (d) { return d.name });

  selection
    .enter()
    .append("circle")
    .attr("r", function (d, i) { return sizeScale(d.recNum) })
    .attr("cx", function (d, i) { return xScale(d.replyTime / 3600000.0) })
    .attr("cy", function (d, i) { return yScale(d.repliedTime / 3600000.0) })
    .on('mouseenter', function (d, i) {
      highlight(d.name);
      d3.select("#tooltip")
        .style({
          visibility: "visible",
          top: d3.mouse(this)[1] + 30 + "px",
          left: d3.mouse(this)[0] + "px",
          opacity: 1
        })
        .text(d.name);
    })
    .on('mouseleave', function (d, i) {
      unHighlight();
      d3.select("#tooltip")
        .style({
          visibility: "hidden",
          opacity: 0
        })
    })
    .on('click', function (d, i) {
      d3.select("#userList").selectAll("li").attr("class","list-group-item")
      hightLightColor(d.name);
      renderTwoChart(data, d.name);
      highlightList(d.name);
      var replier1 = mostActiveAddress(d.name);
      var replier2 = leastActiveAddress(d.name);
      var p1 = document.getElementById("mostActive");
      var p2 = document.getElementById("leastActive");
      var h3 = document.getElementById("userName");
      p1.innerHTML = replier1;
      p2.innerHTML = replier2;
      h3.innerHTML = d.name;
    });

function highlightList(name){
  var index = 0;
  var i=0;
  $('#userList').children('li').each(function(){
    i++;
    if($(this).children('div')[0].innerHTML == name){
      index = i;
      $(this).addClass('active');
    }
    else{
      $(this).removeClass('active');
    }
  })

  var size = $('#userList').children('li').length;
  $('#userList').scrollTop(35*(index-1));
}

function renderTwoChart(data, name) {
  d3.select("#pieChart").selectAll("*").remove();
  renderPieChart(12, "hour", name);
  d3.select("#barChart").selectAll("*").remove();
  barChart(data, name);
}

  selection.exit().remove();
  selection
    .attr("fill", function (d, i) { return colorScale(d.region) })
}

  function hightLightColor(name){
    dotGroup.selectAll("circle")
      .style("fill", function(d, i){
        return d.name == name ? "c90000" : undefined;
      })
      .style("opacity", function(d, i){
        return d.name == name ? "1" : "0.6";
      });
  }

function highlight(name) {
  dotGroup.selectAll("circle")
    .style("stroke", function (d, i) {
      return d.name == name ? "black" : undefined
    })
    .style("stroke-width", "3")
}

function unHighlight() {
  dotGroup.selectAll("circle")
    .style("stroke", undefined)
}


function mostActiveAddress(user) {
  var max = 0;
  var maxReplier = "";

  Object.keys(result[user]["responseObj"]).forEach(function (key) {
    var replyTime = result[user]["responseObj"][key];
    if (replyTime > max) {
      max = replyTime;
      maxReplier = key;
    }
  });

  return maxReplier;
}

function leastActiveAddress(user) {
  var min = 999999999999999;
  var minReplier = "";

  Object.keys(result[user]["responseObj"]).forEach(function (key) {
    var replyTime = result[user]["responseObj"][key];
    if (replyTime < min) {
      min = replyTime;
      minReplier = key;
    }
  });

  return minReplier;
}