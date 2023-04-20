
connect();
var deviceId;
var tagName;
// let text = "'AAAA01' 003,04-05-0006,09:08:07,RESERVED UI - 2@\n000,00-00-0000,01:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n025,70-27-0098,60:55:29,SMPS FAIL@\n017,18-19-0020,23:22:21,RECT OVER TEMP@\n009,10-11-0012,15:14:13,RECTIFIER FAIL'5555'";

// // Remove 'AAAA01' and '5555' from the text
// text = text.replace(/'AAAA01'\s|\s'5555'/g, '');

// // Split the text into an array of alarms
// const alarms = text.split('@\n');

// // Convert the array of alarms into an array of objects
// const arr = alarms.map(alarm => {
//   const [Alarm_Number, Date, Time, Alarm_Name] = alarm.split(',');
//   return {
//     Alarm_Number,
//     Date,
//     Time,
//     Alarm_Name
//   }
// })


// // Create a table in HTML
// const tableBody = document.querySelector('#alarm-table tbody');
// let i = 0;
// for (const item of arr) {
//   const row = document.createElement('tr');
//   const cell0 = document.createElement('td');
//   cell0.textContent = ++i;
//   row.appendChild(cell0);
//   const cell1 = document.createElement('td');
//   cell1.textContent = item.Alarm_Number;
//   row.appendChild(cell1);
//   const cell2 = document.createElement('td');
//   cell2.textContent = item.Date;
//   row.appendChild(cell2);
//   const cell3 = document.createElement('td');
//   cell3.textContent = item.Time;
//   row.appendChild(cell3);
//   const cell4 = document.createElement('td');
//   cell4.textContent = item.Alarm_Name;
//   row.appendChild(cell4);
//   tableBody.appendChild(row);
// }

function exportToCSV(tableId) {

  // Variable to store the final csv data
  var csv_data = [];

  // Get each row data
  var rows = document.getElementById(tableId).getElementsByTagName('tr');

  for (var i = 0; i < rows.length; i++) {

    // Get each column data
    var cols = rows[i].querySelectorAll('td,th');

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
  csv_data = csv_data.join('\n');

  // Call this function to download csv file
  downloadCSVFile(csv_data);

}

function downloadCSVFile(csv_data) {

  // Create CSV file object and feed
  // our csv_data into it
  CSVFile = new Blob([csv_data], {
    type: "text/csv"
  });

  // Create to temporary link to initiate
  // download process
  var temp_link = document.createElement('a');

  // Download csv file
  temp_link.download = "alarmlog.csv";
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
  console.log('in connect')

  var url = 'ws://localhost:8080';
  var ws = new WebSocket(url);

  window.addEventListener("online", function () {
    console.log("I am connected to the internet");
    console.log('navigator.onLine ==> ', navigator.onLine)
    if (navigator.onLine) {
      connect();
    }
  })

  ws.onopen = function () {
    ws.send('Status WS Started');
    console.log("Web socket is connected");

    ws.onclose = function (event) {
      console.log("WebSocket is closed now.");
      setInterval(() => {
        connect();
      }, 500);
    };
  };

  ws.onmessage = async function (evt) {

    var ups_data = await UPS_MSG(evt.data);

    console.log("ups_data in index");
    console.log(ups_data);

    deviceId = ups_data.dev_id;

    if (ups_data) { tabs(); }

    if (deviceId) {
      console.log(deviceId)
      if (tagName === 'alarmlog') {
        // console.log('in alarmlog')
        var obj = {};
        obj.msg_id = 2;
        obj.dev_id = deviceId;
        var jsonString = JSON.stringify(obj);
        ws.send(jsonString);
      }
      else if (tagName === 'datalog') {
        // console.log('in datalog')
        var obj = {};
        obj.msg_id = 3;
        obj.dev_id = deviceId;
        var jsonString = JSON.stringify(obj);
        ws.send(jsonString);
      }
    }



    if (!deviceId) {

      // Remove 'AAAA01' and '5555' from the text
      let compareTxtStr = ups_data.payload.substring(1, 7);

      if (compareTxtStr === 'AAAA02') {
        text = ups_data.payload.replace(/'AAAA02'/g, '');
        text = text.replace(/'5555'/g, '');

        // Split the text into an array of alarms
        const alarms = text.split('@\n');
        // Convert the array of alarms into an array of objects
        const arr = alarms.map(alarm => {
          const [Alarm_Number, Date, Time, Alarm_Name] = alarm.split(',');
          return {
            Alarm_Number,
            Date,
            Time,
            Alarm_Name
          }
        });

        // Create a table in HTML
        const tableBody = document.querySelector('#alarm-table tbody');
        let i = 0;
        for (const item of arr) {
          const row = document.createElement('tr');
          const cell0 = document.createElement('td');
          cell0.textContent = ++i;
          row.appendChild(cell0);
          const cell1 = document.createElement('td');
          cell1.textContent = item.Alarm_Number;
          row.appendChild(cell1);
          const cell2 = document.createElement('td');
          cell2.textContent = item.Date;
          row.appendChild(cell2);
          const cell3 = document.createElement('td');
          cell3.textContent = item.Time;
          row.appendChild(cell3);
          const cell4 = document.createElement('td');
          cell4.textContent = item.Alarm_Name;
          row.appendChild(cell4);
          tableBody.appendChild(row);
        }
      } else if (compareTxtStr === 'AAAA03') {

        text = ups_data.payload.replace(/'AAAA03'/g, '');
        text = text.replace(/'5555'/g, '');

        // Split the text into an array of alarms
        let alarms = text.split('\n');

        // console.log(alarms)

        // Convert the array of alarms into an array of objects
        let arr = alarms.map(alarm => {
          let tmpSplitArr = alarm.split(',');

          let [
            Date,
            Time,
            UI_Alarm,
            Rectifier_Alarm1,
            Rectifier_Alarm2,
            Inverter_Alarm1,
            Inverter_Alarm2,
            Battery_Alarm1,
            Inverter_Alarm3,
            Can_Alarm1,
            Input_Alarm_0,
            Rectifier_Status1,
            Inverter_Status1,
            Battery_Status1,
            R_Y_Phase_Input_Voltage,
            R_Phase_Input_Current,
            Y_B_Phase_Input_Voltage,
            Y_Phase_Input_Current,
            B_R_Phase_Input_Voltage,
            B_Phase_Input_Current,
            Mains_Input_Freq,
            DC_Link_Voltage,
            Charger_O_P_Voltage,
            R_Phase_Output_Voltage,
            Y_Phase_Output_Voltage,
            B_Phase_Output_Voltage,
            R_Phase_Output_Current,
            Y_Phase_Output_Current,
            B_Phase_Output_Current,
            Output_Freq,
            R_Phase_Bypass_Voltage,
            Y_Phase_Bypass_Voltage,
            B_Phase_Bypass_Voltage,
            R_Phase_Alternate_Current,
            Y_Phase_Alternate_Current,
            B_Phase_Alternate_Current,
            Bypass_Freq,
            R_Phase_Inverter_Voltage,
            Y_Phase_Inverter_Voltage,
            B_Phase_Inverter_Voltage,
            R_Phase_Inverter_Current,
            Y_Phase_Inverter_Current,
            B_Phase_Inverter_Current,
            Inverter_Frequency,
            Battery_Voltage,
            Battery_Current,
            Battery_Status,
            R_Phase_Output_Power_KVA,
            R_Phase_Output_Power_KW,
            R_Phase_Output_Power_Factor,
            Y_Phase_Output_Power_KVA,
            Y_Phase_Output_Power_KW,
            Y_Phase_Output_Power_Factor,
            B_Phase_Output_Power_KVA,
            B_Phase_Output_Power_KW,
            B_Phase_Output_Power_Factor,
            Total_Output_Power_KVA,
            Total_Output_Power_KW,
            Total_Output_Power_PF,
            R_Phase_UPS_Power_KVA,
            R_Phase_UPS_Power_KW,
            R_Phase_UPS_Power_Factor,
            Y_Phase_UPS_Power_KVA,
            Y_Phase_UPS_Power_KW,
            Y_Phase_UPS_Power_Factor,
            B_Phase_UPS_Power_KVA,
            B_Phase_UPS_Power_KW,
            B_Phase_UPS_Power_Factor,
            Total_UPS_Power_KVA,
            Total_UPS_Power_KW,
            Total_UPS_Power_PF,
            System_Control_Card_Software_Version,
            User_Interface_Card_Software_Version,
            Total_Number_of_Faults_Store_in_UPS,
            Current_Fault_Store_Location_in_UPS,
            Battery_Room_Temperature,
            Traceback_bit_Read,
            Battery_Backup_AH_BMS_Module,
            Battery_Backup_Time_BMS_Module,
            Battery_Life_Discharge_Cycle,
            Battery_Life_In_Month,
            UPS_Model
          ] = tmpSplitArr;

          return {
            Date,
            Time,
            UI_Alarm,
            Rectifier_Alarm1,
            Rectifier_Alarm2,
            Inverter_Alarm1,
            Inverter_Alarm2,
            Battery_Alarm1,
            Inverter_Alarm3,
            Can_Alarm1,
            Input_Alarm_0,
            Rectifier_Status1,
            Inverter_Status1,
            Battery_Status1,
            R_Y_Phase_Input_Voltage,
            R_Phase_Input_Current,
            Y_B_Phase_Input_Voltage,
            Y_Phase_Input_Current,
            B_R_Phase_Input_Voltage,
            B_Phase_Input_Current,
            Mains_Input_Freq,
            DC_Link_Voltage,
            Charger_O_P_Voltage,
            R_Phase_Output_Voltage,
            Y_Phase_Output_Voltage,
            B_Phase_Output_Voltage,
            R_Phase_Output_Current,
            Y_Phase_Output_Current,
            B_Phase_Output_Current,
            Output_Freq,
            R_Phase_Bypass_Voltage,
            Y_Phase_Bypass_Voltage,
            B_Phase_Bypass_Voltage,
            R_Phase_Alternate_Current,
            Y_Phase_Alternate_Current,
            B_Phase_Alternate_Current,
            Bypass_Freq,
            R_Phase_Inverter_Voltage,
            Y_Phase_Inverter_Voltage,
            B_Phase_Inverter_Voltage,
            R_Phase_Inverter_Current,
            Y_Phase_Inverter_Current,
            B_Phase_Inverter_Current,
            Inverter_Frequency,
            Battery_Voltage,
            Battery_Current,
            Battery_Status,
            R_Phase_Output_Power_KVA,
            R_Phase_Output_Power_KW,
            R_Phase_Output_Power_Factor,
            Y_Phase_Output_Power_KVA,
            Y_Phase_Output_Power_KW,
            Y_Phase_Output_Power_Factor,
            B_Phase_Output_Power_KVA,
            B_Phase_Output_Power_KW,
            B_Phase_Output_Power_Factor,
            Total_Output_Power_KVA,
            Total_Output_Power_KW,
            Total_Output_Power_PF,
            R_Phase_UPS_Power_KVA,
            R_Phase_UPS_Power_KW,
            R_Phase_UPS_Power_Factor,
            Y_Phase_UPS_Power_KVA,
            Y_Phase_UPS_Power_KW,
            Y_Phase_UPS_Power_Factor,
            B_Phase_UPS_Power_KVA,
            B_Phase_UPS_Power_KW,
            B_Phase_UPS_Power_Factor,
            Total_UPS_Power_KVA,
            Total_UPS_Power_KW,
            Total_UPS_Power_PF,
            System_Control_Card_Software_Version,
            User_Interface_Card_Software_Version,
            Total_Number_of_Faults_Store_in_UPS,
            Current_Fault_Store_Location_in_UPS,
            Battery_Room_Temperature,
            Traceback_bit_Read,
            Battery_Backup_AH_BMS_Module,
            Battery_Backup_Time_BMS_Module,
            Battery_Life_Discharge_Cycle,
            Battery_Life_In_Month,
            UPS_Model
          }
        });

        // console.log(arr[0])

        // Create a table in HTML
        const tableBody = document.querySelector('#data-log-table tbody');
        let i = 0;
        for (let item of arr) {
          console.log(item[0]);
          console.log(item[1]);
          const row = document.createElement('tr');
          const cell0 = document.createElement('td');
          cell0.textContent = ++i;
          row.appendChild(cell0);
          const cell1 = document.createElement('td');
          cell1.textContent = item.Date;
          row.appendChild(cell1);
          const cell2 = document.createElement('td');
          cell2.textContent = item.Time;
          row.appendChild(cell2);
          const cell3 = document.createElement('td');
          cell3.textContent = item.UI_Alarm;
          row.appendChild(cell3);
          const cell4 = document.createElement('td');
          cell4.textContent = item.Rectifier_Alarm1;
          row.appendChild(cell4);
          const cell5 = document.createElement('td');
          cell5.textContent = item.Rectifier_Alarm2;
          row.appendChild(cell5);
          const cell6 = document.createElement('td');
          cell6.textContent = item.Inverter_Alarm1;
          row.appendChild(cell6);
          const cell7 = document.createElement('td');
          cell7.textContent = item.Inverter_Alarm2;
          row.appendChild(cell7);
          const cell8 = document.createElement('td');
          cell8.textContent = item.Battery_Alarm1;
          row.appendChild(cell8);
          const cell9 = document.createElement('td');
          cell9.textContent = item.Inverter_Alarm3;
          row.appendChild(cell9);
          const cell10 = document.createElement('td');
          cell10.textContent = item.Can_Alarm1;
          row.appendChild(cell10);
          const cell11 = document.createElement('td');
          cell11.textContent = item.Input_Alarm_0;
          row.appendChild(cell11);
          const cell12 = document.createElement('td');
          cell12.textContent = item.Rectifier_Status1;
          row.appendChild(cell12);
          const cell13 = document.createElement('td');
          cell13.textContent = item.Inverter_Status1;
          row.appendChild(cell13);
          const cell14 = document.createElement('td');
          cell14.textContent = item.Battery_Status1;
          row.appendChild(cell14);
          const cell15 = document.createElement('td');
          cell15.textContent = item.R_Y_Phase_Input_Voltage;
          row.appendChild(cell15);
          const cell16 = document.createElement('td');
          cell16.textContent = item.R_Phase_Input_Current;
          row.appendChild(cell16);
          const cell17 = document.createElement('td');
          cell17.textContent = item.Y_B_Phase_Input_Voltage;
          row.appendChild(cell17);
          const cell18 = document.createElement('td');
          cell18.textContent = item.Y_Phase_Input_Current;
          row.appendChild(cell18);
          const cell19 = document.createElement('td');
          cell19.textContent = item.B_R_Phase_Input_Voltage;
          row.appendChild(cell19);
          const cell20 = document.createElement('td');
          cell20.textContent = item.B_Phase_Input_Current;
          row.appendChild(cell20);
          const cell21 = document.createElement('td');
          cell21.textContent = item.Mains_Input_Freq;
          row.appendChild(cell21);
          const cell22 = document.createElement('td');
          cell22.textContent = item.DC_Link_Voltage;
          row.appendChild(cell22);
          const cell23 = document.createElement('td');
          cell23.textContent = item.Charger_O_P_Voltage;
          row.appendChild(cell23);
          const cell24 = document.createElement('td');
          cell24.textContent = item.R_Phase_Output_Voltage;
          row.appendChild(cell24);
          const cell25 = document.createElement('td');
          cell25.textContent = item.Y_Phase_Output_Voltage;
          row.appendChild(cell25);
          const cell26 = document.createElement('td');
          cell26.textContent = item.B_Phase_Output_Voltage;
          row.appendChild(cell26);
          const cell27 = document.createElement('td');
          cell27.textContent = item.R_Phase_Output_Current;
          row.appendChild(cell27);
          const cell28 = document.createElement('td');
          cell28.textContent = item.Y_Phase_Output_Current;
          row.appendChild(cell28);
          const cell29 = document.createElement('td');
          cell29.textContent = item.B_Phase_Output_Current;
          row.appendChild(cell29);
          const cell30 = document.createElement('td');
          cell30.textContent = item.Output_Freq;
          row.appendChild(cell30);
          const cell31 = document.createElement('td');
          cell31.textContent = item.R_Phase_Bypass_Voltage;
          row.appendChild(cell31);
          const cell32 = document.createElement('td');
          cell32.textContent = item.Y_Phase_Bypass_Voltage;
          row.appendChild(cell32);
          const cell33 = document.createElement('td');
          cell33.textContent = item.B_Phase_Bypass_Voltage;
          row.appendChild(cell33);
          const cell34 = document.createElement('td');
          cell34.textContent = item.R_Phase_Alternate_Current;
          row.appendChild(cell34);
          const cell35 = document.createElement('td');
          cell35.textContent = item.Y_Phase_Alternate_Current;
          row.appendChild(cell35);
          const cell36 = document.createElement('td');
          cell36.textContent = item.B_Phase_Alternate_Current;
          row.appendChild(cell36);
          const cell37 = document.createElement('td');
          cell37.textContent = item.Bypass_Freq;
          row.appendChild(cell37);
          const cell38 = document.createElement('td');
          cell38.textContent = item.R_Phase_Inverter_Voltage;
          row.appendChild(cell38);
          const cell39 = document.createElement('td');
          cell39.textContent = item.Y_Phase_Inverter_Voltage;
          row.appendChild(cell39);
          const cell40 = document.createElement('td');
          cell40.textContent = item.B_Phase_Inverter_Voltage;
          row.appendChild(cell40);
          const cell41 = document.createElement('td');
          cell41.textContent = item.R_Phase_Inverter_Current;
          row.appendChild(cell41);
          const cell42 = document.createElement('td');
          cell42.textContent = item.Y_Phase_Inverter_Current;
          row.appendChild(cell42);
          const cell43 = document.createElement('td');
          cell43.textContent = item.B_Phase_Inverter_Current;
          row.appendChild(cell43);
          const cell44 = document.createElement('td');
          cell44.textContent = item.Battery_Voltage;
          row.appendChild(cell44);
          const cell45 = document.createElement('td');
          cell45.textContent = item.Battery_Current;
          row.appendChild(cell45);
          const cell46 = document.createElement('td');
          cell46.textContent = item.Battery_Status;
          row.appendChild(cell46);
          const cell47 = document.createElement('td');
          cell47.textContent = item.R_Phase_Output_Power_KVA;
          row.appendChild(cell47);
          const cell48 = document.createElement('td');
          cell48.textContent = item.R_Phase_Output_Power_KW;
          row.appendChild(cell48);
          const cell49 = document.createElement('td');
          cell49.textContent = item.R_Phase_Output_Power_Factor;
          row.appendChild(cell49);
          const cell50 = document.createElement('td');
          cell50.textContent = item.Y_Phase_Output_Power_KVA;
          row.appendChild(cell50);
          const cell51 = document.createElement('td');
          cell51.textContent = item.Y_Phase_Output_Power_KW;
          row.appendChild(cell51);
          const cell52 = document.createElement('td');
          cell52.textContent = item.Y_Phase_Output_Power_Factor;
          row.appendChild(cell52);
          const cell53 = document.createElement('td');
          cell53.textContent = item.B_Phase_Output_Power_KVA;
          row.appendChild(cell53);
          const cell54 = document.createElement('td');
          cell54.textContent = item.B_Phase_Output_Power_KW;
          row.appendChild(cell54);
          const cell55 = document.createElement('td');
          cell55.textContent = item.B_Phase_Output_Power_Factor;
          row.appendChild(cell55);
          const cell56 = document.createElement('td');
          cell56.textContent = item.Total_Output_Power_KVA;
          row.appendChild(cell56);
          const cell57 = document.createElement('td');
          cell57.textContent = item.Total_Output_Power_KW;
          row.appendChild(cell57);
          const cell58 = document.createElement('td');
          cell58.textContent = item.Total_Output_Power_PF;
          row.appendChild(cell58);
          const cell59 = document.createElement('td');
          cell59.textContent = item.R_Phase_UPS_Power_KVA;
          row.appendChild(cell59);
          const cell60 = document.createElement('td');
          cell60.textContent = item.R_Phase_UPS_Power_KW;
          row.appendChild(cell60);
          const cell61 = document.createElement('td');
          cell61.textContent = item.R_Phase_UPS_Power_Factor;
          row.appendChild(cell61);
          const cell62 = document.createElement('td');
          cell62.textContent = item.Y_Phase_UPS_Power_KVA;
          row.appendChild(cell62);
          const cell63 = document.createElement('td');
          cell63.textContent = item.Y_Phase_UPS_Power_KW;
          row.appendChild(cell63);
          const cell64 = document.createElement('td');
          cell64.textContent = item.Y_Phase_UPS_Power_Factor;
          row.appendChild(cell64);
          const cell65 = document.createElement('td');
          cell65.textContent = item.B_Phase_UPS_Power_KVA;
          row.appendChild(cell65);
          const cell67 = document.createElement('td');
          cell67.textContent = item.B_Phase_UPS_Power_KW;
          row.appendChild(cell67);
          const cell68 = document.createElement('td');
          cell68.textContent = item.B_Phase_UPS_Power_Factor;
          row.appendChild(cell68);
          const cell69 = document.createElement('td');
          cell69.textContent = item.Total_UPS_Power_KVA;
          row.appendChild(cell69);
          const cell70 = document.createElement('td');
          cell70.textContent = item.Total_UPS_Power_KW;
          row.appendChild(cell70);
          const cell71 = document.createElement('td');
          cell71.textContent = item.Total_UPS_Power_PF;
          row.appendChild(cell71);
          const cell72 = document.createElement('td');
          cell72.textContent = item.System_Control_Card_Software_Version;
          row.appendChild(cell72);
          const cell73 = document.createElement('td');
          cell73.textContent = item.User_Interface_Card_Software_Version;
          row.appendChild(cell73);
          const cell74 = document.createElement('td');
          cell74.textContent = item.Total_Number_of_Faults_Store_in_UPS;
          row.appendChild(cell74);
          const cell75 = document.createElement('td');
          cell75.textContent = item.Current_Fault_Store_Location_in_UPS;
          row.appendChild(cell75);
          const cell76 = document.createElement('td');
          cell76.textContent = item.Battery_Room_Temperature;
          row.appendChild(cell76);
          const cell77 = document.createElement('td');
          cell77.textContent = item.Traceback_bit_Read;
          row.appendChild(cell77);
          const cell78 = document.createElement('td');
          cell78.textContent = item.Battery_Backup_AH_BMS_Module;
          row.appendChild(cell78);
          const cell79 = document.createElement('td');
          cell79.textContent = item.Battery_Backup_Time_BMS_Module;
          row.appendChild(cell79);
          const cell80 = document.createElement('td');
          cell80.textContent = item.Battery_Life_Discharge_Cycle;
          row.appendChild(cell80);
          const cell81 = document.createElement('td');
          cell81.textContent = item.Battery_Life_In_Month;
          row.appendChild(cell81);
          const cell82 = document.createElement('td');
          cell82.textContent = item.UPS_Model;
          row.appendChild(cell82);

          tableBody.appendChild(row);
        }
      }
    }

    /******************** status code ******************/
    let titleStr;
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

    // console.log('data name ---', ups_data.DATA_NAME)
    if (ups_data.DATA_NAME === 'status') {
      titleStr = (ups_data.DATA_TYPE === 1) ? 'i4ET (1-PHASE UPS)' : 'i6ET (3-PHASE UPS)';
      document.getElementById('titleStr').innerText = titleStr;

      /******************** bypass input **************************/

      if (Inverter_Alarm1.BIT_2 === 1 || Inverter_Alarm1.BIT_3 === 1) {
        Bypass_Input_text = 'Out of Range';
        Bypass_Input_text_class = 'blinking-red';
      } else if (Inverter_Status1.BIT_6 === 0) {
        Bypass_Input_text = 'Absent';
        Bypass_Input_text_class = 'dot-red';
      } else if (Inverter_Status1.BIT_6 === 1) {
        Bypass_Input_text = 'Within range';
        Bypass_Input_text_class = 'dot-green';
      }

      document.getElementById('bypass_input_css').classList.remove(...document.getElementById('bypass_input_css').classList);
      document.getElementById('bypass_input_css').classList.add(Bypass_Input_text_class);
      document.getElementById('bypass_input_css_text').innerText = Bypass_Input_text;

      /******************** bypass input **************************/


      /******************** main supply **************************/

      if (Rectifier_Alarm1.BIT_6 === 1) {
        mainsupply_Input_text = 'Absent';
        mainsupply_Input_text_class = 'dot-gray';
      } else if (Rectifier_Alarm1.BIT_2 === 1 || Rectifier_Alarm1.BIT_3 === 1) {
        mainsupply_Input_text = 'Out of Range';
        mainsupply_Input_text_class = 'blinking-green';
      } else if (Rectifier_Alarm1.BIT_6 === 0) {
        mainsupply_Input_text = 'Within range';
        mainsupply_Input_text_class = 'dot-green';
      }

      document.getElementById('mainsupply_input_css').classList.remove(...document.getElementById('mainsupply_input_css').classList);
      document.getElementById('mainsupply_input_css').classList.add(mainsupply_Input_text_class);
      document.getElementById('mainsupply_input_css_text').innerText = mainsupply_Input_text;
      /************************* main supply *****************************/


      /******************** rectifier operation **************************/

      if (Rectifier_Alarm1.BIT_0 === 1) {
        rectifier_Input_text = 'Trip';
        rectifier_Input_text_class = 'blinking-red';
      } else if (Rectifier_Status1.BIT_1 === 0) {
        rectifier_Input_text = 'OFF';
        rectifier_Input_text_class = 'dot-gray';
      } else if (Rectifier_Status1.BIT_1 === 1) {
        rectifier_Input_text = 'ON';
        rectifier_Input_text_class = 'dot-green';
      }

      document.getElementById('rectifier_input_css').classList.remove(...document.getElementById('rectifier_input_css').classList);
      document.getElementById('rectifier_input_css').classList.add(rectifier_Input_text_class);
      document.getElementById('rectifier_input_css_text').innerText = rectifier_Input_text;
      /******************** rectifier operation **************************/


      /******************** booster operation **************************/
      if (Battery_Alarm1.BIT_5 === 1) {
        battery_Input_text = 'Trip';
        battery_Input_text_class = 'blinking-red';
      } else if (Battery_Status1.BIT_2 === 0) {
        battery_Input_text = 'OFF';
        battery_Input_text_class = 'dot-gray';
      } else if (Battery_Status1.BIT_2 === 1) {
        battery_Input_text = 'ON';
        battery_Input_text_class = 'dot-red';
      }

      document.getElementById('battery_input_css').classList.remove(...document.getElementById('battery_input_css').classList);
      document.getElementById('battery_input_css').classList.add(battery_Input_text_class);
      document.getElementById('battery_input_css_text').innerText = battery_Input_text;
      /******************** booster operation **************************/

      /******************** charger operation **************************/
      if (Battery_Status1.BIT_3 === 1) {
        battery_charging_Input_text = 'Trip';
        battery_charging_Input_text_class = 'blinking-red';
      } else if (Battery_Status1.BIT_6 === 1) {
        battery_charging_Input_text = 'Boost charge';
        battery_charging_Input_text_class = 'dot-red';
      } else if (Battery_Status1.BIT_5 === 1) {
        battery_charging_Input_text = 'Float Charge';
        battery_charging_Input_text_class = 'dot-green';
      } else if (Battery_Status1.BIT_1 === 0) {
        battery_charging_Input_text = 'OFF';
        battery_charging_Input_text_class = 'dot-gray';
      }

      document.getElementById('battery_charging_input_css').classList.remove(...document.getElementById('battery_charging_input_css').classList);
      document.getElementById('battery_charging_input_css').classList.add(battery_charging_Input_text_class);
      document.getElementById('battery_charging_input_css_text').innerText = battery_charging_Input_text;
      /******************** charger operation **************************/

      /******************** inverter operation **************************/
      if (Inverter_Alarm1.BIT_6 === 1) {
        inverter_Input_text = 'Trip';
        inverter_Input_text_class = 'blinking-red';
      } else if (Inverter_Status1.BIT_0 === 0) {
        inverter_Input_text = 'OFF';
        inverter_Input_text_class = 'dot-red';
      } else if (Inverter_Status1.BIT_0 === 1) {
        inverter_Input_text = 'ON';
        inverter_Input_text_class = 'dot-green';
      }

      document.getElementById('inverter_input_css').classList.remove(...document.getElementById('inverter_input_css').classList);
      document.getElementById('inverter_input_css').classList.add(inverter_Input_text_class);
      document.getElementById('inverter_input_css_text').innerText = inverter_Input_text;
      /******************** inverter operation **************************/

      /******************** load on inverter operation **************************/
      if (Inverter_Status1.BIT_4 === 1) {
        load_inverter_Input_text = 'Inverter SSW ON';
        load_inverter_Input_text_class = 'dot-green';
      } else if (Inverter_Status1.BIT_4 === 0) {
        load_inverter_Input_text = 'Inverter SSW OFF';
        load_inverter_Input_text_class = 'dot-gray';
      }

      document.getElementById('load_inverter_input_css').classList.remove(...document.getElementById('load_inverter_input_css').classList);
      document.getElementById('load_inverter_input_css').classList.add(load_inverter_Input_text_class);
      document.getElementById('load_inverter_input_css_text').innerText = load_inverter_Input_text;
      /******************** load on inverter operation **************************/

      /******************** load on bypass operation **************************/
      if (Inverter_Status1.BIT_3 === 1) {
        load_bypass_Input_text = 'Bypass SSW ON';
        load_bypass_Input_text_class = 'dot-red';
      } else if (Inverter_Status1.BIT_3 === 0) {
        load_bypass_Input_text = 'Bypass SSW OFF';
        load_bypass_Input_text_class = 'dot-gray';
      }

      document.getElementById('load_bypass_input_css').classList.remove(...document.getElementById('load_bypass_input_css').classList);
      document.getElementById('load_bypass_input_css').classList.add(load_bypass_Input_text_class);
      document.getElementById('load_bypass_input_css_text').innerText = load_bypass_Input_text;
      /******************** load on bypass operation **************************/


      /******************** synchronization **************************/
      if (Inverter_Status1.BIT_8 === 1) {
        synchronization_Input_text = 'Sync';
        synchronization_Input_text_class = 'dot-yellow';
      } else if (Inverter_Status1.BIT_8 === 0) {
        synchronization_Input_text = 'No sync';
        synchronization_Input_text_class = 'blinking-yellow';
      }

      document.getElementById('synchronization_input_css').classList.remove(...document.getElementById('synchronization_input_css').classList);
      document.getElementById('synchronization_input_css').classList.add(synchronization_Input_text_class);
      document.getElementById('synchronization_input_css_text').innerText = synchronization_Input_text;
      /******************** synchronization **************************/

      /******************** battery mccb status  **************************/
      if (UI_Alarm.BIT_5 === 1) {
        battery_mccb_Input_text = 'Battery MCCB is OFF';
        battery_mccb_Input_text_class = 'blinking-red';
      } else if (UI_Alarm.BIT_5 === 0) {
        battery_mccb_Input_text = 'Battery MCCB is ON';
        battery_mccb_Input_text_class = 'dot-green';
      }

      document.getElementById('battery_mccb_input_css').classList.remove(...document.getElementById('battery_mccb_input_css').classList);
      document.getElementById('battery_mccb_input_css').classList.add(battery_mccb_Input_text_class);
      document.getElementById('battery_mccb_input_css_text').innerText = battery_mccb_Input_text;
      /******************** battery mccb status **************************/


      /******************** common alarm indication  **************************/
      if (UI_Alarm.BIT_0 === 0 && UI_Alarm.BIT_1 === 0 && UI_Alarm.BIT_2 === 0 && UI_Alarm.BIT_3 === 0 && UI_Alarm.BIT_4 === 0 && UI_Alarm.BIT_5 === 0 && UI_Alarm.BIT_6 === 0 && UI_Alarm.BIT_7 === 0 && UI_Alarm.BIT_8 === 0 && UI_Alarm.BIT_9 === 0 && UI_Alarm.BIT_10 === 0 && UI_Alarm.BIT_11 === 0 && UI_Alarm.BIT_12 === 0 && UI_Alarm.BIT_13 === 0 && UI_Alarm.BIT_14 === 0 && UI_Alarm.BIT_15 === 0 && Rectifier_Alarm1.BIT_0 === 0 && Rectifier_Alarm1.BIT_1 === 0 && Rectifier_Alarm1.BIT_2 === 0 && Rectifier_Alarm1.BIT_3 === 0 && Rectifier_Alarm1.BIT_4 === 0 && Rectifier_Alarm1.BIT_5 === 0 && Rectifier_Alarm1.BIT_6 === 0 && Rectifier_Alarm1.BIT_7 === 0 && Rectifier_Alarm1.BIT_8 === 0 && Rectifier_Alarm1.BIT_9 === 0 && Rectifier_Alarm1.BIT_10 === 0 && Rectifier_Alarm1.BIT_11 === 0 && Rectifier_Alarm1.BIT_12 === 0 && Rectifier_Alarm1.BIT_13 === 0 && Rectifier_Alarm1.BIT_14 === 0 && Rectifier_Alarm1.BIT_15 === 0 && Rectifier_Alarm2.BIT_0 === 0 && Rectifier_Alarm2.BIT_1 === 0 && Rectifier_Alarm2.BIT_2 === 0 && Rectifier_Alarm2.BIT_3 === 0 && Rectifier_Alarm2.BIT_4 === 0 && Rectifier_Alarm2.BIT_5 === 0 && Rectifier_Alarm2.BIT_6 === 0 && Rectifier_Alarm2.BIT_7 === 0 && Rectifier_Alarm2.BIT_8 === 0 && Rectifier_Alarm2.BIT_9 === 0 && Rectifier_Alarm2.BIT_10 === 0 && Rectifier_Alarm2.BIT_11 === 0 && Rectifier_Alarm2.BIT_12 === 0 && Rectifier_Alarm2.BIT_13 === 0 && Rectifier_Alarm2.BIT_14 === 0 && Rectifier_Alarm2.BIT_15 === 0 && Inverter_Alarm1.BIT_0 === 0 && Inverter_Alarm1.BIT_1 === 0 && Inverter_Alarm1.BIT_2 === 0 && Inverter_Alarm1.BIT_3 === 0 && Inverter_Alarm1.BIT_4 === 0 && Inverter_Alarm1.BIT_5 === 0 && Inverter_Alarm1.BIT_6 === 0 && Inverter_Alarm1.BIT_7 === 0 && Inverter_Alarm1.BIT_8 === 0 && Inverter_Alarm1.BIT_9 === 0 && Inverter_Alarm1.BIT_10 === 0 && Inverter_Alarm1.BIT_11 === 0 && Inverter_Alarm1.BIT_12 === 0 && Inverter_Alarm1.BIT_13 === 0 && Inverter_Alarm1.BIT_14 === 0 && Inverter_Alarm1.BIT_15 === 0 && Inverter_Alarm2.BIT_0 === 0 && Inverter_Alarm2.BIT_1 === 0 && Inverter_Alarm2.BIT_2 === 0 && Inverter_Alarm2.BIT_3 === 0 && Inverter_Alarm2.BIT_4 === 0 && Inverter_Alarm2.BIT_5 === 0 && Inverter_Alarm2.BIT_6 === 0 && Inverter_Alarm2.BIT_7 === 0 && Inverter_Alarm2.BIT_8 === 0 && Inverter_Alarm2.BIT_9 === 0 && Inverter_Alarm2.BIT_10 === 0 && Inverter_Alarm2.BIT_11 === 0 && Inverter_Alarm2.BIT_12 === 0 && Inverter_Alarm2.BIT_13 === 0 && Inverter_Alarm2.BIT_14 === 0 && Inverter_Alarm2.BIT_15 === 0 && Battery_Alarm1.BIT_0 === 0 && Battery_Alarm1.BIT_1 === 0 && Battery_Alarm1.BIT_2 === 0 && Battery_Alarm1.BIT_3 === 0 && Battery_Alarm1.BIT_4 === 0 && Battery_Alarm1.BIT_5 === 0 && Battery_Alarm1.BIT_6 === 0 && Battery_Alarm1.BIT_7 === 0 && Battery_Alarm1.BIT_8 === 0 && Battery_Alarm1.BIT_9 === 0 && Battery_Alarm1.BIT_10 === 0 && Battery_Alarm1.BIT_11 === 0 && Battery_Alarm1.BIT_12 === 0 && Battery_Alarm1.BIT_13 === 0 && Battery_Alarm1.BIT_14 === 0 && Battery_Alarm1.BIT_15 === 0 && Inverter_Alarm3.BIT_0 === 0 && Inverter_Alarm3.BIT_1 === 0 && Inverter_Alarm3.BIT_2 === 0 && Inverter_Alarm3.BIT_3 === 0 && Inverter_Alarm3.BIT_4 === 0 && Inverter_Alarm3.BIT_5 === 0 && Inverter_Alarm3.BIT_6 === 0 && Inverter_Alarm3.BIT_7 === 0 && Inverter_Alarm3.BIT_8 === 0 && Inverter_Alarm3.BIT_9 === 0 && Inverter_Alarm3.BIT_10 === 0 && Inverter_Alarm3.BIT_11 === 0 && Inverter_Alarm3.BIT_12 === 0 && Inverter_Alarm3.BIT_13 === 0 && Inverter_Alarm3.BIT_14 === 0 && Inverter_Alarm3.BIT_15 === 0 && Input_Alarm_0.BIT_0 === 0 && Input_Alarm_0.BIT_1 === 0 && Input_Alarm_0.BIT_2 === 0 && Input_Alarm_0.BIT_3 === 0 && Input_Alarm_0.BIT_4 === 0 && Input_Alarm_0.BIT_5 === 0 && Input_Alarm_0.BIT_6 === 0 && Input_Alarm_0.BIT_7 === 0 && Input_Alarm_0.BIT_8 === 0 && Input_Alarm_0.BIT_9 === 0 && Input_Alarm_0.BIT_10 === 0 && Input_Alarm_0.BIT_11 === 0 && Input_Alarm_0.BIT_12 === 0 && Input_Alarm_0.BIT_13 === 0 && Input_Alarm_0.BIT_14 === 0 && Input_Alarm_0.BIT_15 === 0 && Can_Alarm1.BIT_0 === 0 && Can_Alarm1.BIT_1 === 0 && Can_Alarm1.BIT_2 === 0 && Can_Alarm1.BIT_3 === 0 && Can_Alarm1.BIT_4 === 0 && Can_Alarm1.BIT_5 === 0 && Can_Alarm1.BIT_6 === 0 && Can_Alarm1.BIT_7 === 0 && Can_Alarm1.BIT_8 === 0 && Can_Alarm1.BIT_9 === 0 && Can_Alarm1.BIT_10 === 0 && Can_Alarm1.BIT_11 === 0 && Can_Alarm1.BIT_12 === 0 && Can_Alarm1.BIT_13 === 0 && Can_Alarm1.BIT_14 === 0 && Can_Alarm1.BIT_15 === 0) {
        common_alarm_Input_text = 'No Alarm';
        common_alarm_Input_text_class = 'dot-gray';
      } else {
        common_alarm_Input_text = 'Any alarm present';
        common_alarm_Input_text_class = 'blinking-red';
      }

      document.getElementById('common_alarm_input_css').classList.remove(...document.getElementById('common_alarm_input_css').classList);
      document.getElementById('common_alarm_input_css').classList.add(common_alarm_Input_text_class);
      document.getElementById('common_alarm_input_css_text').innerText = common_alarm_Input_text;
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

      // console.log(ups_data?.DC_Link_Voltage + ' Volt');

      var rectifier_table = document.getElementById("rectifier-single");
      // console.log(rectifier_table.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0].getElementsByTagName('td'));
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

      var battery_table = document
        .getElementById("battery-single")
        .getElementsByTagName("tbody")[0]
        .rows[0].getElementsByTagName("td");
      battery_table[0].innerHTML = ups_data?.Charger_OUTPUT_Voltage + " Volt";
      document
        .getElementById("battery-single")
        .getElementsByTagName("tbody")[0]
        .rows[1].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Voltage + " Volt";
      document
        .getElementById("battery-single")
        .getElementsByTagName("tbody")[0]
        .rows[2].getElementsByTagName("td")[0].innerHTML =
        ups_data?.Battery_Current + " Amp";

      if (ups_data?.Battery_Status === 0) {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "OFF";
      } else if (ups_data?.Battery_Status === 1) {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "CHARGING";
      } else {
        document
          .getElementById("battery-single")
          .getElementsByTagName("tbody")[0]
          .rows[3].getElementsByTagName("td")[0].innerHTML = "DISCHARGING";
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
    } else if (
      ups_data.DATA_TYPE === 3 &&
      ups_data.DATA_NAME === "metering"
    ) {
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

      var battery_table = document
        .getElementById("battery")
        .getElementsByTagName("tbody")[0]
        .rows[0].getElementsByTagName("td");
      battery_table[0].innerHTML = ups_data?.Charger_OUTPUT_Voltage + " Volt";
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

      var load_table = document.getElementById("ups-totalload");
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
    }


  }
}


// (function () {

window.addEventListener("load", (event) => {
  console.log("page is fully loaded");
  tabs();
});

function tabs() {
  let hashTag = new URL(document.URL).hash;
  // let tagName;
  if (!hashTag || hashTag == '#status') {
    tagName = 'status';
    setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 1000);
  }
  else if (hashTag == '#metering') {
    tagName = 'metering';
    showTab(tagName);
  }
  else if (hashTag == '#alarmlog') tagName = 'alarmlog';
  else if (hashTag == '#datalog') tagName = 'datalog';
  changeUrlParams(tagName)
}

// })();

function changeUrlParams(tabName) {
  makeTabActive(tabName);

  // if (deviceId) {
  //   var url = 'ws://localhost:8080';
  //   var ws = new WebSocket(url);
  //   console.log(deviceId)
  //   if (tabName === 'alarmlog') {
  //     // console.log('in alarmlog')
  //     var obj = {};
  //     obj.msg_id = 2;
  //     obj.dev_id = deviceId;
  //     var jsonString = JSON.stringify(obj);
  //     ws.send(jsonString);
  //   }
  //   else if (tabName === 'datalog') {
  //     // console.log('in datalog')
  //     var obj = {};
  //     obj.msg_id = 3;
  //     obj.dev_id = deviceId;
  //     var jsonString = JSON.stringify(obj);
  //     ws.send(jsonString);
  //   }
  // }
}

function showTab(tabName) {
  changeUrlParams('metering');

  setTimeout(() => {
    window.scrollTo({ top: 0 });
  }, 100);
}


/********************** Date & Time --- start ****************/
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}
if (mm < 10) {
  mm = '0' + mm;
}
var curr_date = dd + '/' + mm + '/' + yyyy;

setInterval(function () {
  const curr_time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  document.getElementById('ups_time').innerHTML = curr_time;
}, 1000);
document.getElementById('ups_date').innerHTML = curr_date;
/********************** Date & Time --- end ****************/

var hashTagValue;
var hashTagCss;

function makeTabActive(tagNam) {
  // this function is to remain on same page when refresh

  hashTagCss = 'show', 'active';

  document.getElementById('nav-status-tab').classList.remove('active');
  document.getElementById('nav-metering-tab').classList.remove('active');
  document.getElementById('nav-alarmlog-tab').classList.remove('active');
  document.getElementById('nav-datalog-tab').classList.remove('active');

  document.getElementById('status').classList.remove('show', 'active');
  document.getElementById('metering').classList.remove('show', 'active');
  document.getElementById('alarmlog').classList.remove('show', 'active');
  document.getElementById('datalog').classList.remove('show', 'active');

  document.getElementById('nav-' + tagNam + '-tab').classList.add('active');
  document.getElementById(tagNam).classList.add('show', 'active');
}
