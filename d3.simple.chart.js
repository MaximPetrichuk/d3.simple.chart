/*
 * d3.simple.chart
 * @author Maxim Petrichuk
 * @version 0.2.4
 * @date Aug 20th, 2016
 * @repo https://github.com/MaximPetrichuk/d3.simple.chart


  //sample param
  var param = {
    parentSelector: "#chart1",
    width: 600,  // if 0 then get parent width
    height: 300, // if 0 then get parent height
    margin: {top: 30, right: 40, bottom: 30, left: 50},
    title: "Iron mine work",
    xColumn: "Date",
    xColumnDate: true,
    xAxisName: "Date work",
    yLeftAxisName: "Tonnes",
    yRightAxisName: "%",
    categories: [
      {name: "plan", width: "1px"},
      {name: "fact", width: "2px"}
    ],
    series: [
      {yColumn: "Metal month", title: "Metal in moth", color: "#ff6600", yAxis: "left"},
      {yColumn: "Mined %", title: "Mined proc.", color: "#0080ff", yAxis: "right"}
    ]
  };

// build chart
function d3sChart (param,data,dataGroup) //dataGroup - data after processing by d3.nest 
// parse date and numeric data before build chart, sample: d3sPreParceDann("Date","%d.%m.%Y",["Metal month","Mined %"],data);
function d3sPreParceDann(dateColumn,dateFormat,usedNumColumns,data) 
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

  if (param.width == 0) {param.width = parseInt(selectedObj.style('width'), 10);};
  if (param.height == 0) {param.height = parseInt(selectedObj.style('height'), 10);};
  
  var margin = param.margin || {top: 30, right: 40, bottom: 30, left: 50},
      width = param.width - margin.left - margin.right,
      height = param.height - margin.top - margin.bottom;

  // set the scale for the transfer of real values
  var xScale = (param.xColumnDate) ? d3.scaleTime().range([0, width]) : d3.scaleLinear().range([0, width]);
  var yScaleLeft = d3.scaleLinear().range([height, 0]);
  var yScaleRight = d3.scaleLinear().range([height, 0]);

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
    var xAxis = d3.axisBottom(xScale)
                .ticks(d3.timeYear,1).tickFormat(d3.timeFormat("%Y"))
                .tickSize(10);
    //calculate count month in year on axis
    var xqViewMonth=Math.round(((xMax-xMin)/1000/60/60/24/30)/(width/23));
    if (xqViewMonth<1) {xqViewMonth=1};

    var monthNameFormat = d3.timeFormat("%m");
    var xAxis2 = d3.axisBottom(xScale)
                .ticks(d3.timeMonth,xqViewMonth).tickFormat(function(d) { var a = monthNameFormat(d); if (a == "01") {a = ""}; return a;})
                .tickSize(2);
  } else {
    var xAxis = d3.axisBottom(xScale);
    if (width<300) xAxis.ticks(5);
  };
  var yAxisLeft = d3.axisLeft(yScaleLeft);
  var yAxisRight = d3.axisRight(yScaleRight);

  // create svg for draving chart
  var svg = selectedObj.append("svg")
      .attr("width", param.width).attr("height", param.height)
      .attr("id", param.parentSelector.substr(1)+"_d3_simple_chart");

  // outer border
  svg.append("rect").attr("width", param.width).attr("height", param.height)
                    .style("fill", "none").style("stroke", "#ccc");

  // create group in svg for generate graph
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                          .attr("class", "legend");

  // add title and axis names
  g.append("text").attr("x", margin.left) .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle").style("font-size", "14px") 
        .text(param.title);
  g.append("text").attr("x", width-43).attr("dx", 40) .attr("y", height-4 )
        .attr("text-anchor", "end") 
        .text(param.xAxisName);
  g.append("text").attr("transform", "rotate(-90)")
        .attr("x", 0) .attr("y", -28).attr("dy", 40)
        .attr("text-anchor", "end") 
        .text(param.yLeftAxisName);
  g.append("text").attr("transform", "rotate(-90)")
        .attr("x", 0) .attr("y", width-44).attr("dy", 40)
        .attr("text-anchor", "end") 
        .text(param.yRightAxisName);

  // add axis
  g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  if (param.xColumnDate) {
    g.append("g").attr("class", "x axis2").attr("transform", "translate(0," + height + ")")
      .call(xAxis2);
  };
  g.append("g").attr("class", "y axis")
    .call(yAxisLeft)
  g.append("g").attr("class", "y axis").attr("transform", "translate(" + width + " ,0)")
    .call(yAxisRight)

  if (buildCategory) { 
   // draw chart lines for each categories and series in param
    dataGroup.forEach(function(d, i) {
      for (var i = 0, len = param.categories.length; i < len; i += 1) {
        if (param.categories[i].name == d.key){
          for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
            // init line for axis
            var line = d3.line()
              .x(function(data) { return xScale(data[param.xColumn]); })
              .y(function(data) { return (param.series[j].yAxis == "left") ? yScaleLeft(data[param.series[j].yColumn]) : yScaleRight(data[param.series[j].yColumn]); });
            // draw line
            g.append("path").datum(d.values)
              .attr("d", line) 
              .style("fill", "none").style("stroke", param.series[j].color)
              .style("stroke-width", param.categories[i].width);
          };
        };
      };
    });
  } else {
    for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
      // init line for axis
      var line = d3.line()
        .x(function(data) { return xScale(data[param.xColumn]); })
        .y(function(data) { return (param.series[j].yAxis == "left") ? yScaleLeft(data[param.series[j].yColumn]) : yScaleRight(data[param.series[j].yColumn]); });
      // draw line
      g.append("path").datum(data)
        .attr("d", line)
        .style("fill", "none").style("stroke", param.series[j].color)
        .style("stroke-width", "1px");
    };    
  };

  // add legend for seies  
  var legend = svg.append("g").attr("class", "legend").attr("height", 40).attr("width", 200)
    .attr("transform",(param.title == "") ? "translate(20,20)" : "translate(180,20)");   

    legend.selectAll('rect').data(param.series).enter()
      .append("rect").attr("y", 0 - (margin.top / 2)).attr("x", function(d, i){ return i *  90;})
      .attr("width", 10).attr("height", 10)
      .style("fill", function(d) {return d.color; });
      
    legend.selectAll('text').data(param.series).enter()
      .append("text").attr("y", 0 - (margin.top / 2)+10).attr("x", function(d, i){ return i *  90 + 11;})
      .text(function(d) { return d.title; });

  if (buildCategory) { // add legend for categories
    var legend1 = svg.append("g").attr("class", "legend").attr("height", 40).attr("width", 200)
      .attr("transform",(param.title == "") ? "translate(220,20)" : "translate(350,20)");   

      legend1.selectAll('line').data(param.categories).enter()
        .append("line").attr("y1", 0 - (margin.top / 2)+5).attr("x1", function(d, i){ return i *  60;})
        .attr("y2", 0 - (margin.top / 2)+5).attr("x2", function(d, i){ return i *  60+15;})
        .style("stroke", "black").style("stroke-width", function(d) { return d.width; });
        
      legend1.selectAll('text').data(param.categories).enter()
        .append("text").attr("y", 0 - (margin.top / 2)+10).attr("x", function(d, i){ return i *  60 + 17;})
        .text(function(d) { return d.name; });
  };
};

// parse date and numeric data before build chart, sample: d3sPreParceDann("Date","%d.%m.%Y",["Metal month","Mined %"],data);
function d3sPreParceDann(dateColumn,dateFormat,usedNumColumns,data){
  var parse = d3.timeParse(dateFormat);
  data.forEach(function(d) { 
    d[dateColumn] = parse(d[dateColumn]);
    for (var i = 0, len = usedNumColumns.length; i < len; i += 1) {
      d[usedNumColumns[i]] = +d[usedNumColumns[i]];
    }
  }); 
};
