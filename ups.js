const getthermistervalues = async (remainingTransisters) => {
    let [
        // R_Y_Phase_Input_Voltage,
        //R_Phase_Input_Current,
        // Y_B_Phase_Input_Voltage,
        // Y_Phase_Input_Current,
        // B_R_Phase_Input_Voltage,
        // B_Phase_Input_Current,
        // Mains_Input_Freq,
        DC_Lk_Vol, //DC_Link_Voltage,
        // Charger_OUTPUT_Voltage,
        // R_Phase_Output_Voltage,
        // Y_Phase_Output_Voltage,
        // B_Phase_Output_Voltage,
        // R_Phase_Output_Current,
        // Y_Phase_Output_Current,
        // B_Phase_Output_Current,
        // Output_Freq,
        R_Ph_By_Vol, //R_Phase_Bypass_Voltage,
        Y_Ph_By_Vol, //Y_Phase_Bypass_Voltage,
        B_Ph_By_Vol, //B_Phase_Bypass_Voltage,
        R_Ph_Alt_Cur, //R_Phase_Alternate_Current,
        Y_Ph_Alt_Cur, //Y_Phase_Alternate_Current,
        B_Ph_Alt_Cur, //B_Phase_Alternate_Current,
        By_Freq, //Bypass_Freq,
        R_Ph_Invt_Vol, //R_Phase_Inverter_Voltage,
        Y_Ph_Invt_Vol, //Y_Phase_Inverter_Voltage,
        B_Ph_Invt_Vol, //B_Phase_Inverter_Voltage,
        R_Ph_Invt_Cur, //R_Phase_Inverter_Current,
        Y_Ph_Invt_Cur, //Y_Phase_Inverter_Current,
        B_Ph_Invt_Cur, //B_Phase_Inverter_Current,
        Inverter_Freq, //Inverter_Frequency,
        Bat_Vol, //Battery_Voltage,
        Bat_Cur, //Battery_Current,
        Bat_Stat, //Battery_Status,
        // R_Phase_Output_Power_In_KVA,
        // R_Phase_Output_Power_In_KW,
        // R_Phase_Output_Power_Factor,
        // Y_Phase_Output_Power_In_KVA,
        // Y_Phase_Output_Power_In_KW,
        // Y_Phase_Output_Power_Factor,
        // B_Phase_Output_Power_In_KVA,
        // B_Phase_Output_Power_In_KW,
        // B_Phase_Output_Power_Factor,
        // Total_Output_Power_In_KVA,
        // Total_Output_Power_In_KW,
        // Total_Output_Power_PF,
        R_Ph_UPS_KVAp, //R_Phase_UPS_Power_In_KVA,
        R_Ph_UPS_KWp, //R_Phase_UPS_Power_In_KW,
        R_Ph_UPS_pf, //R_Phase_UPS_Power_Factor,
        Y_Ph_UPS_KVAp, //Y_Phase_UPS_Power_In_KVA,
        Y_Ph_UPS_KWp, //Y_Phase_UPS_Power_In_KW,
        Y_Ph_UPS_pf, //Y_Phase_UPS_Power_Factor,
        B_Ph_UPS_KVAp, //B_Phase_UPS_Power_In_KVA,
        B_Ph_UPS_KWp, //B_Phase_UPS_Power_In_KW,
        B_Ph_UPS_pf, //B_Phase_UPS_Power_Factor,
        Tot_UPS_KVAp, //Total_UPS_Power_In_KVA,
        Tot_UPS_KWp, //Total_UPS_Power_In_KW,
        Tot_UPS_pf, //Total_UPS_Power_PF,
        // System_Control_Card_Software_Version,
        // User_Interface_Card_Software_Version,
        // Reserved_for_Future_Use1,
        // Reserved_for_Future_Use2,
        // Battery_Room_Temperature,
        // Traceback_bit_Read,
    ] = remainingTransisters;

    let R_Y_Phase_Input_Voltage = remainingTransisters.RY_Ph_I / P_Vol;
    let R_Phase_Input_Current = remainingTransisters.R_Ph_I / P_Cur;
    let Y_B_Phase_Input_Voltage = remainingTransisters.YB_Ph_I / P_Vol;
    let Y_Phase_Input_Current = remainingTransisters.Y_Ph_I / P_Cur;
    let B_R_Phase_Input_Voltage = remainingTransisters.BR_Ph_I / P_Vol;
    let B_Phase_Input_Current = remainingTransisters.B_Ph_I / P_Cur;
    let Mains_Input_Freq = remainingTransisters.Mains_I / P_Freq;
    let Charger_OUTPUT_Voltage = remainingTransisters.Charger_O / P_Vol;
    let R_Phase_Output_Voltage = remainingTransisters.R_Ph_O / P_Vol;
    let R_Phase_Output_Current = remainingTransisters.R_Ph_O / P_Cur;
    let Output_Freq = remainingTransisters.O / P_Freq;
    let Total_Output_Power_In_KVA = remainingTransisters.Tot_O / P_KVAp;
    let Total_Output_Power_In_KW = remainingTransisters.Tot_O / P_KWp;
    let Total_Output_Power_PF = remainingTransisters.Tot_O / P_pf;
    let Y_Phase_Output_Voltage = remainingTransisters.Y_Ph_O / P_Vol;
    let B_Phase_Output_Voltage = remainingTransisters.B_Ph_O / P_Vol;
    let Y_Phase_Output_Current = remainingTransisters.Y_Ph_O / P_Cur;
    let B_Phase_Output_Current = remainingTransisters.B_Ph_O / P_Cur;
    let R_Phase_Output_Power_In_KVA = remainingTransisters.R_Ph_O / P_KVAp;
    let R_Phase_Output_Power_In_KW = remainingTransisters.R_Ph_O / P_KWp;
    let R_Phase_Output_Power_Factor = remainingTransisters.R_Ph_O / P_pf;
    let Y_Phase_Output_Power_In_KVA = remainingTransisters.Y_Ph_O / P_KVAp;
    let Y_Phase_Output_Power_In_KW = remainingTransisters.Y_Ph_O / P_KWp;
    let Y_Phase_Output_Power_Factor = remainingTransisters.Y_Ph_O / P_pf;
    let B_Phase_Output_Power_In_KVA = remainingTransisters.B_Ph_O / P_KVAp;
    let B_Phase_Output_Power_In_KW = remainingTransisters.B_Ph_O / P_KWp;
    let B_Phase_Output_Power_Factor = remainingTransisters.B_Ph_O / P_pf;



    let transisterJson = {
        R_Y_Phase_Input_Voltage: R_Y_Phase_Input_Voltage,
        R_Phase_Input_Current: R_Phase_Input_Current,
        Y_B_Phase_Input_Voltage: Y_B_Phase_Input_Voltage,
        Y_Phase_Input_Current: Y_Phase_Input_Current,
        B_R_Phase_Input_Voltage: B_R_Phase_Input_Voltage,
        B_Phase_Input_Current: B_Phase_Input_Current,
        Mains_Input_Freq: Mains_Input_Freq,
        DC_Link_Voltage: DC_Lk_Vol,
        Charger_OUTPUT_Voltage: Charger_OUTPUT_Voltage,
        R_Phase_Output_Voltage: R_Phase_Output_Voltage,
        Y_Phase_Output_Voltage: Y_Phase_Output_Voltage,
        B_Phase_Output_Voltage: B_Phase_Output_Voltage,
        R_Phase_Output_Current: R_Phase_Output_Current,
        Y_Phase_Output_Current: Y_Phase_Output_Current,
        B_Phase_Output_Current: B_Phase_Output_Current,
        Output_Freq: Output_Freq,
        R_Phase_Bypass_Voltage: R_Ph_By_Vol,
        Y_Phase_Bypass_Voltage: Y_Ph_By_Vol,
        B_Phase_Bypass_Voltage: B_Ph_By_Vol,
        R_Phase_Alternate_Current: R_Ph_Alt_Cur,
        Y_Phase_Alternate_Current: Y_Ph_Alt_Cur,
        B_Phase_Alternate_Current: B_Ph_Alt_Cur,
        Bypass_Freq: By_Freq,
        R_Phase_Inverter_Voltage: R_Ph_Invt_Vol,
        Y_Phase_Inverter_Voltage: Y_Ph_Invt_Vol,
        B_Phase_Inverter_Voltage: B_Ph_Invt_Vol,
        R_Phase_Inverter_Current: R_Ph_Invt_Cur,
        Y_Phase_Inverter_Current: Y_Ph_Invt_Cur,
        B_Phase_Inverter_Current: B_Ph_Invt_Cur,
        Inverter_Frequency: Inverter_Freq,
        Battery_Voltage: Bat_Vol,
        Battery_Current: Bat_Cur,
        Battery_Status: Bat_Stat,
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
        R_Phase_UPS_Power_In_KVA: R_Ph_UPS_KVAp,
        R_Phase_UPS_Power_In_KW: R_Ph_UPS_KWp,
        R_Phase_UPS_Power_Factor: R_Ph_UPS_pf,
        Y_Phase_UPS_Power_In_KVA: Y_Ph_UPS_KVAp,
        Y_Phase_UPS_Power_In_KW: Y_Ph_UPS_KWp,
        Y_Phase_UPS_Power_Factor: Y_Ph_UPS_pf,
        B_Phase_UPS_Power_In_KVA: B_Ph_UPS_KVAp,
        B_Phase_UPS_Power_In_KW: B_Ph_UPS_KWp,
        B_Phase_UPS_Power_Factor: B_Ph_UPS_pf,
        Total_UPS_Power_In_KVA: Tot_UPS_KVAp,
        Total_UPS_Power_In_KW: Tot_UPS_KWp,
        Total_UPS_Power_PF: Tot_UPS_pf,
        // System_Control_Card_Software_Version: 
        //     System_Control_Card_Software_Version
        // ,
        // User_Interface_Card_Software_Version: 
        //     User_Interface_Card_Software_Version
        // ,
        // Reserved_for_Future_Use1: Reserved_for_Future_Use1,
        // Reserved_for_Future_Use2: Reserved_for_Future_Use2,
        // Battery_Room_Temperature: Battery_Room_Temperature,
        // Traceback_bit_Read: Traceback_bit_Read,
    };

    return transisterJson;
}

const convertToDecimal = (data) => {
    return parseInt(data, 16);
};

const UPS_MSG = async (payload) => {
    // let payload =
    //   'AAAA010176"0001,0002,0003,0005,0000,0000,0000,0000,0000,0000,0000,0000,000D,000E,000F,0010,0011,0012,0013,0014,0015,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000"5555';

    // let splitPayload = payload.split('"');
    let parsedPayload = JSON.parse(payload);
    console.log('parsedPayload');
    console.log(parsedPayload);
    return false;

    let allTransistersString = splitPayload[1];
    if (allTransistersString) {
        let json = {};
        let allTransistersArray = allTransistersString.split(",");
        // let alarmNotificationTransiter = allTransistersArray.slice(0, 12);
        let remainingTransisters = allTransistersArray.slice(12);
        // let alarmJson = await mapAlarmData(alarmNotificationTransiter);
        let thermisterValues = await getthermistervalues(remainingTransisters);
        json = { ...alarmJson, ...thermisterValues };
        return json;
        //console.log(json);
        // ! Use this JSON for frontend represenataion
    }
};