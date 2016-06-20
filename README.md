# d3.simple.chart

h2 About
Very small and easy for quick creation of simple line charts on d3.js.

h2 How to use
h3 Step 1. Load and prepare data
```js
    d3.tsv("sample.tsv", function(error, data) {
      if (error) throw error;
      // parse date and numeric data before build chart
      preParceDann("Date","%d.%m.%Y",["Metal month","Mined %"],data);
      ...
    }
```
h3 Step 2. Init param
```js
      //initialize params of the chart
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
```
h3 Step 3. Create chart
```js
      // build chart
      d3sChart(param,data,dataGroup);
```
h2 Example of chart
![Example of chart](https://cloud.githubusercontent.com/assets/20028214/16200289/8118c198-372e-11e6-89b5-da5072c648da.png)

h2 Licence
BSD.
