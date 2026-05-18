import axios from 'axios';

const testApi = async () => {
  try {
    const response = await axios.post("http://100.100.129.101:8080/ords/fincore/transacciones/2", {
      access_token: "c3ViPTIscm9sPUdFUkVOVEUsZXhwPTIwMjYwNTE1MDgzNjMy"
    });
    console.log("RESPONSE DATA:", JSON.stringify(response.data, null, 2));
    
    const d = response.data;
    if (Array.isArray(d?.data?.transacciones)) {
      console.log("✅ Array detected inside d.data.transacciones");
      console.log("Length:", d.data.transacciones.length);
    } else {
      console.log("❌ Could not extract array");
    }
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
};

testApi();
