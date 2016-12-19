var defaultUser = "all";
var result = {};

d3.json("https://raw.githubusercontent.com/joshuawong/d3/master/dump5.json", function (data) {
  result = data;
  Object.keys(result).forEach(function (key) {
    var o = result[key];
    if (Object.keys(o["responseObj"]).length > 2 && o['recNum'] > 9 && o['replyTime'] < 1200000000 && o['replyTime'] > 0 && o['repliedTime'] < 1200000000 && o['repliedTime'] > 0) {
      showName(key);
    }
    else{
      delete result[key];
    }
  });
  renderMainView(result);
  renderPieChart(12, "hour", "all");
});

function onChangeInterval(event) {
  if (event.charCode >= 48 && event.charCode <= 57) {
    handleClick();
    return true;
  }
  return false;
}

function handleClick(user = null) {
  if (user == null) {
    user = defaultUser;
  }
  else {
    defaultUser = user;
  }
  d3.select("#pieChart").selectAll("*").remove();
  var gap = document.getElementById("quickReplyTime").value;
  var selects = document.getElementById("selectInterval");
  var interval = selects.options[selects.selectedIndex].value;
  var value = calculate(gap, interval, user);
  drawPieChart(value);
}

function renderPieChart(gap, interval, user) {
  if (user == null) {
    user = defaultUser;
  }
  else {
    defaultUser = user;
  }
  var value = calculate(gap, interval, user);
  drawPieChart(value);

  return false;
}

function calculate(val, intervals, user) {
  var gap;
  if (intervals == "minute") {
    gap = 60000;
  }
  else if (intervals == "hour") {
    gap = 3600000;
  }
  else {
    gap = 86400000;
  }
  var interval = val * gap;
  var value;
  if (user == "all") {
    value = traverseAllData();
  }
  else {
    value = traverseUser(user, interval);
  }
  var pieData = [{ "label": "Quick", "value": value[0] },
  { "label": "Slow", "value": value[1] }];
  return pieData;
}

function traverseAllData() {
  var slow = 0;
  var quick = 0;
  var keys = Object.keys(result);
  keys.forEach(function (key) {
    var replyTime = result[key].replyTime;
    if (replyTime > 43200000) {
      slow++;
    }
    else {
      quick++;
    }
  });
  var total = slow + quick;
  var results = [slow / total, quick / total];
  return results;
}

function traverseUser(user, intervals) {
  var slow = 0;
  var quick = 0;
  var keys = Object.keys(result[user]["responseObj"]);
  keys.forEach(function (key) {
    var replyTime = result[user]["responseObj"][key];
    if (replyTime > intervals) {
      slow++;
    }
    else {
      quick++;
    }
  });
  var total = slow + quick;
  var results = [quick / total, slow / total];
  return results;
}

function drawPieChart(value) {
  var w = 240,                        //width
    h = 240,                            //height
    r = 100,                            //radius
    color = d3.scale.category20c();     //builtin range of colors

  data = value;

  var vis = d3.select("#pieChart")
    .append("svg:svg")
    .attr("class", "pieSVG center-block")
    .data([data])
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + 120 + "," + 120 + ")");

  var arc = d3.svg.arc()
    .outerRadius(r);

  var arcOver = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(105 + 10);    
    
  var pie = d3.layout.pie()
    .value(function (d) { return d.value; });

  var arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("svg:g")
    .attr("class", "slice");

  arcs.append("svg:path")
    .attr("d", arc)
    .attr("fill", 'rgb(256, 256, 256)')
    .transition()
    .duration((d, i) =>  800)
    .attr("fill", function (d, i) { return color(i); })
    .delay(function (d, i) {
      return i * 400;
    })
    .attrTween('d', function (d) {
      var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
      return function (t) {
        d.endAngle = i(t);
        return arc(d);
      }
    });
    
  var selection = arcs.selectAll("path");
  selection
    .on("mouseenter", function(d) {
        var coordinate = d3.mouse(this);
        var percentage = Math.floor(d.value * 100);
        d3.select("#tooltip2")
        .style("visibility", "visible")
        .style("right", coordinate[0] + "px")
        .style("top", coordinate[1] + "px")
        .style("opacity", 1)
        .select("#value")
        .text(percentage);
        d3.select(this).transition()
          .duration(500)
          .attr("d", arcOver);
      })
      .on("mouseleave", function(d) {
        d3.select("#tooltip2")
            .style("visibility", "hidden")
            .style("opacity", 0);
        d3.select(this).transition()
          .duration(500)
          .attr("d", arc);
      });

  arcs.append("svg:text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = r;
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("style", "cursor:default")
    .text(function (d, i) { 
      return data[i].label;});
}

/*
Right slide part:
*/

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



function showName(user) {
  var ul = document.getElementById("userList");
  var li = document.createElement("li");
  
  li.setAttribute("class", "list-group-item");
  li.setAttribute("style", "cursor:pointer");
  li.setAttribute("onclick", "showRelation(this)");
  li.innerHTML = "<div>" + user + "</div>";
  ul.appendChild(li);
}

function showRelation(name) {
  var child = name.childNodes[1];
  var user = name.childNodes[0].textContent;
  defaultUser = user;

  // remove highlight on main view dot
  d3.selectAll("circle")
    .style("fill", function(d,i){
      return d.name == user ? "#c90000" : undefined;
    })
    .style("opacity", function(d, i){
      return d.name == user ? "1" : "0.6";
    });

  // remove highlight on other list
  var parent = name.parentNode;
  for(var i = 0; i < parent.children.length; i++){
    parent.children[i].setAttribute("class", "list-group-item");
  }
  // highlight selected list
  name.setAttribute("class", "list-group-item active");


  
    
  var replier1 = mostActiveAddress(user);
  var replier2 = leastActiveAddress(user);
  var p1 = document.getElementById("mostActive");
  var p2 = document.getElementById("leastActive");
  var h3 = document.getElementById("userName");
  p1.innerHTML = replier1;
  p2.innerHTML = replier2;
  h3.innerHTML = user;
    
  d3.select("#pieChart").selectAll("*").remove();
  renderPieChart(12, "hour", user);
  d3.select("#barChart").selectAll("*").remove();
  barChart(result, user);

}
