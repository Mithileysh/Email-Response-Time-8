function barChart(results, person) {
    var data = filter(results, person);
    render(parseEmail(person), data);
}

function filter(results, person) {
  return results[person].responseObj;
}

function parseEmail(email) {
  var pos1 = email.indexOf("_")
  var pos2 = email.indexOf("@")
  return email.substring(0, pos1) + " " + email.substring(pos1 + 1, pos2)
}

function constructEmails(emails) {
  var results = [];
  for (email in emails) {
    var obj = {
      address: parseEmail(email),
      time: Math.round(emails[email] / 3600000 * 100) / 100
    }
    results.push(obj);
    if (results.length > 15) {
      break;
    }
  }
  return results;
}

function render(person, data) {
  var emails = constructEmails(data);
  var maxLength = Math.round(d3.max(emails.map(d => d.time))).toString().length
  var margin = { top: 30, right: 20, bottom: 170, left: maxLength > 1 ?  maxLength * 18 : 40 },
    width = 550 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  var offset = Math.sqrt(d3.min(emails.map(d => d.time)) + d3.max(emails.map(d => d.time)));

  var color = d3.scale.ordinal()
    .range(emails.map(d => {
      if (d.time <= offset) {
        return "#CCFFFF"
      }
      else if (d.time < offset * 2) {
        return "#CCCCFF"
      }
      else if (d.time < offset * 3) {
        return "#99CCCC"
      }
      else if (d.time < offset * 4) {
        return "#99CCFF"
      }
      else if (d.time < offset * 5) {
        return "#6699CC"
      }
      else if (d.time < offset * 6) {
        return "#336699"
      }
      else {
        return "#003366"
      }
    }))

  var x = d3.scale.ordinal().rangeRoundBands([0, width - 20], .05),
    y = d3.scale.linear().range([height, margin.top])

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

  var svg = d3.select("#barChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "col-md-12")
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

  // svg.append("text")
  //   .attr("x", (width / 2))
  //   .attr("y", 0)
  //   .attr("text-anchor", "middle")
  //   .style("font-size", "16px")
  //   .style("text-decoration", "underline")
  //   .text(person);

  x.domain(emails.map(d => d.address));
  y.domain([0, d3.max(emails, d => d.time)]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .style("font-size",  Math.round(Math.sqrt(1280 / emails.length)) + "px")
    .attr("transform", "rotate(-" + 1.8 * emails.length + ")");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".71em")
    .style("text-anchor", "end")

  bars = svg.selectAll("bar")
    .data(emails)
    .enter().append("rect")
    .attr("x", d => x(d.address))
    .attr("width", x.rangeBand())
    .attr("y", height)
    .style("fill", d => color(d.time))
    .attr("height", 0)
    .transition()
    .duration(200)
    .delay((d, i) => i * 50)
    .attr("y", d => y(d.time))
    .attr("height", d => height - y(d.time))

  svg.selectAll("text.bar")
    .data(emails)
    .enter().append("text")
    .attr("x", d => x(d.address))
    .attr("y", d => y(d.time) - 3)
    .text(d => d.time)
    .style("font-size", Math.round(100 / emails.length) + "px")
    .attr("text-anchor", "start")

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width - 10)
    .attr("y", height + 35)
    .text("People")

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", maxLength > 1 ?  -maxLength * 18 : -40)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Average responding time(Hours)")

}