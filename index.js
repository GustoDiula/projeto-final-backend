const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;
const db = require("./db");

// ---------- AULA ----------
app.get("/aula", async (req, res) => {
  try {
    const resultado = await db.pool.query("SELECT * FROM aula");
    res.status(200).json(resultado[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.post("/aula", async (req, res) => {
  try {
    const dados = req.body;
    await db.pool.query(
      "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
      [dados.serie, dados.turma, dados.componente, dados.professor]
    );
    res.status(201).json({ mensagem: "Aula cadastrada com sucesso" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/aula/:id", async (req, res) => {
  try {
    await db.pool.query("DELETE FROM aula WHERE id = ?", [req.params.id]);
    res.status(200).json({ mensagem: "Aula removida com sucesso" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ---------- HORÁRIO ----------
app.post("/horario", async (req, res) => {
  try {
    const { idaula, dia_semana, ordem } = req.body;
    await db.pool.query(
      "INSERT INTO horario_aula (idaula, dia_semana, ordem) VALUES (?, ?, ?)",
      [idaula, dia_semana, ordem]
    );
    res.status(201).json({ mensagem: "Horário cadastrado com sucesso" });
  } catch (erro) {
    if (erro.errno === 1452) {
      return res.status(400).json({ erro: "A aula informada não existe" });
    }
    res.status(500).json({ erro: erro.message });
  }
});

// NOVA: busca horários pelo nome da aula (componente)
app.get("/horario/aula/:componente", async (req, res) => {
  try {
    const resultado = await db.pool.query(
      `SELECT aula.componente,
              aula.serie,
              aula.turma,
              aula.professor,
              horario_aula.dia_semana,
              horario_aula.ordem
       FROM aula
       INNER JOIN horario_aula ON horario_aula.idaula = aula.id
       WHERE aula.componente LIKE ?`,
      [`%${req.params.componente}%`]
    );

    if (resultado[0].length === 0) {
      return res.status(404).json({ erro: "Nenhum horário encontrado para esta aula." });
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.get("/horario/:dia", async (req, res) => {
  try {
    const resultado = await db.pool.query(
      "SELECT * FROM horario_aula WHERE dia_semana = ?",
      [req.params.dia]
    );
    res.status(200).json(resultado[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/horario/:id", async (req, res) => {
  try {
    await db.pool.query("DELETE FROM horario_aula WHERE id = ?", [req.params.id]);
    res.status(200).json({ mensagem: "Horário removido com sucesso" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.listen(port, () => {
  console.log("API está a funcionar na porta " + port);
});