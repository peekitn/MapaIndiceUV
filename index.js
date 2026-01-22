const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

console.log("Servidor iniciou");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/uv", async (req, res) => {
  const { lat, lon } = req.body;

  if (typeof lat !== "number" || typeof lon !== "number") {
    return res.json({
      uv: "Erro",
      level: "Erro",
      advice: "Coordenadas inválidas"
    });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&timezone=auto`;

    const response = await axios.get(url, { timeout: 5000 });

    const uv = response?.data?.current?.uv_index;

    if (uv === undefined) {
      return res.json({
        uv: "N/D",
        level: "Indisponível",
        advice: "Sem dados UV para este local."
      });
    }

    let level, advice;

    if (uv < 3) {
      level = "Baixo";
      advice = "Seguro para atividades ao ar livre.";
    } else if (uv < 6) {
      level = "Moderado";
      advice = "Use protetor solar.";
    } else if (uv < 8) {
      level = "Alto";
      advice = "Evite exposição prolongada ao sol.";
    } else if (uv < 11) {
      level = "Muito alto";
      advice = "Evite sair ao meio-dia.";
    } else {
      level = "Extremo";
      advice = "Perigo! Evite exposição ao sol.";
    }

    res.json({ uv: uv.toFixed(1), level, advice });

  } catch (err) {
    console.error("Erro:", err.message);
    res.json({
      uv: "Erro",
      level: "Erro",
      advice: "Falha ao consultar serviço"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
