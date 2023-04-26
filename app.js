let socket = null;
let retryInterval = 1000; // initial retry interval
connect();
var deviceId;
var tagName;
var sentMsgAlarm = true;
var sentMsgData = true;



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

  var url = 'ws://ups-gateway:80/ws';
  // var url = 'ws://localhost:8080';
  var ws = new WebSocket(url);
  let serialNoAlarm = 0;
  let serialNoDataLog = 0;

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
    retryInterval = 1000;
    // ws.onclose = function (event) {
    //   console.log("WebSocket is closed now.");

    //   // attempt to reconnect
    //   setTimeout(function () {
    //     console.log('Attempting to reconnect...');
    //     connect();
    //     retryInterval *= 2; // exponential backoff
    //   }, retryInterval);
    // };
  };

  ws.onclose = function (event) {
    console.log("WebSocket is closed now.");

    // attempt to reconnect
    setTimeout(function () {
      console.log('Attempting to reconnect...');
      connect();
      retryInterval *= 2; // exponential backoff
      console.log(retryInterval);
    }, retryInterval);
  };




  ws.onmessage = async function (evt) {

    var ups_data = await UPS_MSG(evt.data);

    console.log("ups_data in index");
    console.log(ups_data);

    deviceId = ups_data.dev_id;

    if (ups_data) { tabs(); }

    if (deviceId) {
      // console.log(deviceId)
      if (tagName === 'alarmlog') {
        // console.log('in alarmlog')
        var obj = {};
        obj.msg_id = 2;
        obj.dev_id = deviceId;
        var jsonString = JSON.stringify(obj);
        // if (sentMsgAlarm) {
        ws.send(jsonString);
        // sentMsgAlarm = false;
        // }
      }
      else if (tagName === 'datalog') {
        // console.log('in datalog')
        var obj = {};
        obj.msg_id = 3;
        obj.dev_id = deviceId;
        var jsonString = JSON.stringify(obj);
        // if (sentMsgData) {
        ws.send(jsonString);
        // sentMsgData = false;
        // }
      }
    }

    if (!deviceId) {

      // Remove 'AAAA01' and '5555' from the text
      let compareTxtStr = ups_data.payload.substring(1, 7);
      console.log('compareTxtStr => ', compareTxtStr)
      if (compareTxtStr === 'AAAA02') {
        text = ups_data.payload.replace(/'AAAA02'/g, '');
        text = text.replace(/'5555'/g, '');

        // Split the text into an array of alarms
        const alarms = text.split('@ \n');

        console.log(alarms)

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
        for (const item of arr) {
          const row = document.createElement('tr');
          const cell0 = document.createElement('td');
          cell0.textContent = ++serialNoAlarm;
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

        // Convert the array of alarms into an array of objects
        let arr = alarms.map(alarm => {
          let tmpSplitArr = alarm.split(',');
          // console.log('tmpSplitArr')
          // console.log(tmpSplitArr)
          return tmpSplitArr;
        });

        // console.log(arr[0])

        let tmpArrNew = arr[0].slice(0, -1);
        let chunk_size = 88;
        let num_chunks = Math.ceil(tmpArrNew.length / chunk_size);

        const tableBody = document.querySelector('#data-log-table tbody');


        // for (let i = 0; i < num_chunks; i++) {
        //   let start_index;
        //   if (i > 0) { start_index = i * (chunk_size + 6); }
        //   else { start_index = i * chunk_size; }
        //   let end_index = start_index + chunk_size;
        //   let chunk = tmpArrNew.slice(start_index, end_index);
        //   // console.log('chunk')
        //   // console.log(chunk)
        //   if (chunk.length) {
        //     let rowi = document.createElement('tr');
        //     let celli = document.createElement('td');
        //     celli.textContent = ++serialNoDataLog;
        //     rowi.appendChild(celli);

        //     for (let j = 0; j < chunk.length; j++) {
        //       let index_in_original_array = start_index + j;

        //       let cellj = document.createElement('td');
        //       cellj.textContent = tmpArrNew[index_in_original_array];
        //       rowi.appendChild(cellj);
        //     }
        //     tableBody.appendChild(rowi);
        //   }
        // }


        for (let i = 0; i < num_chunks; i++) {
          let start_index = i * chunk_size;
          let end_index = start_index + chunk_size;
          let chunk = tmpArrNew.slice(start_index, end_index);

          console.log('chunk')
          console.log(chunk)

          let rowi = document.createElement('tr');
          let celli = document.createElement('td');
          celli.textContent = ++serialNoDataLog;
          rowi.appendChild(celli);

          for (let j = 0; j < chunk.length; j++) {
            let index_in_original_array = start_index + j;

            let cellj = document.createElement('td');
            cellj.textContent = tmpArrNew[index_in_original_array];
            rowi.appendChild(cellj);
          }
          tableBody.appendChild(rowi);
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

// (function() {
//   setInterval(() => {
//     window.scrollTo({ top: 0 });
//   }, 100);
// })();


function tabs() {
  let hashTag = new URL(document.URL).hash;
  // let tagName;
  if (!hashTag || hashTag == '#status') {
    tagName = 'status';

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
}

function showTab(tabName) {
  changeUrlParams('metering');
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
