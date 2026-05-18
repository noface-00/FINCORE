const axios = require('axios');

const testApi = async () => {
  try {
    const response = await axios.post("http://100.100.129.101:8080/ords/fincore/transacciones/2", {
      access_token: "c3ViPTIscm9sPUdFUkVOVEUsZXhwPTIwMjYwNTE1MDgzNjMy"
    });
    console.log("RESPONSE DATA TYPE:", typeof response.data);
    console.log("RESPONSE DATA:", JSON.stringify(response.data).substring(0, 200));
    
    const d = response.data;
    if (Array.isArray(d?.data?.transacciones)) {
      console.log("✅ Array detected inside d.data.transacciones");
      console.log("Length:", d.data.transacciones.length);
    } else {
      console.log("❌ Could not extract array");
    }
  } catch (err) {
    console.error("ERROR:", err.message);
    if (err.response) {
      console.error("STATUS:", err.response.status);
    }
  }
};

testApi();
