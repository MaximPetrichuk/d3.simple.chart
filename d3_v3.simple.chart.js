/*
 * d3.simple.chart
 * @author Maxim Petrichuk
 * @version 0.1.9
 * @date June 20th, 2016
 * @repo https://github.com/MaximPetrichuk/d3.simple.chart


  //sample param
  var param = {
    parentSelector: "#chart1",
    width: 600,
    height: 300,
    title: "Iron mine work",
    xColumn: "Date",
    xColumnDate: true,
    yLeftAxisName: "Tonnes",
    yRightAxisName: "%",
    categories: [
      {name: "plan", width: "1px"},
      {name: "fact", width: "2px"}
    ],
    series: [
      {yColumn: "Metal month", color: "#ff6600", yAxis: "left"},
      {yColumn: "Mined %", color: "#0080ff", yAxis: "right"}
    ]
  };

// build chart
function d3sChart (param,data,dataGroup) //dataGroup - data after processing by d3.nest 
// parse date and numeric data before build chart, sample: preParceDann("Date","%d.%m.%Y",["Metal month","Mined %"],data);
function preParceDann(dateColumn,dateFormat,usedNumColumns,data) 
*/

// build chart
function d3sChart (param,data,dataGroup){

  // check availability the object, where is displayed chart
  var selectedObj = null;
  if (param.parentSelector === null || param.parentSelector === undefined) { parentSelector = "body"; };
  selectedObj = d3.select(param.parentSelector);
  if (selectedObj.empty()) {
      throw "The '" + param.parentSelector + "' selector did not match any elements.  Please prefix with '#' to select by id or '.' to select by class";
  };
  //remove previous chart
  d3.select(param.parentSelector+"_d3_simple_chart").remove();

  var buildCategory = true;
  if (param.categories === undefined || dataGroup === undefined) {buildCategory = false;};

  var margin = {top: 30, right: 40, bottom: 30, left: 50},
      width = param.width - margin.left - margin.right,
      height = param.height - margin.top - margin.bottom;

  // set the scale for the transfer of real values
  var xScale = (param.xColumnDate) ? d3.time.scale().range([0, width]) : d3.scale.linear().range([0, width]);
  var yScaleLeft = d3.scale.linear().range([height, 0]);
  var yScaleRight = d3.scale.linear().range([height, 0]);

  // definition of data range for conversion coord at scales
  var xMin=d3.min(data, function(d) { return d[param.xColumn]; }),
      xMax=d3.max(data, function(d) { return d[param.xColumn]; }),
      yLeftMax=0, yRightMax=0;

  for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
    tmpVal = d3.max(data, function(d) { return d[param.series[j].yColumn]; });
    if (param.series[j].yAxis == "left"){
      if (tmpVal>yLeftMax) {yLeftMax = tmpVal};
    };
    if (param.series[j].yAxis == "right"){
      if (tmpVal>yRightMax) {yRightMax = tmpVal};
    };
  };

  xScale.domain([xMin,xMax]);
  yScaleLeft.domain([0,yLeftMax]);
  yScaleRight.domain([0,yRightMax]);


  // set axis
  if (param.xColumnDate) {
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
                .ticks(d3.time.year,1).tickFormat(d3.time.format("%Y"))
                .tickSize(10);
    //calculate count month in year on axis
    var xqViewMonth=Math.round(((xMax-xMin)/1000/60/60/24/30)/(width/23));
    if (xqViewMonth<1) {xqViewMonth=1};

    var monthNameFormat = d3.time.format("%m");
    var xAxis2 = d3.svg.axis().scale(xScale).orient("bottom")
                .ticks(d3.time.month,xqViewMonth).tickFormat(function(d) { var a = monthNameFormat(d); if (a == "01") {a = ""}; return a;})
                .tickSize(2);
  } else {
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  };
  var yAxisLeft = d3.svg.axis().scale(yScaleLeft).orient("left");
  var yAxisRight = d3.svg.axis().scale(yScaleRight).orient("right");

  // create svg for draving chart
  var svg = selectedObj.append("svg")
      .attr({width: param.width, height: param.height, id: param.parentSelector.substr(1)+"_d3_simple_chart"});

  // outer border
  svg.append("rect").attr({width: param.width, height: param.height})
                    .style({"fill": "none", "stroke": "#ccc"});

  // create group in svg for generate graph
  var g = svg.append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"});

  // add title
  g.append("text").attr("x", margin.left) .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle").style("font-size", "14px") 
        .text(param.title);

  // add axis and axis names
  g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
      .attr("x", width-20).attr("dx", ".71em")
      .attr("y", -4).style("text-anchor", "end")
      .text(param.xColumn);
  if (param.xColumnDate) {
    g.append("g").attr("class", "x axis2").attr("transform", "translate(0," + height + ")")
      .call(xAxis2);
  };
  g.append("g").attr("class", "y axis")
    .call(yAxisLeft)
    .append("text").attr("transform", "rotate(-90)")
      .attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")
      .text(param.yLeftAxisName);
  g.append("g").attr("class", "y axis").attr("transform", "translate(" + width + " ,0)")
    .call(yAxisRight)
    .append("text").attr("transform", "rotate(-90)")
      .attr("y", -14).attr("dy", ".71em").style("text-anchor", "end")
      .text(param.yRightAxisName);

  if (buildCategory) { 
   // draw chart lines for each categories and series in param
    dataGroup.forEach(function(d, i) {
      for (var i = 0, len = param.categories.length; i < len; i += 1) {
        if (param.categories[i].name == d.key){
          for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
            if (param.series[j].yAxis == "left"){
              // init line for left axis
              var line = d3.svg.line()
                .x(function(d) { return xScale(d[param.xColumn]); })
                .y(function(d) { return yScaleLeft(d[param.series[j].yColumn] ); });
            };
            if (param.series[j].yAxis == "right"){
              // init line for right axis
              var line = d3.svg.line()
                .x(function(d) { return xScale(d[param.xColumn]); })
                .y(function(d) { return yScaleRight(d[param.series[j].yColumn] ); });
            };
            // draw line
            g.append("path").datum(d.values)
              .style({"fill": "none", "stroke": param.series[j].color, "stroke-width": param.categories[i].width})
              .attr("d", line); 
          };
        };
      };
    });
  } else {
    for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
      if (param.series[j].yAxis == "left"){
        // init line for left axis
        var line = d3.svg.line()
          .x(function(data) { return xScale(data[param.xColumn]); })
          .y(function(data) { return yScaleLeft(data[param.series[j].yColumn] ); });
      };
      if (param.series[j].yAxis == "right"){
        // init line for right axis
        var line = d3.svg.line()
          .x(function(data) { return xScale(data[param.xColumn]); })
          .y(function(data) { return yScaleRight(data[param.series[j].yColumn] ); });
      };
      // draw line
      g.append("path").datum(data)
        .style({"fill": "none", "stroke": param.series[j].color, "stroke-width": "1px"})
        .attr("d", line); 
    };    
  };

  // add legend for seies  
  var legend = svg.append("g").attr("class", "legend").attr("height", 40).attr("width", 200)
    .attr("transform", "translate(180,20)");   

    legend.selectAll('rect').data(param.series).enter()
      .append("rect").attr("y", 0 - (margin.top / 2)).attr("x", function(d, i){ return i *  90;})
      .attr("width", 10).attr("height", 10)
      .style("fill", function(d) {return d.color; });
      
    legend.selectAll('text').data(param.series).enter()
      .append("text").attr("y", 0 - (margin.top / 2)+10).attr("x", function(d, i){ return i *  90 + 11;})
      .text(function(d) { return d.yColumn; });

  if (buildCategory) { // add legend for categories
    var legend1 = svg.append("g").attr("class", "legend").attr("height", 40).attr("width", 200)
      .attr("transform", "translate(350,20)");   

      legend1.selectAll('line').data(param.categories).enter()
        .append("line").attr("y1", 0 - (margin.top / 2)+5).attr("x1", function(d, i){ return i *  60;})
        .attr("y2", 0 - (margin.top / 2)+5).attr("x2", function(d, i){ return i *  60+15;})
        .style("stroke", "black").style("stroke-width", function(d) { return d.width; });
        
      legend1.selectAll('text').data(param.categories).enter()
        .append("text").attr("y", 0 - (margin.top / 2)+10).attr("x", function(d, i){ return i *  60 + 17;})
        .text(function(d) { return d.name; });
  };
};

// parse date and numeric data before build chart, sample: preParceDann("Date","%d.%m.%Y",["Metal month","Mined %"],data);
function preParceDann(dateColumn,dateFormat,usedNumColumns,data){
  var parse = d3.time.format(dateFormat).parse;
  data.forEach(function(d) { 
    d[dateColumn] = parse(d[dateColumn]);
    for (var i = 0, len = usedNumColumns.length; i < len; i += 1) {
      d[usedNumColumns[i]] = +d[usedNumColumns[i]];
    }
  }); 
};
