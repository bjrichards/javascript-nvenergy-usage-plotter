// Gather chart elements
const dayCtx = document.getElementById("dayChart");
const monthCtx = document.getElementById("monthChart");
const yearCtx = document.getElementById("yearChart");

// Global data element
let energyData = [];
let usageDelivered = [];
let usageReceived = [];

let yearChart = new Chart(dayCtx, {});
let monthChart = new Chart(monthCtx, {});
let dayChart = new Chart(yearCtx, {});

function showDayChart() {
  var checkbox = document.getElementById("checkShowDayChart");
  var chart = document.getElementById("dayChart");

  if (checkbox.checked) {
    chart.style.display = "block";
  } else {
    chart.style.display = "none";
  }
}

function showMonthChart() {
  var checkbox = document.getElementById("checkShowMonthChart");
  var chart = document.getElementById("monthChart");

  if (checkbox.checked) {
    chart.style.display = "block";
  } else {
    chart.style.display = "none";
  }
}

function showYearChart() {
  var checkbox = document.getElementById("checkShowYearChart");
  var chart = document.getElementById("yearChart");

  if (checkbox.checked) {
    chart.style.display = "block";
  } else {
    chart.style.display = "none";
  }
}

function updateSuccessMessage(message, optionalTextColor) {
  var p = document.getElementById("successStatus");
  p.innerText = message;

  if (optionalTextColor !== "undefined") {
    p.style.color = optionalTextColor;
  }
}

// CSV parsing
// Desc: Reads csv data from uploaded file, outputs delivered and received
//  values to the data elements 'usageDelivered' and 'usageReceived'
const uploadSuccess = document
  .getElementById("uploadSuccess")
  .addEventListener("click", () => {
    try {
      Papa.parse(document.getElementById("uploadFile").files[0], {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (answer) {
          // Reset checkboxes
          document.getElementById("checkShowDayChart").checked = false;
          document.getElementById("checkShowMonthChart").checked = false;
          document.getElementById("checkShowYearChart").checked = false;

          // Reset canvases (make display: none)
          document.getElementById("dayChart").style.display = "none";
          document.getElementById("monthChart").style.display = "none";
          document.getElementById("yearChart").style.display = "none";

          // Grab required data from soup
          usageByDirection = getDataFromSoup(answer);

          // Reset charts, if they exist
          dayChart.destroy();
          monthChart.destroy();
          yearChart.destroy();

          // Year Chart Creation
          let deliveredMapYear = prepDataForChart(
            usageByDirection.get("delivered"),
            "year"
          );
          let deliveredKeysYear = Array.from(deliveredMapYear.keys());
          let deliveredDataYear = Array.from(deliveredMapYear.values());
          let receivedMapYear = prepDataForChart(
            usageByDirection.get("received"),
            "year"
          );
          let receivedDataYear = Array.from(receivedMapYear.values());
          yearChart = createChart(
            yearCtx,
            deliveredKeysYear,
            deliveredDataYear,
            receivedDataYear
          );

          // Month Chart Creation
          let deliveredMapMonth = prepDataForChart(
            usageByDirection.get("delivered"),
            "month"
          );
          let deliveredKeysMonth = Array.from(deliveredMapMonth.keys());
          let deliveredDataMonth = Array.from(deliveredMapMonth.values());
          let receivedMapMonth = prepDataForChart(
            usageByDirection.get("received"),
            "month"
          );
          let receivedDataMonth = Array.from(receivedMapMonth.values());
          monthChart = createChart(
            monthCtx,
            deliveredKeysMonth,
            deliveredDataMonth,
            receivedDataMonth
          );

          // Year Chart Creation
          let deliveredMapDay = prepDataForChart(
            usageByDirection.get("delivered"),
            "day"
          );
          let deliveredKeysDay = Array.from(deliveredMapDay.keys());
          let deliveredDataDay = Array.from(deliveredMapDay.values());
          let receivedMapDay = prepDataForChart(
            usageByDirection.get("received"),
            "day"
          );
          let receivedDataDay = Array.from(receivedMapDay.values());
          dayChart = createChart(
            dayCtx,
            deliveredKeysDay,
            deliveredDataDay,
            receivedDataDay
          );

          updateSuccessMessage(
            "Graph creation completed. Use checkboxes to view graphs.",
            "green"
          );
        },
      });
    } catch (error) {
      updateSuccessMessage(
        "Failure to load file, error message below: \n" + error,
        "red"
      );
    }
  });

function createChart(
  context,
  labels,
  deliveredUsageValues,
  receivedUsageValues
) {
  result = new Chart(context, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NV Energy power consumed",
          data: deliveredUsageValues,
          borderWidth: 1,
        },
        {
          label: "Solar excess provided to NV Energy",
          data: receivedUsageValues,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  return result;
}

function getDataFromSoup(energySoup) {
  let result = new Map();

  // Grab only needed columns
  energyData = energySoup.data.map((element) => ({
    Date: element["Startdate"],
    Hour: element["Hour of the day"],
    Flow: element["powerFlow"],
    Usage: element["Usage"],
  }));

  // Break into delivered and received arrays
  for (let i = 0; i < energyData.length; i++) {
    if (energyData[i].Flow === "Delivered") {
      usageDelivered.push(energyData[i]);
    } else if (energyData[i].Flow === "Received") {
      usageReceived.push(energyData[i]);
    }
  }

  result.set("delivered", usageDelivered);
  result.set("received", usageReceived);

  return result;
}

// Groups the data into months, outputs in format for chart
// groupingType can be 'day', 'month', or 'year'
// Defaults to 'month'
function prepDataForChart(hourlyUsage, groupingType) {
  let result = new Map();
  for (let i = 0; i < hourlyUsage.length; i++) {
    var key = getTimeGrouping(hourlyUsage[i].Date, groupingType).toString();
    if (!result.has(key)) {
      result.set(key, 0);
    }
    result.set(key, result.get(key) + parseFloat(hourlyUsage[i].Usage));
  }
  return result;
}

// Defaults to 'month'
function getTimeGrouping(dateAsString, groupingType) {
  var result = "";
  fullDate = new Date(dateAsString + " 00:00:00 GMT-0800");
  if (groupingType === "year") {
    result = fullDate.getFullYear();
  } else if (groupingType === "day") {
    result = fullDate.getMonth() + 1 + "-" + (fullDate.getDate() + 1);
  } else {
    result = fullDate.getFullYear() + "-" + (fullDate.getMonth() + 1);
  }
  return result;
}
