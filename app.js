
connect();

let text = "'AAAA01' 003,04-05-0006,09:08:07,RESERVED UI - 2@\n000,00-00-0000,01:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n025,70-27-0098,60:55:29,SMPS FAIL@\n017,18-19-0020,23:22:21,RECT OVER TEMP@\n009,10-11-0012,15:14:13,RECTIFIER FAIL'5555'"

// Remove 'AAAA01' and '5555' from the text
text = text.replace(/'AAAA01'\s|\s'5555'/g, '')

// Split the text into an array of alarms
const alarms = text.split('@\n')

// Convert the array of alarms into an array of objects
const arr = alarms.map(alarm => {
  const [Alarm_Number, Date, Time, Alarm_Name] = alarm.split(',')
  return {
    Alarm_Number,
    Date,
    Time,
    Alarm_Name
  }
})

// Create the HTML table
// const table = document.createElement('table')

// Create the table header
// const headerRow = table.insertRow()
// const headers = ['Alarm Number', 'Date', 'Time', 'Alarm Name']
// headers.forEach(header => {
//   const th = document.createElement('th')
//   th.textContent = header
//   headerRow.appendChild(th)
// })

// // Add the table data
// arr.forEach(alarm => {
//   const row = table.insertRow()
//   Object.values(alarm).forEach(val => {
//     const cell = row.insertCell()
//     cell.textContent = val
//   })
// })

// // Add the table to the HTML document
// document.body.appendChild(table)

// // Create the CSV file
// let csv = headers.join(',') + '\n'
// arr.forEach(alarm => {
//   csv += Object.values(alarm).join(',') + '\n'
// })

// // Download the CSV file
// const downloadLink = document.createElement('a')
// downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
// downloadLink.download = 'alarms.csv'
// document.body.appendChild(downloadLink)
// downloadLink.click()



// // Parse the text into an array
// let text = "'AAAA01'003,04-05-0006,09:08:07,RESERVED UI - 2 @\n000,00-00-0000,01:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n000,00-00-0000,00:00:00,SC COMM. FAIL@\n025,70-27-0098,60:55:29,SMPS FAIL@\n017,18-19-0020,23:22:21,RECT OVER TEMP@\n009,10-11-0012,15:14:13,RECTIFIER FAIL'5555'";
// // Remove 'AAAA01' and '5555' from text
// text = text.replace(/'AAAA01'|'5555'/g, '')

// // Split text into lines
// let lines = text.split('\n')

// // Create array of objects
// let arr = lines.map(line => {
//   let parts = line.split(',')
//   return {
//     Alarm_Number: parts[0],
//     Date: parts[1],
//     Time: parts[2],
//     Alarm_Name: parts[3]
//   }
// })


// Create a table in HTML
const tableBody = document.querySelector('#alarm-table tbody');
for (const item of arr) {
  const row = document.createElement('tr');
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

// Create a link to download the data in CSV format
let csvData = 'data:text/csv;charset=utf-8,';
arr.forEach(function(row) {
  csvData += row.Alarm_Number + ',' + row.Date + ',' + row.Time + ',' + row.Alarm_Name + '\n';
});
let encodedUri = encodeURI(csvData);
let link = document.createElement('a');
link.setAttribute('href', encodedUri);
link.setAttribute('download', 'data.csv');
link.innerHTML = 'Download CSV';
document.body.appendChild(link);

// Add the table to the page
document.getElementById('table-container').innerHTML = table;


function connect() {
  var url = 'ws://localhost:8080';
  var ws = new WebSocket(url);

  ws.onopen = function () {
    ws.send('Status WS Started');
    console.log("Web socket is connected");


    ws.onclose = function (event) {
      console.log("WebSocket is closed now.");
      connect();
    };
  };

  ws.onmessage = async function (evt) {
    // console.log('event Data in index --------------------------', evt.data);
   
    var ups_data = await UPS_MSG(evt.data);

    console.log("ups_data in index");
    console.log(ups_data);

    var obj = new Object();
    obj.msg_id = 2;
    obj.dev_id  = ups_data.dev_id;
    var jsonString = JSON.stringify(obj);

    ws.send(jsonString);

    // if (ups_data.DATA_TYPE === 1) {
    //   document.getElementById('iframeMeteringHeight').style.height = '150vh';
    // } else {
    //   document.getElementById('iframeMeteringHeight').style.height = '200vh';
    // }
    // return false;

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






(function () {
  let hashTag = new URL(document.URL).hash;
  let tagName;
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
  else if (hashTag == '#eventlog') tagName = 'eventlog';
  else if (hashTag == '#datalog') tagName = 'datalog';
  changeUrlParams(tagName)
})();

function changeUrlParams(tabName) {
  makeTabActive(tabName);
  // if (tabName === 'status') connect();
}

function showTab(tabName) {
  changeUrlParams('metering');

  let iframeName = tabName + 'Iframe';
  // document.getElementById('meteringIframe').innerHTML = '<iframe src="metering.html" id="meteringIframe" name="metering" title="Metering" width="100%" style="height: 115vh;" allowfullscreen></iframe>';

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

function makeTabActive(tagName) {
  // this function is to remain on same page when refresh

  hashTagCss = 'show', 'active';

  document.getElementById('nav-status-tab').classList.remove('active');
  document.getElementById('nav-metering-tab').classList.remove('active');
  document.getElementById('nav-eventlog-tab').classList.remove('active');
  document.getElementById('nav-datalog-tab').classList.remove('active');

  document.getElementById('status').classList.remove('show', 'active');
  document.getElementById('metering').classList.remove('show', 'active');
  document.getElementById('eventlog').classList.remove('show', 'active');
  document.getElementById('datalog').classList.remove('show', 'active');

  document.getElementById('nav-' + tagName + '-tab').classList.add('active');
  document.getElementById(tagName).classList.add('show', 'active');
}





















// const ws = require('ws');

// const socketIo = require('socket.io');
// const io = socketIo(server);
// const socket = require('./socket')(io);

// const port = 9001;
// process.env.PORT for production
// server.listen(port, () => console.log('server started on ' + port));

// const wss = new ws.Server({ server });

// wss.on('connection', (ws) => {

//   //connection is up, let's add a simple simple event
//   ws.on('message', (message) => {

//       //log the received message and send it back to the client
//      // console.log('received: %s', message);
//       ws.send(`${message}`);
//   });
// });