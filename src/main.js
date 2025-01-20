// Gather chart elements
const dayCtx = document.getElementById("dayChart");
const monthCtx = document.getElementById("monthChart");
const yearCtx = document.getElementById("yearChart");

// Global data element
let energyData = [];
let usageDelivered = [];
let usageReceived = [];

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

// CSV parsing
// Desc: Reads csv data from uploaded file, outputs delivered and received
//  values to the data elements 'usageDelivered' and 'usageReceived'
const uploadSuccess = document
  .getElementById("uploadSuccess")
  .addEventListener("click", () => {
    Papa.parse(document.getElementById("uploadFile").files[0], {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (answer) {
        usageByDirection = getDataFromSoup(answer);

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
        createChart(
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
        createChart(
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
        createChart(
          dayCtx,
          deliveredKeysDay,
          deliveredDataDay,
          receivedDataDay
        );
      },
    });
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
          label: "Delivered to House",
          data: deliveredUsageValues,
          borderWidth: 1,
        },
        {
          label: "Received by NV Energy",
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
