// [
//   {
//     Alarm_Number: '003'
//     Date: '04-05-0006'
//     Time: '09:08:07'
//     Alarm_Name: 'RESERVED UI - 2'
//   },
//   {
//     Alarm_Number: '000'
//     Date: '00-00-0000'
//     Time: '01:00:00'
//     Alarm_Name: 'SC COMM. FAIL '
//   },
//   {
//     Alarm_Number: '000'
//     Date: '00-00-0000'
//     Time: '00:00:00'
//     Alarm_Name: 'SC COMM. FAIL '
//   },
  
// ]

let text = 'AAAA01" 003,04-05-0006,09:08:07,RESERVED UI - 2 000,00-00-0000,01:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 000,00-00-0000,00:00:00,SC COMM. FAIL 025,70-27-0098,60:55:29,SMPS FAIL 017,18-19-0020,23:22:21,RECT OVER TEMP 009,10-11-0012,15:14:13,RECTIFIER FAIL "5555';

// Remove 'AAAA01"' and "5555" from the text
text = text.replace(/AAAA01"|5555/g, '');

let text2 = `003,04-05-0006,09:08:07,RESERVED UI - 2 @
000,00-00-0000,01:00:00,SC COMM. FAIL  @
000,00-00-0000,00:00:00,SC COMM. FAIL`;

let arr = text2.split(' @\n').map(block => {
  let [Alarm_Number, Date, Time, ...Alarm_Name] = block.split(',');
  Alarm_Name = Alarm_Name.join(',');
  return {
    Alarm_Number,
    Date,
    Time,
    Alarm_Name
  };
});



console.log('texttt --- ',text);

console.log('arr---',arr);