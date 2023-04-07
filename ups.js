const getthermistervalues = async (remainingTransisters) => {
    let [
        R_Y_Phase_Input_Voltage,
        R_Phase_Input_Current,
        Y_B_Phase_Input_Voltage,
        Y_Phase_Input_Current,
        B_R_Phase_Input_Voltage,
        B_Phase_Input_Current,
        Mains_Input_Freq,
        DC_Link_Voltage,
        Charger_OUTPUT_Voltage,
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
        R_Phase_Output_Power_In_KVA,
        R_Phase_Output_Power_In_KW,
        R_Phase_Output_Power_Factor,
        Y_Phase_Output_Power_In_KVA,
        Y_Phase_Output_Power_In_KW,
        Y_Phase_Output_Power_Factor,
        B_Phase_Output_Power_In_KVA,
        B_Phase_Output_Power_In_KW,
        B_Phase_Output_Power_Factor,
        Total_Output_Power_In_KVA,
        Total_Output_Power_In_KW,
        Total_Output_Power_PF,
        R_Phase_UPS_Power_In_KVA,
        R_Phase_UPS_Power_In_KW,
        R_Phase_UPS_Power_Factor,
        Y_Phase_UPS_Power_In_KVA,
        Y_Phase_UPS_Power_In_KW,
        Y_Phase_UPS_Power_Factor,
        B_Phase_UPS_Power_In_KVA,
        B_Phase_UPS_Power_In_KW,
        B_Phase_UPS_Power_Factor,
        Total_UPS_Power_In_KVA,
        Total_UPS_Power_In_KW,
        Total_UPS_Power_PF,
        System_Control_Card_Software_Version,
        User_Interface_Card_Software_Version,
        Reserved_for_Future_Use1,
        Reserved_for_Future_Use2,
        Battery_Room_Temperature,
        Traceback_bit_Read,
    ] = remainingTransisters;

    let transisterJson = {
        R_Y_Phase_Input_Voltage: convertToDecimal(R_Y_Phase_Input_Voltage),
        R_Phase_Input_Current: convertToDecimal(R_Phase_Input_Current),
        Y_B_Phase_Input_Voltage: convertToDecimal(Y_B_Phase_Input_Voltage),
        Y_Phase_Input_Current: convertToDecimal(Y_Phase_Input_Current),
        B_R_Phase_Input_Voltage: convertToDecimal(B_R_Phase_Input_Voltage),
        B_Phase_Input_Current: convertToDecimal(B_Phase_Input_Current),
        Mains_Input_Freq: convertToDecimal(Mains_Input_Freq),
        DC_Link_Voltage: convertToDecimal(DC_Link_Voltage),
        Charger_OUTPUT_Voltage: convertToDecimal(Charger_OUTPUT_Voltage),
        R_Phase_Output_Voltage: convertToDecimal(R_Phase_Output_Voltage),
        Y_Phase_Output_Voltage: convertToDecimal(Y_Phase_Output_Voltage),
        B_Phase_Output_Voltage: convertToDecimal(B_Phase_Output_Voltage),
        R_Phase_Output_Current: convertToDecimal(R_Phase_Output_Current),
        Y_Phase_Output_Current: convertToDecimal(Y_Phase_Output_Current),
        B_Phase_Output_Current: convertToDecimal(B_Phase_Output_Current),
        Output_Freq: convertToDecimal(Output_Freq),
        R_Phase_Bypass_Voltage: convertToDecimal(R_Phase_Bypass_Voltage),
        Y_Phase_Bypass_Voltage: convertToDecimal(Y_Phase_Bypass_Voltage),
        B_Phase_Bypass_Voltage: convertToDecimal(B_Phase_Bypass_Voltage),
        R_Phase_Alternate_Current: convertToDecimal(R_Phase_Alternate_Current),
        Y_Phase_Alternate_Current: convertToDecimal(Y_Phase_Alternate_Current),
        B_Phase_Alternate_Current: convertToDecimal(B_Phase_Alternate_Current),
        Bypass_Freq: convertToDecimal(Bypass_Freq),
        R_Phase_Inverter_Voltage: convertToDecimal(R_Phase_Inverter_Voltage),
        Y_Phase_Inverter_Voltage: convertToDecimal(Y_Phase_Inverter_Voltage),
        B_Phase_Inverter_Voltage: convertToDecimal(B_Phase_Inverter_Voltage),
        R_Phase_Inverter_Current: convertToDecimal(R_Phase_Inverter_Current),
        Y_Phase_Inverter_Current: convertToDecimal(Y_Phase_Inverter_Current),
        B_Phase_Inverter_Current: convertToDecimal(B_Phase_Inverter_Current),
        Inverter_Frequency: convertToDecimal(Inverter_Frequency),
        Battery_Voltage: convertToDecimal(Battery_Voltage),
        Battery_Current: convertToDecimal(Battery_Current),
        Battery_Status: convertToDecimal(Battery_Status),
        R_Phase_Output_Power_In_KVA: convertToDecimal(R_Phase_Output_Power_In_KVA),
        R_Phase_Output_Power_In_KW: convertToDecimal(R_Phase_Output_Power_In_KW),
        R_Phase_Output_Power_Factor: convertToDecimal(R_Phase_Output_Power_Factor),
        Y_Phase_Output_Power_In_KVA: convertToDecimal(Y_Phase_Output_Power_In_KVA),
        Y_Phase_Output_Power_In_KW: convertToDecimal(Y_Phase_Output_Power_In_KW),
        Y_Phase_Output_Power_Factor: convertToDecimal(Y_Phase_Output_Power_Factor),
        B_Phase_Output_Power_In_KVA: convertToDecimal(B_Phase_Output_Power_In_KVA),
        B_Phase_Output_Power_In_KW: convertToDecimal(B_Phase_Output_Power_In_KW),
        B_Phase_Output_Power_Factor: convertToDecimal(B_Phase_Output_Power_Factor),
        Total_Output_Power_In_KVA: convertToDecimal(Total_Output_Power_In_KVA),
        Total_Output_Power_In_KW: convertToDecimal(Total_Output_Power_In_KW),
        Total_Output_Power_PF: convertToDecimal(Total_Output_Power_PF),
        R_Phase_UPS_Power_In_KVA: convertToDecimal(R_Phase_UPS_Power_In_KVA),
        R_Phase_UPS_Power_In_KW: convertToDecimal(R_Phase_UPS_Power_In_KW),
        R_Phase_UPS_Power_Factor: convertToDecimal(R_Phase_UPS_Power_Factor),
        Y_Phase_UPS_Power_In_KVA: convertToDecimal(Y_Phase_UPS_Power_In_KVA),
        Y_Phase_UPS_Power_In_KW: convertToDecimal(Y_Phase_UPS_Power_In_KW),
        Y_Phase_UPS_Power_Factor: convertToDecimal(Y_Phase_UPS_Power_Factor),
        B_Phase_UPS_Power_In_KVA: convertToDecimal(B_Phase_UPS_Power_In_KVA),
        B_Phase_UPS_Power_In_KW: convertToDecimal(B_Phase_UPS_Power_In_KW),
        B_Phase_UPS_Power_Factor: convertToDecimal(B_Phase_UPS_Power_Factor),
        Total_UPS_Power_In_KVA: convertToDecimal(Total_UPS_Power_In_KVA),
        Total_UPS_Power_In_KW: convertToDecimal(Total_UPS_Power_In_KW),
        Total_UPS_Power_PF: convertToDecimal(Total_UPS_Power_PF),
        System_Control_Card_Software_Version: convertToDecimal(
            System_Control_Card_Software_Version
        ),
        User_Interface_Card_Software_Version: convertToDecimal(
            User_Interface_Card_Software_Version
        ),
        Reserved_for_Future_Use1: convertToDecimal(Reserved_for_Future_Use1),
        Reserved_for_Future_Use2: convertToDecimal(Reserved_for_Future_Use2),
        Battery_Room_Temperature: convertToDecimal(Battery_Room_Temperature),
        Traceback_bit_Read: convertToDecimal(Traceback_bit_Read),
    };

    return transisterJson;
}

const convertToDecimal = (data) => {
    return parseInt(data, 16);
};

const UPS_MSG = async (payload) => {
    // let payload =
    //   'AAAA010176"0001,0002,0003,0005,0000,0000,0000,0000,0000,0000,0000,0000,000D,000E,000F,0010,0011,0012,0013,0014,0015,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000,0000"5555';

    let splitPayload = payload.split('"');
    let allTransistersString = splitPayload[1];
    if (allTransistersString) {
        let json = {};
        let allTransistersArray = allTransistersString.split(",");
        let alarmNotificationTransiter = allTransistersArray.slice(0, 12);
        let remainingTransisters = allTransistersArray.slice(12);
        let alarmJson = await mapAlarmData(alarmNotificationTransiter);
        let thermisterValues = await getthermistervalues(remainingTransisters);
        json = { ...alarmJson, ...thermisterValues };
        return json;
        //console.log(json);
        // ! Use this JSON for frontend represenataion
    }
};