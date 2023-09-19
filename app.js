let socket = null;
let retryInterval = 1000; // initial retry interval
// let alarmsLogData;
// let dataLogData;
let serialNoAlarm = 0;
let serialNoDataLog = 0;
let isFirstTimeLoad = false;

// // to refresh page in 5 sec
// setTimeout(function () {
//   window.location = window.location;
// }, 10000);

var localIP = location.hostname;
var url = "ws://" + localIP + ":80/ws";
// var url = "ws://localhost:8080";
var ws = new WebSocket(url);

connect();

var deviceId;
var sentMsgAlarm = true;
var sentMsgData = true;

function exportToCSV(tableId, exportType) {
  // Variable to store the final csv data
  var csv_data = [];

  // Get each row data
  var rows = document.getElementById(tableId).getElementsByTagName("tr");

  for (var i = 0; i < rows.length; i++) {
    // Get each column data
    var cols = rows[i].querySelectorAll("td,th");

    // Stores each csv row data
    var csvrow = [];
    for (var j = 0; j < cols.length; j++) {
      // Get the text data of each cell
      // of a row and push it to csvrow
      csvrow.push(cols[j].innerHTML);
    }

    // Combine each column value with comma
    csv_data.push(csvrow.join(","));
  }

  // Combine each row data with new line character
  csv_data = csv_data.join("\n");

  // Call this function to download csv file
  downloadCSVFile(csv_data, exportType);
}

function downloadCSVFile(csv_data, exportType) {
  // Create CSV file object and feed
  // our csv_data into it
  CSVFile = new Blob([csv_data], {
    type: "text/csv",
  });

  // Create to temporary link to initiate
  // download process
  var temp_link = document.createElement("a");

  // Download csv file
  temp_link.download = exportType + ".csv";
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
}

function connect() {
  // var ip = location.host;
  // alert(ip);

  window.addEventListener("online", function () {
    // console.log("I am connected to the internet");
    // console.log('navigator.onLine ==> ', navigator.onLine)
    if (navigator.onLine) {
      connect();
    }
  });

  ws.onopen = function () {
    ws.send("Status WS Started");
    console.log("Web socket is connected");
    retryInterval = 1000;
  };

  ws.onclose = function (event) {
    console.log("WebSocket is closed now.");

    // attempt to reconnect
    setTimeout(function () {
      console.log("Attempting to reconnect...");

      ws.close();

      var localIP = location.hostname;
      var url = "ws://" + localIP + ":80/ws";
      // url = "ws://localhost:8080";
      ws = new WebSocket(url);

      connect();

      if (retryInterval > 40000) {
        retryInterval = 1000;
      } else {
        retryInterval += 2000; // exponential backoff
      }
      console.log(retryInterval);
    }, retryInterval);
  };

  ws.onmessage = async function (evt) {
    var ups_data = await UPS_MSG(evt.data);

    if (ups_data) {
      document.getElementsByClassName("overlay")[0].classList.add("d-none");

      // to refresh page in 10 sec
      setTimeout(function () {
        window.location = window.location;
      }, 10000);
    }

    deviceId = await ups_data.dev_id;

    if (!isFirstTimeLoad) {
      tabs();
    }

    /*****************datalog data*****************/
    if (ups_data.DATA_NAME === "datalog") {
      // dataLogData = [];

      // Split the text into an array of alarms
      const dataLogData = ups_data.dataLog.File_payload.split(" @ \n");

      // Convert the array of datalog data into an array of objects
      let arr = dataLogData.map((alarm) => {
        if (alarm) {
          let tmpSplitArr = alarm.split(",");
          return tmpSplitArr;
        }
      });

      arr.splice(-1, 1);
      let tmpArrNew = arr;
      let chunk_size = 88;
      let num_chunks = tmpArrNew.length;

      // var dataTable = document.getElementById('dataLogTable');
      // var tbody = dataTable.getElementsByTagName("tbody")[0];
      // var rows = tbody.getElementsByTagName("tr");
      // for (var i = rows.length - 1; i >= 0; i--) {
      //   tbody.removeChild(rows[i]);
      // }

      // serialNoDataLog = 0;

      const tableBody = document.querySelector("#dataLogTable tbody");

      for (let i = 0; i < num_chunks; i++) {
        let rowi = document.createElement("tr");
        let celli = document.createElement("td");
        celli.textContent = ++serialNoDataLog;
        rowi.appendChild(celli);

        tmpArrNew[i].splice(82);
        // tmpArrNew[i].splice(-7)

        for (let j = 0; j < tmpArrNew[i].length; j++) {
          let cellj = document.createElement("td");
          cellj.textContent = tmpArrNew[i][j];
          rowi.appendChild(cellj);
        }

        tableBody.appendChild(rowi);
      }
    }

    /*****************alarm data*****************/
    if (ups_data.DATA_NAME === "alarmlog") {
      // Split the text into an array of alarms
      const alarmsLogData = ups_data.alarmLog.File_payload.split("@ \n");

      // Convert the array of alarmslog data into an array of objects
      let arr = [];
      if (arr.length > 0) {
        arr = [];
      }
      arr = alarmsLogData.map((alarm) => {
        const [Status, Alarm_Number, Date, Time, Alarm_Name] = alarm.split(",");
        return {
          Status,
          Alarm_Number,
          Date,
          Time,
          Alarm_Name,
        };
      });

      arr.splice(-1, 1);

      // Create a table in HTML
      const tableBody = document.querySelector("#alarmTable tbody");

      for (const item of arr) {
        const row = document.createElement("tr");
        const cell0 = document.createElement("td");
        cell0.textContent = ++serialNoAlarm;
        row.appendChild(cell0);
        const cell1 = document.createElement("td");
        cell1.textContent =
          item.Status == 0 ? "Alarm Occurred" : "Alarm Released";
        row.appendChild(cell1);
        const cell2 = document.createElement("td");
        cell2.textContent = item.Alarm_Number.includes("\n")
          ? item.Alarm_Number.replace(/[\r\n]/gm, "")
          : item.Alarm_Number;
        row.appendChild(cell2);
        const cell3 = document.createElement("td");
        cell3.textContent = item.Date;
        row.appendChild(cell3);
        const cell4 = document.createElement("td");
        cell4.textContent = item.Time;
        row.appendChild(cell4);
        const cell5 = document.createElement("td");
        cell5.textContent = item.Alarm_Name;
        // cell4.textContent = item.Alarm_Name.includes('@') ? item.Alarm_Name.split('@')[0] : item.Alarm_Name;
        row.appendChild(cell5);

        tableBody.appendChild(row);
      }
    }

    /******************** status code ******************/
    let titleStr;
    let statusImage;
    let UI_Alarm = ups_data?.UI_Alarm;
    let Rectifier_Alarm1 = ups_data?.Rectifier_Alarm1;
    let Rectifier_Alarm2 = ups_data?.Rectifier_Alarm2;
    let Inverter_Alarm1 = ups_data?.Inverter_Alarm1;
    let Inverter_Alarm2 = ups_data?.Inverter_Alarm2;
    let Battery_Alarm1 = ups_data?.Battery_Alarm1;
    let Inverter_Alarm3 = ups_data?.Inverter_Alarm3;
    let Input_Alarm_0 = ups_data?.Input_Alarm_0;
    let Can_Alarm1 = ups_data?.Can_Alarm1;
    let Rectifier_Status1 = ups_data?.Rectifier_Status1;
    let Inverter_Status1 = ups_data?.Inverter_Status1;
    let Battery_Status1 = ups_data?.Battery_Status1;

    let Bypass_Input_text;
    let Bypass_Input_text_class;

    let mainsupply_Input_text;
    let mainsupply_Input_text_class;

    let rectifier_Input_text;
    let rectifier_Input_text_class;

    let battery_Input_text;
    let battery_Input_text_class;

    let battery_charging_Input_text;
    let battery_charging_Input_text_class;

    let inverter_Input_text;
    let inverter_Input_text_class;

    let load_inverter_Input_text;
    let load_inverter_Input_text_class;

    let synchronization_Input_text;
    let synchronization_Input_text_class;

    let common_alarm_Input_text;
    let common_alarm_Input_text_class;

    let battery_mccb_Input_text;
    let battery_mccb_Input_text_class;

    if (ups_data.DATA_NAME === "status") {
      let activeAlarmData = [];
      let activeAlarmCnt = 0;

      /********************active Alarm code************************/

      if (
        UI_Alarm.BIT_0 === 0 &&
        UI_Alarm.BIT_1 === 0 &&
        UI_Alarm.BIT_2 === 0 &&
        UI_Alarm.BIT_3 === 0 &&
        UI_Alarm.BIT_4 === 0 &&
        UI_Alarm.BIT_5 === 0 &&
        UI_Alarm.BIT_6 === 0 &&
        UI_Alarm.BIT_7 === 0 &&
        UI_Alarm.BIT_8 === 0 &&
        UI_Alarm.BIT_9 === 0 &&
        UI_Alarm.BIT_10 === 0 &&
        UI_Alarm.BIT_11 === 0 &&
        UI_Alarm.BIT_12 === 0 &&
        UI_Alarm.BIT_13 === 0 &&
        UI_Alarm.BIT_14 === 0 &&
        UI_Alarm.BIT_15 === 0 &&
        Rectifier_Alarm1.BIT_0 === 0 &&
        Rectifier_Alarm1.BIT_1 === 0 &&
        Rectifier_Alarm1.BIT_2 === 0 &&
        Rectifier_Alarm1.BIT_3 === 0 &&
        Rectifier_Alarm1.BIT_4 === 0 &&
        Rectifier_Alarm1.BIT_5 === 0 &&
        Rectifier_Alarm1.BIT_6 === 0 &&
        Rectifier_Alarm1.BIT_7 === 0 &&
        Rectifier_Alarm1.BIT_8 === 0 &&
        Rectifier_Alarm1.BIT_9 === 0 &&
        Rectifier_Alarm1.BIT_10 === 0 &&
        Rectifier_Alarm1.BIT_11 === 0 &&
        Rectifier_Alarm1.BIT_12 === 0 &&
        Rectifier_Alarm1.BIT_13 === 0 &&
        Rectifier_Alarm1.BIT_14 === 0 &&
        Rectifier_Alarm1.BIT_15 === 0 &&
        Rectifier_Alarm2.BIT_0 === 0 &&
        Rectifier_Alarm2.BIT_1 === 0 &&
        Rectifier_Alarm2.BIT_2 === 0 &&
        Rectifier_Alarm2.BIT_3 === 0 &&
        Rectifier_Alarm2.BIT_4 === 0 &&
        Rectifier_Alarm2.BIT_5 === 0 &&
        Rectifier_Alarm2.BIT_6 === 0 &&
        Rectifier_Alarm2.BIT_7 === 0 &&
        Rectifier_Alarm2.BIT_8 === 0 &&
        Rectifier_Alarm2.BIT_9 === 0 &&
        Rectifier_Alarm2.BIT_10 === 0 &&
        Rectifier_Alarm2.BIT_11 === 0 &&
        Rectifier_Alarm2.BIT_12 === 0 &&
        Rectifier_Alarm2.BIT_13 === 0 &&
        Rectifier_Alarm2.BIT_14 === 0 &&
        Rectifier_Alarm2.BIT_15 === 0 &&
        Inverter_Alarm1.BIT_0 === 0 &&
        Inverter_Alarm1.BIT_1 === 0 &&
        Inverter_Alarm1.BIT_2 === 0 &&
        Inverter_Alarm1.BIT_3 === 0 &&
        Inverter_Alarm1.BIT_4 === 0 &&
        Inverter_Alarm1.BIT_5 === 0 &&
        Inverter_Alarm1.BIT_6 === 0 &&
        Inverter_Alarm1.BIT_7 === 0 &&
        Inverter_Alarm1.BIT_8 === 0 &&
        Inverter_Alarm1.BIT_9 === 0 &&
        Inverter_Alarm1.BIT_10 === 0 &&
        Inverter_Alarm1.BIT_11 === 0 &&
        Inverter_Alarm1.BIT_12 === 0 &&
        Inverter_Alarm1.BIT_13 === 0 &&
        Inverter_Alarm1.BIT_14 === 0 &&
        Inverter_Alarm1.BIT_15 === 0 &&
        Inverter_Alarm2.BIT_0 === 0 &&
        Inverter_Alarm2.BIT_1 === 0 &&
        Inverter_Alarm2.BIT_2 === 0 &&
        Inverter_Alarm2.BIT_3 === 0 &&
        Inverter_Alarm2.BIT_4 === 0 &&
        Inverter_Alarm2.BIT_5 === 0 &&
        Inverter_Alarm2.BIT_6 === 0 &&
        Inverter_Alarm2.BIT_7 === 0 &&
        Inverter_Alarm2.BIT_8 === 0 &&
        Inverter_Alarm2.BIT_9 === 0 &&
        Inverter_Alarm2.BIT_10 === 0 &&
        Inverter_Alarm2.BIT_11 === 0 &&
        Inverter_Alarm2.BIT_12 === 0 &&
        Inverter_Alarm2.BIT_13 === 0 &&
        Inverter_Alarm2.BIT_14 === 0 &&
        Inverter_Alarm2.BIT_15 === 0 &&
        Battery_Alarm1.BIT_0 === 0 &&
        Battery_Alarm1.BIT_1 === 0 &&
        Battery_Alarm1.BIT_2 === 0 &&
        Battery_Alarm1.BIT_3 === 0 &&
        Battery_Alarm1.BIT_4 === 0 &&
        Battery_Alarm1.BIT_5 === 0 &&
        Battery_Alarm1.BIT_6 === 0 &&
        Battery_Alarm1.BIT_7 === 0 &&
        Battery_Alarm1.BIT_8 === 0 &&
        Battery_Alarm1.BIT_9 === 0 &&
        Battery_Alarm1.BIT_10 === 0 &&
        Battery_Alarm1.BIT_11 === 0 &&
        Battery_Alarm1.BIT_12 === 0 &&
        Battery_Alarm1.BIT_13 === 0 &&
        Battery_Alarm1.BIT_14 === 0 &&
        Battery_Alarm1.BIT_15 === 0 &&
        Inverter_Alarm3.BIT_0 === 0 &&
        Inverter_Alarm3.BIT_1 === 0 &&
        Inverter_Alarm3.BIT_2 === 0 &&
        Inverter_Alarm3.BIT_3 === 0 &&
        Inverter_Alarm3.BIT_4 === 0 &&
        Inverter_Alarm3.BIT_5 === 0 &&
        Inverter_Alarm3.BIT_6 === 0 &&
        Inverter_Alarm3.BIT_7 === 0 &&
        Inverter_Alarm3.BIT_8 === 0 &&
        Inverter_Alarm3.BIT_9 === 0 &&
        Inverter_Alarm3.BIT_10 === 0 &&
        Inverter_Alarm3.BIT_11 === 0 &&
        Inverter_Alarm3.BIT_12 === 0 &&
        Inverter_Alarm3.BIT_13 === 0 &&
        Inverter_Alarm3.BIT_14 === 0 &&
        Inverter_Alarm3.BIT_15 === 0 &&
        Input_Alarm_0.BIT_0 === 0 &&
        Input_Alarm_0.BIT_1 === 0 &&
        Input_Alarm_0.BIT_2 === 0 &&
        Input_Alarm_0.BIT_3 === 0 &&
        Input_Alarm_0.BIT_4 === 0 &&
        Input_Alarm_0.BIT_5 === 0 &&
        Input_Alarm_0.BIT_6 === 0 &&
        Input_Alarm_0.BIT_7 === 0 &&
        Input_Alarm_0.BIT_8 === 0 &&
        Input_Alarm_0.BIT_9 === 0 &&
        Input_Alarm_0.BIT_10 === 0 &&
        Input_Alarm_0.BIT_11 === 0 &&
        Input_Alarm_0.BIT_12 === 0 &&
        Input_Alarm_0.BIT_13 === 0 &&
        Input_Alarm_0.BIT_14 === 0 &&
        Input_Alarm_0.BIT_15 === 0 &&
        Can_Alarm1.BIT_0 === 0 &&
        Can_Alarm1.BIT_1 === 0 &&
        Can_Alarm1.BIT_2 === 0 &&
        Can_Alarm1.BIT_3 === 0 &&
        Can_Alarm1.BIT_4 === 0 &&
        Can_Alarm1.BIT_5 === 0 &&
        Can_Alarm1.BIT_6 === 0 &&
        Can_Alarm1.BIT_7 === 0 &&
        Can_Alarm1.BIT_8 === 0 &&
        Can_Alarm1.BIT_9 === 0 &&
        Can_Alarm1.BIT_10 === 0 &&
        Can_Alarm1.BIT_11 === 0 &&
        Can_Alarm1.BIT_12 === 0 &&
        Can_Alarm1.BIT_13 === 0 &&
        Can_Alarm1.BIT_14 === 0 &&
        Can_Alarm1.BIT_15 === 0
      ) {
        document.getElementById("activeAlarmRow").classList.add("d-none");
        activeAlarmData = [];
        activeAlarmCnt = 0;
      } else {
        if (
          UI_Alarm.BIT_0 === 1 ||
          UI_Alarm.BIT_1 === 1 ||
          UI_Alarm.BIT_2 === 1 ||
          UI_Alarm.BIT_3 === 1 ||
          UI_Alarm.BIT_4 === 1 ||
          UI_Alarm.BIT_5 === 1 ||
          UI_Alarm.BIT_6 === 1 ||
          UI_Alarm.BIT_7 === 1 ||
          UI_Alarm.BIT_8 === 1 ||
          UI_Alarm.BIT_9 === 1 ||
          UI_Alarm.BIT_10 === 1 ||
          UI_Alarm.BIT_11 === 1 ||
          UI_Alarm.BIT_12 === 1 ||
          UI_Alarm.BIT_13 === 1 ||
          UI_Alarm.BIT_14 === 1 ||
          UI_Alarm.BIT_15.BIT_15 === 1
        ) {
          if (UI_Alarm.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SC COMM. FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CHG COMM. FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI - 1");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI - 2");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("HEAR RUN MODE");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BATTERY MCCB OFF");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("DC GROUND");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI-5");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BAT. DISCHARGING");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECTIFIER FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BATT.LIFE DETORA");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CHARGER FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BOOST CHARGING");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI - 5");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI - 6");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (UI_Alarm.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RESERVED UI - 7");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Rectifier_Alarm1.BIT_0 === 1 ||
          Rectifier_Alarm1.BIT_1 === 1 ||
          Rectifier_Alarm1.BIT_2 === 1 ||
          Rectifier_Alarm1.BIT_3 === 1 ||
          Rectifier_Alarm1.BIT_4 === 1 ||
          Rectifier_Alarm1.BIT_5 === 1 ||
          Rectifier_Alarm1.BIT_6 === 1 ||
          Rectifier_Alarm1.BIT_7 === 1 ||
          Rectifier_Alarm1.BIT_8 === 1 ||
          Rectifier_Alarm1.BIT_9 === 1 ||
          Rectifier_Alarm1.BIT_10 === 1 ||
          Rectifier_Alarm1.BIT_11 === 1 ||
          Rectifier_Alarm1.BIT_12 === 1 ||
          Rectifier_Alarm1.BIT_13 === 1 ||
          Rectifier_Alarm1.BIT_14 === 1 ||
          Rectifier_Alarm1.BIT_15 === 1
        ) {
          if (Rectifier_Alarm1.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT SAT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT OVER TEMP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S HIGH");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S LOW");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S HIGH TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S LOW TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAIN'S FREQ O TOL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("I/P PHASE REV");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SMPS FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("PRE-CHARG FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT OVERLOAD");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("HI-I/P SLEW RATE");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("I/P I-PEAK TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CBI OFF");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm1.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CNT POWER ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Rectifier_Alarm2.BIT_0 === 1 ||
          Rectifier_Alarm2.BIT_1 === 1 ||
          Rectifier_Alarm2.BIT_2 === 1 ||
          Rectifier_Alarm2.BIT_3 === 1 ||
          Rectifier_Alarm2.BIT_4 === 1 ||
          Rectifier_Alarm2.BIT_5 === 1 ||
          Rectifier_Alarm2.BIT_6 === 1 ||
          Rectifier_Alarm2.BIT_7 === 1 ||
          Rectifier_Alarm2.BIT_8 === 1 ||
          Rectifier_Alarm2.BIT_9 === 1 ||
          Rectifier_Alarm2.BIT_10 === 1 ||
          Rectifier_Alarm2.BIT_11 === 1 ||
          Rectifier_Alarm2.BIT_12 === 1 ||
          Rectifier_Alarm2.BIT_13 === 1 ||
          Rectifier_Alarm2.BIT_14 === 1 ||
          Rectifier_Alarm2.BIT_15 === 1
        ) {
          if (Rectifier_Alarm2.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("I/P I-LEAK I T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BAT I-LEAK B T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("REC SAT TRP3 I T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("REC / BST SWT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BAT TOO LOW I & B TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("LOW DC I&B TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CHG HIGH DC B T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("REC HIGH DC I&BT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("B/B SAT TRP3 B T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("I/P BREAKER TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BATT BREAKER TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT DC LOW TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("B/B FUSE FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BOOSTER ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CHARGER ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Rectifier_Alarm2.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECTIFIER ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Inverter_Alarm1.BIT_0 === 1 ||
          Inverter_Alarm1.BIT_1 === 1 ||
          Inverter_Alarm1.BIT_2 === 1 ||
          Inverter_Alarm1.BIT_3 === 1 ||
          Inverter_Alarm1.BIT_4 === 1 ||
          Inverter_Alarm1.BIT_5 === 1 ||
          Inverter_Alarm1.BIT_6 === 1 ||
          Inverter_Alarm1.BIT_7 === 1 ||
          Inverter_Alarm1.BIT_8 === 1 ||
          Inverter_Alarm1.BIT_9 === 1 ||
          Inverter_Alarm1.BIT_10 === 1 ||
          Inverter_Alarm1.BIT_11 === 1 ||
          Inverter_Alarm1.BIT_12 === 1 ||
          Inverter_Alarm1.BIT_13 === 1 ||
          Inverter_Alarm1.BIT_14 === 1 ||
          Inverter_Alarm1.BIT_15 === 1
        ) {
          if (Inverter_Alarm1.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INVERTER LOW");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INVERTER HIGH");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ALTERNATE LOW");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ALTERNATE HIGH");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("OUTPUT LOW");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("OUTPUT HIGH");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV SAT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV NOT OK");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ALT NOT OK");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("OUT NOT OK");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV OVER TEMP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SSW OVER TEMP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS OVERLOAD");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("OVERLOAD TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV CL ACT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm1.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ALT IS ANTICLOCK");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Inverter_Alarm2.BIT_0 === 1 ||
          Inverter_Alarm2.BIT_1 === 1 ||
          Inverter_Alarm2.BIT_2 === 1 ||
          Inverter_Alarm2.BIT_3 === 1 ||
          Inverter_Alarm2.BIT_4 === 1 ||
          Inverter_Alarm2.BIT_5 === 1 ||
          Inverter_Alarm2.BIT_6 === 1 ||
          Inverter_Alarm2.BIT_7 === 1 ||
          Inverter_Alarm2.BIT_8 === 1 ||
          Inverter_Alarm2.BIT_9 === 1 ||
          Inverter_Alarm2.BIT_10 === 1 ||
          Inverter_Alarm2.BIT_11 === 1 ||
          Inverter_Alarm2.BIT_12 === 1 ||
          Inverter_Alarm2.BIT_13 === 1 ||
          Inverter_Alarm2.BIT_14 === 1 ||
          Inverter_Alarm2.BIT_15 === 1
        ) {
          if (Inverter_Alarm2.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ALT FO");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV CL TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("ECO MODE ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("NO SYNC");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("DC HIGH TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("DC LOW TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MIS OFF");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MAN TRAN TO BYPASS");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MBS ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("LOAD ON BYPASS");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("STOP COMMAND");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("NEG POWER TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("TRANSFOMER OT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("TRANSFOMER OT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SYSTEM OVERLOAD");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm2.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SYSTEM OL TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Battery_Alarm1.BIT_0 === 1 ||
          Battery_Alarm1.BIT_1 === 1 ||
          Battery_Alarm1.BIT_2 === 1 ||
          Battery_Alarm1.BIT_3 === 1 ||
          Battery_Alarm1.BIT_4 === 1 ||
          Battery_Alarm1.BIT_5 === 1 ||
          Battery_Alarm1.BIT_6 === 1 ||
          Battery_Alarm1.BIT_7 === 1 ||
          Battery_Alarm1.BIT_8 === 1 ||
          Battery_Alarm1.BIT_9 === 1 ||
          Battery_Alarm1.BIT_10 === 1 ||
          Battery_Alarm1.BIT_11 === 1 ||
          Battery_Alarm1.BIT_12 === 1 ||
          Battery_Alarm1.BIT_13 === 1 ||
          Battery_Alarm1.BIT_14 === 1 ||
          Battery_Alarm1.BIT_15 === 1
        ) {
          if (Battery_Alarm1.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("LOW BATTERY");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT /BOOST CHOKE OT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("LOW BATTERY TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BATT I-PEAK TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BUCK SAT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BOOSTER SAT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CBB OFF");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BUCK / BOOST OT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BOOST OVER VOLT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BUCK UNDER VOLT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BUCK OVER VOLT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MANUAL BOOST ON");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS MASTER (ONLY FOR ALARM LOG)");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS SLAVE (ONLY FOR ALARM LOG)");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("B/B CHOKE OVER TEMP TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Battery_Alarm1.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("RECT CHOKE OT TRIP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Inverter_Alarm3.BIT_0 === 1 ||
          Inverter_Alarm3.BIT_1 === 1 ||
          Inverter_Alarm3.BIT_2 === 1 ||
          Inverter_Alarm3.BIT_3 === 1 ||
          Inverter_Alarm3.BIT_4 === 1 ||
          Inverter_Alarm3.BIT_5 === 1 ||
          Inverter_Alarm3.BIT_6 === 1 ||
          Inverter_Alarm3.BIT_7 === 1 ||
          Inverter_Alarm3.BIT_8 === 1 ||
          Inverter_Alarm3.BIT_9 === 1 ||
          Inverter_Alarm3.BIT_10 === 1 ||
          Inverter_Alarm3.BIT_11 === 1 ||
          Inverter_Alarm3.BIT_12 === 1 ||
          Inverter_Alarm3.BIT_13 === 1 ||
          Inverter_Alarm3.BIT_14 === 1 ||
          Inverter_Alarm3.BIT_15 === 1
        ) {
          if (Inverter_Alarm3.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("R-Ph INV SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Y-Ph INV SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("B-Ph INV SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("R-Ph ALT SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Y-Ph ALT SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("B-Ph ALT SSW ERROR");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("O/P CT FB OPEN");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("I/P CT FB OPEN");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV SAT TRIP -3 I & B T");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("BOOST UNDER VOLT");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SMPS FUSE FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("EMERGENCY STOP");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("LOAD ON INVERTER (ONLY IN  ECO  MODE)");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV DC LOW INS");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("HIGH ALT SLEW RATE");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Inverter_Alarm3.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("INV VOLT FB OPEN");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Input_Alarm_0.BIT_0 === 1 ||
          Input_Alarm_0.BIT_1 === 1 ||
          Input_Alarm_0.BIT_2 === 1 ||
          Input_Alarm_0.BIT_3 === 1 ||
          Input_Alarm_0.BIT_4 === 1 ||
          Input_Alarm_0.BIT_5 === 1 ||
          Input_Alarm_0.BIT_6 === 1 ||
          Input_Alarm_0.BIT_7 === 1 ||
          Input_Alarm_0.BIT_8 === 1 ||
          Input_Alarm_0.BIT_9 === 1 ||
          Input_Alarm_0.BIT_10 === 1 ||
          Input_Alarm_0.BIT_11 === 1 ||
          Input_Alarm_0.BIT_12 === 1 ||
          Input_Alarm_0.BIT_13 === 1 ||
          Input_Alarm_0.BIT_14 === 1 ||
          Input_Alarm_0.BIT_15 === 1
        ) {
          if (Input_Alarm_0.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-01 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-02 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-03 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-04 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-05 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-06 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-07 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-08 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-09 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-10 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-11 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-12 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-13 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-14 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-15 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Input_Alarm_0.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("Digital Input-16 Sort");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (
          Can_Alarm1.BIT_0 === 1 ||
          Can_Alarm1.BIT_1 === 1 ||
          Can_Alarm1.BIT_2 === 1 ||
          Can_Alarm1.BIT_3 === 1 ||
          Can_Alarm1.BIT_4 === 1 ||
          Can_Alarm1.BIT_5 === 1 ||
          Can_Alarm1.BIT_6 === 1 ||
          Can_Alarm1.BIT_7 === 1 ||
          Can_Alarm1.BIT_8 === 1 ||
          Can_Alarm1.BIT_9 === 1 ||
          Can_Alarm1.BIT_10 === 1 ||
          Can_Alarm1.BIT_11 === 1 ||
          Can_Alarm1.BIT_12 === 1 ||
          Can_Alarm1.BIT_13 === 1 ||
          Can_Alarm1.BIT_14 === 1 ||
          Can_Alarm1.BIT_15 === 1
        ) {
          if (Can_Alarm1.BIT_0 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-1 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_1 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-2 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_2 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-3 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_3 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-4 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_4 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-5 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_5 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-6 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_6 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-7 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_7 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-8 CAN-A FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_8 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-1 SUPPLY FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_9 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-2 SUPPLY FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_10 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-3 SUPPLY FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_11 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-4 SUPPLY FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_12 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("UPS-5 SUPPLY FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_13 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("CAN-A COMM FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_14 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("MASTER CAN-B FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }

          if (Can_Alarm1.BIT_15 === 1) {
            if (activeAlarmCnt < 24) {
              activeAlarmData.push("SLAVE CAN-B FAIL");
              activeAlarmCnt = activeAlarmData.length;
            }
          }
        }

        if (activeAlarmData.length > 0) {
          // document.getElementById('activeAlarmRow').style.display = 'block';
          document.getElementById("activeAlarmRow").classList.remove("d-none");
          let divStr = '<div class="row justify-content-center">';
          activeAlarmData.forEach(function (value, index) {
            // divStr += `<div class="activeAlarmDiv_css">${value}</div>`;
            divStr += `<div class="col-3 card m-1 p-2 shadow d-flex flex-row"> <span class="dot-red align-self-center m-2"></span> <span class="align-items-center d-flex">${value}</span> </div>`;
          });
          divStr += "<div>";

          document.getElementById("activeAlarmDiv").innerHTML = divStr;
        }
      }

      /********************Alarm code************************/

      titleStr =
        ups_data.DATA_TYPE === 1 ? "i4ET (1-PHASE UPS)" : "i6ET (3-PHASE UPS)";
      document.getElementById("titleStr").innerText = titleStr;

      // statusImage = (ups_data.DATA_TYPE === 1) ? 'asset/img/i4Plus.JPG' : 'asset/img/i6.jpg';
      statusImage = ups_data.DATA_TYPE === 1 ? "i4+ Series" : "i6 Series";
      // document.getElementById('statusImage').setAttribute('src', statusImage);
      document.getElementById("statusImage").innerText = statusImage;

      /******************** bypass input **************************/

      if (Inverter_Alarm1.BIT_2 === 1 || Inverter_Alarm1.BIT_3 === 1) {
        Bypass_Input_text = "Out of Range";
        Bypass_Input_text_class = "blinking-red";
      } else if (Inverter_Status1.BIT_6 === 0) {
        Bypass_Input_text = "Absent";
        Bypass_Input_text_class = "dot-red";
      } else if (Inverter_Status1.BIT_6 === 1) {
        Bypass_Input_text = "Within range";
        Bypass_Input_text_class = "dot-green";
      }

      document
        .getElementById("bypass_input_css")
        .classList.remove(
          ...document.getElementById("bypass_input_css").classList
        );
      document
        .getElementById("bypass_input_css")
        .classList.add(Bypass_Input_text_class);
      document.getElementById("bypass_input_css_text").innerText =
        Bypass_Input_text;

      /******************** bypass input **************************/

      /******************** main supply **************************/

      if (Rectifier_Alarm1.BIT_6 === 1) {
        mainsupply_Input_text = "Absent";
        mainsupply_Input_text_class = "dot-gray";
      } else if (Rectifier_Alarm1.BIT_2 === 1 || Rectifier_Alarm1.BIT_3 === 1) {
        mainsupply_Input_text = "Out of Range";
        mainsupply_Input_text_class = "blinking-green";
      } else if (Rectifier_Alarm1.BIT_6 === 0) {
        mainsupply_Input_text = "Within range";
        mainsupply_Input_text_class = "dot-green";
      }

      document
        .getElementById("mainsupply_input_css")
        .classList.remove(
          ...document.getElementById("mainsupply_input_css").classList
        );
      document
        .getElementById("mainsupply_input_css")
        .classList.add(mainsupply_Input_text_class);
      document.getElementById("mainsupply_input_css_text").innerText =
        mainsupply_Input_text;
      /************************* main supply *****************************/

      /******************** rectifier operation **************************/

      if (Rectifier_Alarm1.BIT_0 === 1) {
        rectifier_Input_text = "Trip";
        rectifier_Input_text_class = "blinking-red";
      } else if (Rectifier_Status1.BIT_1 === 0) {
        rectifier_Input_text = "OFF";
        rectifier_Input_text_class = "dot-gray";
      } else if (Rectifier_Status1.BIT_1 === 1) {
        rectifier_Input_text = "ON";
        rectifier_Input_text_class = "dot-green";
      }

      document
        .getElementById("rectifier_input_css")
        .classList.remove(
          ...document.getElementById("rectifier_input_css").classList
        );
      document
        .getElementById("rectifier_input_css")
        .classList.add(rectifier_Input_text_class);
      document.getElementById("rectifier_input_css_text").innerText =
        rectifier_Input_text;
      /******************** rectifier operation **************************/

      /******************** booster operation **************************/
      if (Battery_Alarm1.BIT_5 === 1) {
        battery_Input_text = "Trip";
        battery_Input_text_class = "blinking-red";
      } else if (Battery_Status1.BIT_2 === 0) {
        battery_Input_text = "OFF";
        battery_Input_text_class = "dot-gray";
      } else if (Battery_Status1.BIT_2 === 1) {
        battery_Input_text = "ON";
        battery_Input_text_class = "dot-red";
      }

      document
        .getElementById("battery_input_css")
        .classList.remove(
          ...document.getElementById("battery_input_css").classList
        );
      document
        .getElementById("battery_input_css")
        .classList.add(battery_Input_text_class);
      document.getElementById("battery_input_css_text").innerText =
        battery_Input_text;
      /******************** booster operation **************************/

      /******************** charger operation **************************/
      if (Battery_Status1.BIT_3 === 1) {
        battery_charging_Input_text = "Trip";
        battery_charging_Input_text_class = "blinking-red";
      } else if (Battery_Status1.BIT_6 === 1) {
        battery_charging_Input_text = "Boost charge";
        battery_charging_Input_text_class = "dot-red";
      } else if (Battery_Status1.BIT_5 === 1) {
        battery_charging_Input_text = "Float Charge";
        battery_charging_Input_text_class = "dot-green";
      } else if (Battery_Status1.BIT_1 === 0) {
        battery_charging_Input_text = "OFF";
        battery_charging_Input_text_class = "dot-gray";
      }

      document
        .getElementById("battery_charging_input_css")
        .classList.remove(
          ...document.getElementById("battery_charging_input_css").classList
        );
      document
        .getElementById("battery_charging_input_css")
        .classList.add(battery_charging_Input_text_class);
      document.getElementById("battery_charging_input_css_text").innerText =
        battery_charging_Input_text;
      /******************** charger operation **************************/

      /******************** inverter operation **************************/
      if (Inverter_Alarm1.BIT_6 === 1) {
        inverter_Input_text = "Trip";
        inverter_Input_text_class = "blinking-red";
      } else if (Inverter_Status1.BIT_0 === 0) {
        inverter_Input_text = "OFF";
        inverter_Input_text_class = "dot-red";
      } else if (Inverter_Status1.BIT_0 === 1) {
        inverter_Input_text = "ON";
        inverter_Input_text_class = "dot-green";
      }

      document
        .getElementById("inverter_input_css")
        .classList.remove(
          ...document.getElementById("inverter_input_css").classList
        );
      document
        .getElementById("inverter_input_css")
        .classList.add(inverter_Input_text_class);
      document.getElementById("inverter_input_css_text").innerText =
        inverter_Input_text;
      /******************** inverter operation **************************/

      /******************** load on inverter operation **************************/
      if (Inverter_Status1.BIT_4 === 1) {
        load_inverter_Input_text = "Inverter SSW ON";
        load_inverter_Input_text_class = "dot-green";
      } else if (Inverter_Status1.BIT_4 === 0) {
        load_inverter_Input_text = "Inverter SSW OFF";
        load_inverter_Input_text_class = "dot-gray";
      }

      document
        .getElementById("load_inverter_input_css")
        .classList.remove(
          ...document.getElementById("load_inverter_input_css").classList
        );
      document
        .getElementById("load_inverter_input_css")
        .classList.add(load_inverter_Input_text_class);
      document.getElementById("load_inverter_input_css_text").innerText =
        load_inverter_Input_text;
      /******************** load on inverter operation **************************/

      /******************** load on bypass operation **************************/
      if (Inverter_Status1.BIT_3 === 1) {
        load_bypass_Input_text = "Bypass SSW ON";
        load_bypass_Input_text_class = "dot-red";
      } else if (Inverter_Status1.BIT_3 === 0) {
        load_bypass_Input_text = "Bypass SSW OFF";
        load_bypass_Input_text_class = "dot-gray";
      }

      document
        .getElementById("load_bypass_input_css")
        .classList.remove(
          ...document.getElementById("load_bypass_input_css").classList
        );
      document
        .getElementById("load_bypass_input_css")
        .classList.add(load_bypass_Input_text_class);
      document.getElementById("load_bypass_input_css_text").innerText =
        load_bypass_Input_text;
      /******************** load on bypass operation **************************/

      /******************** synchronization **************************/
      if (Inverter_Status1.BIT_8 === 1) {
        synchronization_Input_text = "Sync";
        synchronization_Input_text_class = "dot-yellow";
      } else if (Inverter_Status1.BIT_8 === 0) {
        synchronization_Input_text = "No sync";
        synchronization_Input_text_class = "blinking-yellow";
      }

      document
        .getElementById("synchronization_input_css")
        .classList.remove(
          ...document.getElementById("synchronization_input_css").classList
        );
      document
        .getElementById("synchronization_input_css")
        .classList.add(synchronization_Input_text_class);
      document.getElementById("synchronization_input_css_text").innerText =
        synchronization_Input_text;
      /******************** synchronization **************************/

      /******************** battery mccb status  **************************/
      if (UI_Alarm.BIT_5 === 1) {
        battery_mccb_Input_text = "Battery MCCB is OFF";
        battery_mccb_Input_text_class = "blinking-red";
      } else if (UI_Alarm.BIT_5 === 0) {
        battery_mccb_Input_text = "Battery MCCB is ON";
        battery_mccb_Input_text_class = "dot-green";
      }

      document
        .getElementById("battery_mccb_input_css")
        .classList.remove(
          ...document.getElementById("battery_mccb_input_css").classList
        );
      document
        .getElementById("battery_mccb_input_css")
        .classList.add(battery_mccb_Input_text_class);
      document.getElementById("battery_mccb_input_css_text").innerText =
        battery_mccb_Input_text;
      /******************** battery mccb status **************************/

      /******************** common alarm indication  **************************/
      if (
        UI_Alarm.BIT_0 === 0 &&
        UI_Alarm.BIT_1 === 0 &&
        UI_Alarm.BIT_2 === 0 &&
        UI_Alarm.BIT_3 === 0 &&
        UI_Alarm.BIT_4 === 0 &&
        UI_Alarm.BIT_5 === 0 &&
        UI_Alarm.BIT_6 === 0 &&
        UI_Alarm.BIT_7 === 0 &&
        UI_Alarm.BIT_8 === 0 &&
        UI_Alarm.BIT_9 === 0 &&
        UI_Alarm.BIT_10 === 0 &&
        UI_Alarm.BIT_11 === 0 &&
        UI_Alarm.BIT_12 === 0 &&
        UI_Alarm.BIT_13 === 0 &&
        UI_Alarm.BIT_14 === 0 &&
        UI_Alarm.BIT_15 === 0 &&
        Rectifier_Alarm1.BIT_0 === 0 &&
        Rectifier_Alarm1.BIT_1 === 0 &&
        Rectifier_Alarm1.BIT_2 === 0 &&
        Rectifier_Alarm1.BIT_3 === 0 &&
        Rectifier_Alarm1.BIT_4 === 0 &&
        Rectifier_Alarm1.BIT_5 === 0 &&
        Rectifier_Alarm1.BIT_6 === 0 &&
        Rectifier_Alarm1.BIT_7 === 0 &&
        Rectifier_Alarm1.BIT_8 === 0 &&
        Rectifier_Alarm1.BIT_9 === 0 &&
        Rectifier_Alarm1.BIT_10 === 0 &&
        Rectifier_Alarm1.BIT_11 === 0 &&
        Rectifier_Alarm1.BIT_12 === 0 &&
        Rectifier_Alarm1.BIT_13 === 0 &&
        Rectifier_Alarm1.BIT_14 === 0 &&
        Rectifier_Alarm1.BIT_15 === 0 &&
        Rectifier_Alarm2.BIT_0 === 0 &&
        Rectifier_Alarm2.BIT_1 === 0 &&
        Rectifier_Alarm2.BIT_2 === 0 &&
        Rectifier_Alarm2.BIT_3 === 0 &&
        Rectifier_Alarm2.BIT_4 === 0 &&
        Rectifier_Alarm2.BIT_5 === 0 &&
        Rectifier_Alarm2.BIT_6 === 0 &&
        Rectifier_Alarm2.BIT_7 === 0 &&
        Rectifier_Alarm2.BIT_8 === 0 &&
        Rectifier_Alarm2.BIT_9 === 0 &&
        Rectifier_Alarm2.BIT_10 === 0 &&
        Rectifier_Alarm2.BIT_11 === 0 &&
        Rectifier_Alarm2.BIT_12 === 0 &&
        Rectifier_Alarm2.BIT_13 === 0 &&
        Rectifier_Alarm2.BIT_14 === 0 &&
        Rectifier_Alarm2.BIT_15 === 0 &&
        Inverter_Alarm1.BIT_0 === 0 &&
        Inverter_Alarm1.BIT_1 === 0 &&
        Inverter_Alarm1.BIT_2 === 0 &&
        Inverter_Alarm1.BIT_3 === 0 &&
        Inverter_Alarm1.BIT_4 === 0 &&
        Inverter_Alarm1.BIT_5 === 0 &&
        Inverter_Alarm1.BIT_6 === 0 &&
        Inverter_Alarm1.BIT_7 === 0 &&
        Inverter_Alarm1.BIT_8 === 0 &&
        Inverter_Alarm1.BIT_9 === 0 &&
        Inverter_Alarm1.BIT_10 === 0 &&
        Inverter_Alarm1.BIT_11 === 0 &&
        Inverter_Alarm1.BIT_12 === 0 &&
        Inverter_Alarm1.BIT_13 === 0 &&
        Inverter_Alarm1.BIT_14 === 0 &&
        Inverter_Alarm1.BIT_15 === 0 &&
        Inverter_Alarm2.BIT_0 === 0 &&
        Inverter_Alarm2.BIT_1 === 0 &&
        Inverter_Alarm2.BIT_2 === 0 &&
        Inverter_Alarm2.BIT_3 === 0 &&
        Inverter_Alarm2.BIT_4 === 0 &&
        Inverter_Alarm2.BIT_5 === 0 &&
        Inverter_Alarm2.BIT_6 === 0 &&
        Inverter_Alarm2.BIT_7 === 0 &&
        Inverter_Alarm2.BIT_8 === 0 &&
        Inverter_Alarm2.BIT_9 === 0 &&
        Inverter_Alarm2.BIT_10 === 0 &&
        Inverter_Alarm2.BIT_11 === 0 &&
        Inverter_Alarm2.BIT_12 === 0 &&
        Inverter_Alarm2.BIT_13 === 0 &&
        Inverter_Alarm2.BIT_14 === 0 &&
        Inverter_Alarm2.BIT_15 === 0 &&
        Battery_Alarm1.BIT_0 === 0 &&
        Battery_Alarm1.BIT_1 === 0 &&
        Battery_Alarm1.BIT_2 === 0 &&
        Battery_Alarm1.BIT_3 === 0 &&
        Battery_Alarm1.BIT_4 === 0 &&
        Battery_Alarm1.BIT_5 === 0 &&
        Battery_Alarm1.BIT_6 === 0 &&
        Battery_Alarm1.BIT_7 === 0 &&
        Battery_Alarm1.BIT_8 === 0 &&
        Battery_Alarm1.BIT_9 === 0 &&
        Battery_Alarm1.BIT_10 === 0 &&
        Battery_Alarm1.BIT_11 === 0 &&
        Battery_Alarm1.BIT_12 === 0 &&
        Battery_Alarm1.BIT_13 === 0 &&
        Battery_Alarm1.BIT_14 === 0 &&
        Battery_Alarm1.BIT_15 === 0 &&
        Inverter_Alarm3.BIT_0 === 0 &&
        Inverter_Alarm3.BIT_1 === 0 &&
        Inverter_Alarm3.BIT_2 === 0 &&
        Inverter_Alarm3.BIT_3 === 0 &&
        Inverter_Alarm3.BIT_4 === 0 &&
        Inverter_Alarm3.BIT_5 === 0 &&
        Inverter_Alarm3.BIT_6 === 0 &&
        Inverter_Alarm3.BIT_7 === 0 &&
        Inverter_Alarm3.BIT_8 === 0 &&
        Inverter_Alarm3.BIT_9 === 0 &&
        Inverter_Alarm3.BIT_10 === 0 &&
        Inverter_Alarm3.BIT_11 === 0 &&
        Inverter_Alarm3.BIT_12 === 0 &&
        Inverter_Alarm3.BIT_13 === 0 &&
        Inverter_Alarm3.BIT_14 === 0 &&
        Inverter_Alarm3.BIT_15 === 0 &&
        Input_Alarm_0.BIT_0 === 0 &&
        Input_Alarm_0.BIT_1 === 0 &&
        Input_Alarm_0.BIT_2 === 0 &&
        Input_Alarm_0.BIT_3 === 0 &&
        Input_Alarm_0.BIT_4 === 0 &&
        Input_Alarm_0.BIT_5 === 0 &&
        Input_Alarm_0.BIT_6 === 0 &&
        Input_Alarm_0.BIT_7 === 0 &&
        Input_Alarm_0.BIT_8 === 0 &&
        Input_Alarm_0.BIT_9 === 0 &&
        Input_Alarm_0.BIT_10 === 0 &&
        Input_Alarm_0.BIT_11 === 0 &&
        Input_Alarm_0.BIT_12 === 0 &&
        Input_Alarm_0.BIT_13 === 0 &&
        Input_Alarm_0.BIT_14 === 0 &&
        Input_Alarm_0.BIT_15 === 0 &&
        Can_Alarm1.BIT_0 === 0 &&
        Can_Alarm1.BIT_1 === 0 &&
        Can_Alarm1.BIT_2 === 0 &&
        Can_Alarm1.BIT_3 === 0 &&
        Can_Alarm1.BIT_4 === 0 &&
        Can_Alarm1.BIT_5 === 0 &&
        Can_Alarm1.BIT_6 === 0 &&
        Can_Alarm1.BIT_7 === 0 &&
        Can_Alarm1.BIT_8 === 0 &&
        Can_Alarm1.BIT_9 === 0 &&
        Can_Alarm1.BIT_10 === 0 &&
        Can_Alarm1.BIT_11 === 0 &&
        Can_Alarm1.BIT_12 === 0 &&
        Can_Alarm1.BIT_13 === 0 &&
        Can_Alarm1.BIT_14 === 0 &&
        Can_Alarm1.BIT_15 === 0
      ) {
        common_alarm_Input_text = "No Alarm";
        common_alarm_Input_text_class = "dot-gray";
      } else {
        common_alarm_Input_text = "Any alarm present";
        common_alarm_Input_text_class = "blinking-red";
      }

      document
        .getElementById("common_alarm_input_css")
        .classList.remove(
          ...document.getElementById("common_alarm_input_css").classList
        );
      document
        .getElementById("common_alarm_input_css")
        .classList.add(common_alarm_Input_text_class);
      document.getElementById("common_alarm_input_css_text").innerText =
        common_alarm_Input_text;
      /******************** common alarm indication **************************/
    }

    /********************** metering code ********************/
    if (ups_data.DATA_TYPE === 1 && ups_data.DATA_NAME === "metering") {
      /*********************** for 1 phase ******************************/

      // need to do show hide when get data
      document.getElementById("row1").classList.add("d-none");
      document.getElementById("row2").classList.add("d-none");
      document.getElementById("row3").classList.add("d-none");
      document.getElementById("row4").classList.add("d-none");
      document.getElementById("row5").classList.remove("d-none");
      document.getElementById("row6").classList.remove("d-none");
      document.getElementById("row7").classList.remove("d-none");

      const MAIN_INPUT_Voltage = [
        ups_data?.R_Y_Phase_Input_Voltage,
        ups_data?.Y_B_Phase_Input_Voltage,
        ups_data?.B_R_Phase_Input_Voltage,
      ];
      const MAIN_INPUT_CURRENT = [
        ups_data?.R_Phase_Input_Current,
        ups_data?.Y_Phase_Input_Current,
        ups_data?.B_Phase_Input_Current,
      ];
      const ALTERNET_Voltage = [
        ups_data?.R_Phase_Bypass_Voltage,
        // ups_data?.Y_Phase_Bypass_Voltage,
        // ups_data?.B_Phase_Bypass_Voltage,
      ];
      const ALTERNET_CURRENT = [
        ups_data?.R_Phase_Alternate_Current,
        // ups_data?.Y_Phase_Alternate_Current,
        // ups_data?.B_Phase_Alternate_Current,
      ];
      const INVERTER_Voltage = [
        ups_data?.R_Phase_Inverter_Voltage,
        // ups_data?.Y_Phase_Inverter_Voltage,
        // ups_data?.B_Phase_Inverter_Voltage,
      ];
      const INVERTER_CURRENT = [
        ups_data?.R_Phase_Inverter_Current,
        // ups_data?.Y_Phase_Inverter_Current,
        // ups_data?.B_Phase_Inverter_Current,
      ];
      const INVERTER_FREQUENCY = [
        ups_data?.Inverter_Frequency,
        // ups_data?.Inverter_Frequency,
        // ups_data?.Inverter_Frequency,
      ];
      const OUTPUT_Voltage = [
        ups_data?.R_Phase_Output_Voltage,
        // ups_data?.Y_Phase_Output_Voltage,
        // ups_data?.B_Phase_Output_Voltage,
      ];
      const OUTPUT_CURRENT = [
        ups_data?.R_Phase_Output_Current,
        // ups_data?.Y_Phase_Output_Current,
        // ups_data?.B_Phase_Output_Current,
      ];
      const LOAD_IN_KVA = [
        ups_data?.Total_UPS_Power_In_KVA,
        ups_data?.Total_Output_Power_In_KVA,
      ];
      const LOAD_IN_KW = [
        ups_data?.Total_UPS_Power_In_KW,
        ups_data?.Total_Output_Power_In_KW,
      ];
      const POWER_FACTOR = [
        ups_data?.Total_UPS_Power_PF,
        ups_data?.Total_Output_Power_PF,
      ];

      const BATTERY_DATA = [
        ups_data?.Battery_Voltage,
        ups_data?.Battery_Current,
        ups_data?.Battery_Status,
      ];

      var rectifier_table = document.getElementById("rectifier-single");

      rectifier_table
        .getElementsByTagName("thead")[0]
        .getElementsByTagName("tr")[0]
        .getElementsByTagName("td")[0].innerHTML =
        ups_data?.DC_Link_Voltage + " Volt";

      var main_table = document.getElementById("main-input-single");
      var tableRef = main_table.getElementsByTagName("tbody")[0];
      var voltage_Row = tableRef.rows[0];
      var current_Row = tableRef.rows[1];
      var freq_Row = tableRef.rows[2];

      var voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = MAIN_INPUT_Voltage[i] + " Volt";
      }

      var current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = MAIN_INPUT_CURRENT[i] + " Amp";
      }

      var freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Mains_Input_Freq + " Hz";
      }

      var alternate_table = document.getElementById("alternate-single");
      tableRef = alternate_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      freq_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = ALTERNET_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = ALTERNET_CURRENT[i] + " Amp";
      }

      freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Bypass_Freq + " Hz";
      }

      var inverter_table = document.getElementById("inverter-single");
      tableRef = inverter_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      frequency_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = INVERTER_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = INVERTER_CURRENT[i] + " Amp";
      }

      frequency_cells = frequency_Row.getElementsByTagName("td");
      for (let i = 0; i < frequency_cells.length; i++) {
        frequency_cells[i].innerHTML = INVERTER_FREQUENCY[i] + " Hz";
      }

      var output_table = document.getElementById("output-single");
      tableRef = output_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      freq_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = OUTPUT_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = OUTPUT_CURRENT[i] + " Amp";
      }

      freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Output_Freq + " Hz";
      }

      var rectifier_output_voltage_single = document
        .getElementById("rectifier-output-voltage-single")
        .getElementsByTagName("thead")[0]
        .rows[0].getElementsByTagName("td");
      rectifier_output_voltage_single[0].innerHTML =
        ups_data?.Charger_OUTPUT_Voltage + " Volt";

      document
        .getElementById("battery-single")
        .getElementsByTagName("tbody")[0]
        .rows[0].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Voltage + " Volt";
      document
        .getElementById("battery-single")
        .getElementsByTagName("tbody")[0]
        .rows[1].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Current + " Amp";

      if (ups_data?.Battery_Status === 0) {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[2].getElementsByTagName("td")[0].innerHTML = "OFF";
      } else if (ups_data?.Battery_Status === 1) {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[2].getElementsByTagName("td")[0].innerHTML = "CHARGING";
      } else {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[2].getElementsByTagName("td")[0].innerHTML = "DISCHARGING";
      }

      var load_table = document.getElementById("ups-totalload-single");
      tableRef = load_table.getElementsByTagName("tbody")[0];
      var kva_Row = tableRef.rows[0];
      var kw_Row = tableRef.rows[1];
      var pf_Row = tableRef.rows[2];

      var kva_cells = kva_Row.getElementsByTagName("td");

      for (let i = 0; i < kva_cells.length; i++) {
        kva_cells[i].innerHTML = LOAD_IN_KVA[i] + " KVA";
      }

      var kw_cells = kw_Row.getElementsByTagName("td");
      for (let i = 0; i < kw_cells.length; i++) {
        kw_cells[i].innerHTML = LOAD_IN_KW[i] + " KW";
      }

      var pf_cells = pf_Row.getElementsByTagName("td");
      for (let i = 0; i < pf_cells.length; i++) {
        pf_cells[i].innerHTML = POWER_FACTOR[i] + " PF";
      }
    } else if (ups_data.DATA_TYPE === 3 && ups_data.DATA_NAME === "metering") {
      /*********************** for 3 phase ******************************/

      document.getElementById("row1").classList.remove("d-none");
      document.getElementById("row2").classList.remove("d-none");
      document.getElementById("row3").classList.remove("d-none");
      document.getElementById("row4").classList.remove("d-none");
      document.getElementById("row5").classList.add("d-none");
      document.getElementById("row6").classList.add("d-none");
      document.getElementById("row7").classList.add("d-none");

      const MAIN_INPUT_Voltage = [
        ups_data?.R_Y_Phase_Input_Voltage,
        ups_data?.Y_B_Phase_Input_Voltage,
        ups_data?.B_R_Phase_Input_Voltage,
      ];
      const MAIN_INPUT_CURRENT = [
        ups_data?.R_Phase_Input_Current,
        ups_data?.Y_Phase_Input_Current,
        ups_data?.B_Phase_Input_Current,
      ];
      const ALTERNET_Voltage = [
        ups_data?.R_Phase_Bypass_Voltage,
        ups_data?.Y_Phase_Bypass_Voltage,
        ups_data?.B_Phase_Bypass_Voltage,
      ];
      const ALTERNET_CURRENT = [
        ups_data?.R_Phase_Alternate_Current,
        ups_data?.Y_Phase_Alternate_Current,
        ups_data?.B_Phase_Alternate_Current,
      ];
      const INVERTER_Voltage = [
        ups_data?.R_Phase_Inverter_Voltage,
        ups_data?.Y_Phase_Inverter_Voltage,
        ups_data?.B_Phase_Inverter_Voltage,
      ];
      const INVERTER_CURRENT = [
        ups_data?.R_Phase_Inverter_Current,
        ups_data?.Y_Phase_Inverter_Current,
        ups_data?.B_Phase_Inverter_Current,
      ];
      const INVERTER_FREQUENCY = [
        ups_data?.Inverter_Frequency,
        ups_data?.Inverter_Frequency,
        ups_data?.Inverter_Frequency,
      ];
      const OUTPUT_Voltage = [
        ups_data?.R_Phase_Output_Voltage,
        ups_data?.Y_Phase_Output_Voltage,
        ups_data?.B_Phase_Output_Voltage,
      ];
      const OUTPUT_CURRENT = [
        ups_data?.R_Phase_Output_Current,
        ups_data?.Y_Phase_Output_Current,
        ups_data?.B_Phase_Output_Current,
      ];

      const LOAD_IN_KVA_UPS = [
        ups_data?.R_Phase_UPS_Power_In_KVA,
        ups_data?.Y_Phase_UPS_Power_In_KVA,
        ups_data?.B_Phase_UPS_Power_In_KVA,
        ups_data?.Total_UPS_Power_In_KVA,
      ];
      const LOAD_IN_KW_UPS = [
        ups_data?.R_Phase_UPS_Power_In_KW,
        ups_data?.Y_Phase_UPS_Power_In_KW,
        ups_data?.B_Phase_UPS_Power_In_KW,
        ups_data?.Total_UPS_Power_In_KW,
      ];
      const POWER_FACTOR_UPS = [
        ups_data?.R_Phase_UPS_Power_Factor,
        ups_data?.Y_Phase_UPS_Power_Factor,
        ups_data?.B_Phase_UPS_Power_Factor,
        ups_data?.Total_UPS_Power_PF,
      ];

      const LOAD_IN_KVA_TOTAL_OUTPUT = [
        ups_data?.R_Phase_Output_Power_In_KVA,
        ups_data?.Y_Phase_Output_Power_In_KVA,
        ups_data?.B_Phase_Output_Power_In_KVA,
        ups_data?.Total_Output_Power_In_KVA,
      ];
      const LOAD_IN_KW_TOTAL_OUTPUT = [
        ups_data?.R_Phase_Output_Power_In_KW,
        ups_data?.Y_Phase_Output_Power_In_KW,
        ups_data?.B_Phase_Output_Power_In_KW,
        ups_data?.Total_Output_Power_In_KW,
      ];
      const POWER_FACTOR_TOTAL_OUTPUT = [
        ups_data?.R_Phase_Output_Power_Factor,
        ups_data?.Y_Phase_Output_Power_Factor,
        ups_data?.B_Phase_Output_Power_Factor,
        ups_data?.Total_Output_Power_PF,
      ];

      const BATTERY_DATA = [
        ups_data?.Battery_Voltage,
        ups_data?.Battery_Current,
        ups_data?.Battery_Status,
      ];

      var rectifier_table = document.getElementById("rectifier");
      rectifier_table
        .getElementsByTagName("thead")[0]
        .getElementsByTagName("tr")[0]
        .getElementsByTagName("td")[0].innerHTML =
        ups_data?.DC_Link_Voltage + " Volt";

      var main_table = document.getElementById("main-input");
      var tableRef = main_table.getElementsByTagName("tbody")[0];
      var voltage_Row = tableRef.rows[0];
      var current_Row = tableRef.rows[1];
      var freq_Row = tableRef.rows[2];

      var voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = MAIN_INPUT_Voltage[i] + " Volt";
      }

      var current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = MAIN_INPUT_CURRENT[i] + " Amp";
      }

      var freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Mains_Input_Freq + " Hz";
      }

      var alternate_table = document.getElementById("alternate");
      tableRef = alternate_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      freq_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = ALTERNET_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = ALTERNET_CURRENT[i] + " Amp";
      }

      freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Bypass_Freq + " Hz";
      }

      var inverter_table = document.getElementById("inverter");
      tableRef = inverter_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      frequency_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = INVERTER_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = INVERTER_CURRENT[i] + " Amp";
      }

      frequency_cells = frequency_Row.getElementsByTagName("td");
      for (let i = 0; i < frequency_cells.length; i++) {
        frequency_cells[i].innerHTML = INVERTER_FREQUENCY[i] + " Hz";
      }

      var output_table = document.getElementById("output");
      tableRef = output_table.getElementsByTagName("tbody")[0];
      voltage_Row = tableRef.rows[0];
      current_Row = tableRef.rows[1];
      freq_Row = tableRef.rows[2];

      voltage_cells = voltage_Row.getElementsByTagName("td");
      for (let i = 0; i < voltage_cells.length; i++) {
        voltage_cells[i].innerHTML = OUTPUT_Voltage[i] + " Volt";
      }

      current_cells = current_Row.getElementsByTagName("td");
      for (let i = 0; i < current_cells.length; i++) {
        current_cells[i].innerHTML = OUTPUT_CURRENT[i] + " Amp";
      }

      freq_cells = freq_Row.getElementsByTagName("td");
      for (let i = 0; i < freq_cells.length; i++) {
        freq_cells[i].innerHTML = ups_data?.Output_Freq + " Hz";
      }

      var rectifier_table = document
        .getElementById("rectifier-output-voltage-three")
        .getElementsByTagName("thead")[0]
        .rows[0].getElementsByTagName("td");
      rectifier_table[0].innerHTML = ups_data?.Charger_OUTPUT_Voltage + " Volt";

      document
        .getElementById("battery")
        .getElementsByTagName("tbody")[0]
        .rows[1].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Voltage + " Volt";
      document
        .getElementById("battery")
        .getElementsByTagName("tbody")[0]
        .rows[2].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Current + " Amp";

      if (ups_data?.Battery_Status === 0) {
        document
          .getElementById("battery")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "OFF";
      } else if (ups_data?.Battery_Status === 1) {
        document
          .getElementById("battery")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "CHARGING";
      } else {
        document
          .getElementById("battery")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "DISCHARGING";
      }

      var load_table = document.getElementById("totalload-three");
      tableRef = load_table.getElementsByTagName("tbody")[0];
      var kva_Row = tableRef.rows[0];
      var kw_Row = tableRef.rows[1];
      var pf_Row = tableRef.rows[2];

      var kva_cells = kva_Row.getElementsByTagName("td");
      for (let i = 0; i < kva_cells.length; i++) {
        kva_cells[i].innerHTML = LOAD_IN_KVA_TOTAL_OUTPUT[i] + " KVA";
      }

      var kw_cells = kw_Row.getElementsByTagName("td");
      for (let i = 0; i < kw_cells.length; i++) {
        kw_cells[i].innerHTML = LOAD_IN_KW_TOTAL_OUTPUT[i] + " KW";
      }

      var pf_cells = pf_Row.getElementsByTagName("td");
      for (let i = 0; i < pf_cells.length; i++) {
        pf_cells[i].innerHTML = POWER_FACTOR_TOTAL_OUTPUT[i] + " PF";
      }

      var load_table = document.getElementById("upsload-three");
      tableRef = load_table.getElementsByTagName("tbody")[0];
      var kva_Row = tableRef.rows[0];
      var kw_Row = tableRef.rows[1];
      var pf_Row = tableRef.rows[2];

      var kva_cells = kva_Row.getElementsByTagName("td");
      for (let i = 0; i < kva_cells.length; i++) {
        kva_cells[i].innerHTML = LOAD_IN_KVA_UPS[i] + " KVA";
      }

      var kw_cells = kw_Row.getElementsByTagName("td");
      for (let i = 0; i < kw_cells.length; i++) {
        kw_cells[i].innerHTML = LOAD_IN_KW_UPS[i] + " KW";
      }

      var pf_cells = pf_Row.getElementsByTagName("td");
      for (let i = 0; i < pf_cells.length; i++) {
        pf_cells[i].innerHTML = POWER_FACTOR_UPS[i] + " PF";
      }
    }
  };
}

function tabs() {
  isFirstTimeLoad = true;
  console.log("tab called");

  let tagName = getActiveTagName();
  changeUrlParams(tagName);
}

function getActiveTagName() {
  let hashTag = new URL(document.URL).hash;

  if (!hashTag || hashTag == "#status") tagName = "status";
  else if (hashTag == "#metering") tagName = "metering";
  else if (hashTag == "#alarmlog") tagName = "alarmlog";
  else if (hashTag == "#datalog") tagName = "datalog";

  return tagName;
}

function changeUrlParams(tabName) {
  makeTabActive(tabName);

  // to scroll to top of the page
  // setTimeout(() => {
  //   console.log("called");
  //   window.scrollTo({ top: 0 });
  // }, 5);

  if (deviceId) {
    if (tabName === "alarmlog") {
      serialNoAlarm = 0;

      var obj = {};
      obj.msg_id = 2;
      obj.dev_id = deviceId;
      var jsonString = JSON.stringify(obj);

      // Get the table body element
      const alarmTableBody = document.getElementById("alarmTableBody");
      // Clear the existing table data
      alarmTableBody.innerHTML = "";

      document.getElementsByClassName("overlay")[0].classList.remove("d-none");
      ws.send(jsonString);

      // var alaramTable = document.getElementById("alarmTable");
      // var tbody = alaramTable.getElementsByTagName("tbody")[0];
      // var rows = tbody.getElementsByTagName("tr");

      // // Remove all rows from the tbody
      // while (tbody.hasChildNodes()) {
      //   tbody.removeChild(tbody.firstChild);
      // }

      // for (var i = rows.length - 1; i >= 0; i--) {
      //   tbody.removeChild(rows[i]);
      // }
    } else if (tabName === "datalog") {
      serialNoDataLog = 0;
      var obj = {};
      obj.msg_id = 3;
      obj.dev_id = deviceId;
      var jsonString = JSON.stringify(obj);

      // Get the table body element
      const dataTableBody = document.getElementById("dataTableBody");

      // Clear the existing table data
      dataTableBody.innerHTML = "";

      document.getElementsByClassName("overlay")[0].classList.remove("d-none");
      ws.send(jsonString);

      // var dataTable = document.getElementById("dataLogTable");
      // var tbody = dataTable.getElementsByTagName("tbody")[0];
      // var rows = tbody.getElementsByTagName("tr");
      // for (var i = rows.length - 1; i >= 0; i--) {
      //   tbody.removeChild(rows[i]);
      // }
    }
  }
}

/********************** Date & Time --- start ****************/
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = "0" + dd;
}
if (mm < 10) {
  mm = "0" + mm;
}
var curr_date = dd + "/" + mm + "/" + yyyy;

setInterval(function () {
  const curr_time = new Date()
    .toTimeString()
    .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  document.getElementById("ups_time").innerHTML = curr_time;
}, 1000);
document.getElementById("ups_date").innerHTML = curr_date;
/********************** Date & Time --- end ****************/

var hashTagCss;

function makeTabActive(tagNam) {
  // this function is to remain on same page when refresh

  (hashTagCss = "show"), "active";

  document.getElementById("nav-status-tab").classList.remove("active");
  document.getElementById("nav-metering-tab").classList.remove("active");
  document.getElementById("nav-alarmlog-tab").classList.remove("active");
  document.getElementById("nav-datalog-tab").classList.remove("active");

  document.getElementById("status").classList.remove("show", "active");
  document.getElementById("metering").classList.remove("show", "active");
  document.getElementById("alarmlog").classList.remove("show", "active");
  document.getElementById("datalog").classList.remove("show", "active");

  document.getElementById("nav-" + tagNam + "-tab").classList.add("active");
  document.getElementById(tagNam).classList.add("show", "active");
}

$("a[href='#metering']").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 800);
  return false;
});
$("a[href='#alarmlog']").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 800);
  // return false;
});
$("a[href='#datalog']").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 800);
  // return false;
});
