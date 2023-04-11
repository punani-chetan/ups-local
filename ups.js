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


const convertToDecimal = (data) => {
    return parseInt(data, 16);
};


const singlePhaseValues = async (singlePhaseVars) => {
    let DC_Link_Voltage = singlePhaseVars.DC_Lk_Vol;
    let R_Phase_Bypass_Voltage = singlePhaseVars.R_Ph_By_Vol;
    let R_Phase_Alternate_Current = singlePhaseVars.R_Ph_Alt_Cur;
    let Bypass_Freq = singlePhaseVars.By_Freq;
    let R_Phase_Inverter_Voltage = singlePhaseVars.R_Ph_Invt_Vol;
    let R_Phase_Inverter_Current = singlePhaseVars.R_Ph_Invt_Cur;
    let Inverter_Frequency = singlePhaseVars.Inverter_Freq;
    let Battery_Voltage = singlePhaseVars.Bat_Vol;
    let Battery_Current = singlePhaseVars.Bat_Cur;
    let Battery_Status = singlePhaseVars.Bat_Stat;
    let Total_UPS_Power_In_KVA = singlePhaseVars.Tot_UPS_KVAp;
    let Total_UPS_Power_In_KW = singlePhaseVars.Tot_UPS_KWp;
    let Total_UPS_Power_PF = singlePhaseVars.Tot_UPS_pf;
    let R_Y_Phase_Input_Voltage = singlePhaseVars['RY_Ph_I/P_Vol'];
    let R_Phase_Input_Current = singlePhaseVars['R_Ph_I/P_Cur'];
    let Y_B_Phase_Input_Voltage = singlePhaseVars['YB_Ph_I/P_Vol'];
    let Y_Phase_Input_Current = singlePhaseVars['Y_Ph_I/P_Cur'];
    let B_R_Phase_Input_Voltage = singlePhaseVars['BR_Ph_I/P_Vol'];
    let B_Phase_Input_Current = singlePhaseVars['B_Ph_I/P_Cur'];
    let Mains_Input_Freq = singlePhaseVars['Mains_I/P_Freq'];
    let Charger_OUTPUT_Voltage = singlePhaseVars['Charger_O/P_Vol'];
    let R_Phase_Output_Voltage = singlePhaseVars['R_Ph_O/P_Vol'];
    let R_Phase_Output_Current = singlePhaseVars['R_Ph_O/P_Cur'];
    let Output_Freq = singlePhaseVars['O/P_Freq'];
    let Total_Output_Power_In_KVA = singlePhaseVars['Tot_O/P_KVAp'];
    let Total_Output_Power_In_KW = singlePhaseVars['Tot_O/P_KWp'];
    let Total_Output_Power_PF = singlePhaseVars['Tot_O/P_pf'];

    let singlePhaseJson = {
        R_Y_Phase_Input_Voltage: R_Y_Phase_Input_Voltage,
        R_Phase_Input_Current: R_Phase_Input_Current,
        Y_B_Phase_Input_Voltage: Y_B_Phase_Input_Voltage,
        Y_Phase_Input_Current: Y_Phase_Input_Current,
        B_R_Phase_Input_Voltage: B_R_Phase_Input_Voltage,
        B_Phase_Input_Current: B_Phase_Input_Current,
        Mains_Input_Freq: Mains_Input_Freq,
        DC_Link_Voltage: DC_Link_Voltage,
        Charger_OUTPUT_Voltage: Charger_OUTPUT_Voltage,
        R_Phase_Output_Voltage: R_Phase_Output_Voltage,
        R_Phase_Output_Current: R_Phase_Output_Current,
        Output_Freq: Output_Freq,
        R_Phase_Bypass_Voltage: R_Phase_Bypass_Voltage,
        R_Phase_Alternate_Current: R_Phase_Alternate_Current,
        Bypass_Freq: Bypass_Freq,
        R_Phase_Inverter_Voltage: R_Phase_Inverter_Voltage,
        R_Phase_Inverter_Current: R_Phase_Inverter_Current,
        Inverter_Frequency: Inverter_Frequency,
        Battery_Voltage: Battery_Voltage,
        Battery_Current: Battery_Current,
        Battery_Status: Battery_Status,
        Total_Output_Power_In_KVA: Total_Output_Power_In_KVA,
        Total_Output_Power_In_KW: Total_Output_Power_In_KW,
        Total_Output_Power_PF: Total_Output_Power_PF,
        Total_UPS_Power_In_KVA: Total_UPS_Power_In_KVA,
        Total_UPS_Power_In_KW: Total_UPS_Power_In_KW,
        Total_UPS_Power_PF: Total_UPS_Power_PF,
        DATA_TYPE: 1

        // System_Control_Card_Software_Version: convertToDecimal(
        //     System_Control_Card_Software_Version
        // ),
        // User_Interface_Card_Software_Version: convertToDecimal(
        //     User_Interface_Card_Software_Version
        // ),
        // Reserved_for_Future_Use1: convertToDecimal(Reserved_for_Future_Use1),
        // Reserved_for_Future_Use2: convertToDecimal(Reserved_for_Future_Use2),
        // Battery_Room_Temperature: convertToDecimal(Battery_Room_Temperature),
        // Traceback_bit_Read: convertToDecimal(Traceback_bit_Read),
    };

    return singlePhaseJson;
}

const threePhasevalues = async (threePhaseVars) => {

    let DC_Link_Voltage = threePhaseVars.DC_Lk_Vol;
    let R_Phase_Bypass_Voltage = threePhaseVars.R_Ph_By_Vol;
    let Y_Phase_Bypass_Voltage = threePhaseVars.Y_Ph_By_Vol;
    let B_Phase_Bypass_Voltage = threePhaseVars.B_Ph_By_Vol;
    let R_Phase_Alternate_Current = threePhaseVars.R_Ph_Alt_Cur;
    let Y_Phase_Alternate_Current = threePhaseVars.Y_Ph_Alt_Cur;
    let B_Phase_Alternate_Current = threePhaseVars.B_Ph_Alt_Cur;
    let Bypass_Freq = threePhaseVars.By_Freq;
    let R_Phase_Inverter_Voltage = threePhaseVars.R_Ph_Invt_Vol;
    let Y_Phase_Inverter_Voltage = threePhaseVars.Y_Ph_Invt_Vol;
    let B_Phase_Inverter_Voltage = threePhaseVars.B_Ph_Invt_Vol;
    let R_Phase_Inverter_Current = threePhaseVars.R_Ph_Invt_Cur;
    let Y_Phase_Inverter_Current = threePhaseVars.Y_Ph_Invt_Cur;
    let B_Phase_Inverter_Current = threePhaseVars.B_Ph_Invt_Cur;
    let Inverter_Frequency = threePhaseVars.Inverter_Freq;
    let Battery_Voltage = threePhaseVars.Bat_Vol;
    let Battery_Current = threePhaseVars.Bat_Cur;
    let Battery_Status = threePhaseVars.Bat_Stat;
    let R_Phase_UPS_Power_In_KVA = threePhaseVars.R_Ph_UPS_KVAp;
    let R_Phase_UPS_Power_In_KW = threePhaseVars.R_Ph_UPS_KWp;
    let R_Phase_UPS_Power_Factor = threePhaseVars.R_Ph_UPS_pf;
    let Y_Phase_UPS_Power_In_KVA = threePhaseVars.Y_Ph_UPS_KVAp;
    let Y_Phase_UPS_Power_In_KW = threePhaseVars.Y_Ph_UPS_KWp;
    let Y_Phase_UPS_Power_Factor = threePhaseVars.Y_Ph_UPS_pf;
    let B_Phase_UPS_Power_In_KVA = threePhaseVars.B_Ph_UPS_KVAp;
    let B_Phase_UPS_Power_In_KW = threePhaseVars.B_Ph_UPS_KWp;
    let B_Phase_UPS_Power_Factor = threePhaseVars.B_Ph_UPS_pf;
    let Total_UPS_Power_In_KVA = threePhaseVars.Tot_UPS_KVAp;
    let Total_UPS_Power_In_KW = threePhaseVars.Tot_UPS_KWp;
    let Total_UPS_Power_PF = threePhaseVars.Tot_UPS_pf;

    let R_Y_Phase_Input_Voltage = threePhaseVars['RY_Ph_I/P_Vol'];
    let R_Phase_Input_Current = threePhaseVars['R_Ph_I/P_Cur'];
    let Y_B_Phase_Input_Voltage = threePhaseVars['YB_Ph_I/P_Vol'];
    let Y_Phase_Input_Current = threePhaseVars['Y_Ph_I/P_Cur'];
    let B_R_Phase_Input_Voltage = threePhaseVars['BR_Ph_I/P_Vol'];
    let B_Phase_Input_Current = threePhaseVars['B_Ph_I/P_Cur'];
    let Mains_Input_Freq = threePhaseVars['Mains_I/P_Freq'];
    let Charger_OUTPUT_Voltage = threePhaseVars['Charger_O/P_Vol'];
    let R_Phase_Output_Voltage = threePhaseVars['R_Ph_O/P_Vol'];
    let R_Phase_Output_Current = threePhaseVars['R_Ph_O/P_Cur'];
    let Output_Freq = threePhaseVars['O/P_Freq'];
    let Total_Output_Power_In_KVA = threePhaseVars['Tot_O/P_KVAp'];
    let Total_Output_Power_In_KW = threePhaseVars['Tot_O/P_KWp'];
    let Total_Output_Power_PF = threePhaseVars['Tot_O/P_pf'];
    let Y_Phase_Output_Voltage = threePhaseVars['Y_Ph_O/P_Vol'];
    let B_Phase_Output_Voltage = threePhaseVars['B_Ph_O/P_Vol'];
    let Y_Phase_Output_Current = threePhaseVars['Y_Ph_O/P_Cur'];
    let B_Phase_Output_Current = threePhaseVars['B_Ph_O/P_Cur'];
    let R_Phase_Output_Power_In_KVA = threePhaseVars['R_Ph_O/P_KVAp'];
    let R_Phase_Output_Power_In_KW = threePhaseVars['R_Ph_O/P_KWp'];
    let R_Phase_Output_Power_Factor = threePhaseVars['R_Ph_O/P_pf'];
    let Y_Phase_Output_Power_In_KVA = threePhaseVars['Y_Ph_O/P_KVAp'];
    let Y_Phase_Output_Power_In_KW = threePhaseVars['Y_Ph_O/P_KWp'];
    let Y_Phase_Output_Power_Factor = threePhaseVars['Y_Ph_O/P_pf'];
    let B_Phase_Output_Power_In_KVA = threePhaseVars['B_Ph_O/P_KVAp'];
    let B_Phase_Output_Power_In_KW = threePhaseVars['B_Ph_O/P_KWp'];
    let B_Phase_Output_Power_Factor = threePhaseVars['B_Ph_O/P_pf'];



    let threePhaseJson = {
        R_Y_Phase_Input_Voltage: R_Y_Phase_Input_Voltage,
        R_Phase_Input_Current: R_Phase_Input_Current,
        Y_B_Phase_Input_Voltage: Y_B_Phase_Input_Voltage,
        Y_Phase_Input_Current: Y_Phase_Input_Current,
        B_R_Phase_Input_Voltage: B_R_Phase_Input_Voltage,
        B_Phase_Input_Current: B_Phase_Input_Current,
        Mains_Input_Freq: Mains_Input_Freq,
        DC_Link_Voltage: DC_Link_Voltage,
        Charger_OUTPUT_Voltage: Charger_OUTPUT_Voltage,
        R_Phase_Output_Voltage: R_Phase_Output_Voltage,
        Y_Phase_Output_Voltage: Y_Phase_Output_Voltage,
        B_Phase_Output_Voltage: B_Phase_Output_Voltage,
        R_Phase_Output_Current: R_Phase_Output_Current,
        Y_Phase_Output_Current: Y_Phase_Output_Current,
        B_Phase_Output_Current: B_Phase_Output_Current,
        Output_Freq: Output_Freq,
        R_Phase_Bypass_Voltage: R_Phase_Bypass_Voltage,
        Y_Phase_Bypass_Voltage: Y_Phase_Bypass_Voltage,
        B_Phase_Bypass_Voltage: B_Phase_Bypass_Voltage,
        R_Phase_Alternate_Current: R_Phase_Alternate_Current,
        Y_Phase_Alternate_Current: Y_Phase_Alternate_Current,
        B_Phase_Alternate_Current: B_Phase_Alternate_Current,
        Bypass_Freq: Bypass_Freq,
        R_Phase_Inverter_Voltage: R_Phase_Inverter_Voltage,
        Y_Phase_Inverter_Voltage: Y_Phase_Inverter_Voltage,
        B_Phase_Inverter_Voltage: B_Phase_Inverter_Voltage,
        R_Phase_Inverter_Current: R_Phase_Inverter_Current,
        Y_Phase_Inverter_Current: Y_Phase_Inverter_Current,
        B_Phase_Inverter_Current: B_Phase_Inverter_Current,
        Inverter_Frequency: Inverter_Frequency,
        Battery_Voltage: Battery_Voltage,
        Battery_Current: Battery_Current,
        Battery_Status: Battery_Status,
        R_Phase_Output_Power_In_KVA: R_Phase_Output_Power_In_KVA,
        R_Phase_Output_Power_In_KW: R_Phase_Output_Power_In_KW,
        R_Phase_Output_Power_Factor: R_Phase_Output_Power_Factor,
        Y_Phase_Output_Power_In_KVA: Y_Phase_Output_Power_In_KVA,
        Y_Phase_Output_Power_In_KW: Y_Phase_Output_Power_In_KW,
        Y_Phase_Output_Power_Factor: Y_Phase_Output_Power_Factor,
        B_Phase_Output_Power_In_KVA: B_Phase_Output_Power_In_KVA,
        B_Phase_Output_Power_In_KW: B_Phase_Output_Power_In_KW,
        B_Phase_Output_Power_Factor: B_Phase_Output_Power_Factor,
        Total_Output_Power_In_KVA: Total_Output_Power_In_KVA,
        Total_Output_Power_In_KW: Total_Output_Power_In_KW,
        Total_Output_Power_PF: Total_Output_Power_PF,
        R_Phase_UPS_Power_In_KVA: R_Phase_UPS_Power_In_KVA,
        R_Phase_UPS_Power_In_KW: R_Phase_UPS_Power_In_KW,
        R_Phase_UPS_Power_Factor: R_Phase_UPS_Power_Factor,
        Y_Phase_UPS_Power_In_KVA: Y_Phase_UPS_Power_In_KVA,
        Y_Phase_UPS_Power_In_KW: Y_Phase_UPS_Power_In_KW,
        Y_Phase_UPS_Power_Factor: Y_Phase_UPS_Power_Factor,
        B_Phase_UPS_Power_In_KVA: B_Phase_UPS_Power_In_KVA,
        B_Phase_UPS_Power_In_KW: B_Phase_UPS_Power_In_KW,
        B_Phase_UPS_Power_Factor: B_Phase_UPS_Power_Factor,
        Total_UPS_Power_In_KVA: Total_UPS_Power_In_KVA,
        Total_UPS_Power_In_KW: Total_UPS_Power_In_KW,
        Total_UPS_Power_PF: Total_UPS_Power_PF,
        DATA_TYPE: 3
        // System_Control_Card_Software_Version: convertToDecimal(
        //     System_Control_Card_Software_Version
        // ),
        // User_Interface_Card_Software_Version: convertToDecimal(
        //     User_Interface_Card_Software_Version
        // ),
        // Reserved_for_Future_Use1: convertToDecimal(Reserved_for_Future_Use1),
        // Reserved_for_Future_Use2: convertToDecimal(Reserved_for_Future_Use2),
        // Battery_Room_Temperature: convertToDecimal(Battery_Room_Temperature),
        // Traceback_bit_Read: convertToDecimal(Traceback_bit_Read),
    };

    return threePhaseJson;
}

const UPS_MSG = async (payload) => {
    let parsedPayload = JSON.parse(payload);

    // console.log('parsedPayload');
    // console.log(parsedPayload);
    let jsonValues = {};
    if (parsedPayload.ph_type == 1) {
        // single phase
        jsonValues = await singlePhaseValues(parsedPayload.properties);
    }
    else if (parsedPayload.ph_type == 0) {
        // three phase
        jsonValues = await threePhasevalues(parsedPayload.properties);
    }
    return jsonValues;

    // return false;

    // let allTransistersString = splitPayload[1];
    // if (allTransistersString) {
    //     let json = {};
    //     let allTransistersArray = allTransistersString.split(",");
    //     // let alarmNotificationTransiter = allTransistersArray.slice(0, 12);
    //     let remainingTransisters = allTransistersArray.slice(12);
    //     // let alarmJson = await mapAlarmData(alarmNotificationTransiter);
    //     let thermisterValues = await getthermistervalues(remainingTransisters);
    //     json = { ...alarmJson, ...thermisterValues };
    //     return json;
    //     //console.log(json);
    //     // ! Use this JSON for frontend represenataion
    // }
};