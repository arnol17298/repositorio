const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const authenticateToken = require("./auth/authenticateToken");
const log = require("./lib/trace");
require("dotenv").config();
app.use("/files", express.static("files"))

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);

  console.log("Conectado a la base de datos");
}

app.use("/api/signup", require("./routes/signup"));
app.use("/api/login", require("./routes/login"));
app.use("/api/signout", require("./routes/logout"));

// Ruta para renovar el token de acceso utilizando el token de actualización
app.use("/api/refresh-token", require("./routes/refreshToken"));

app.use("/api/posts", authenticateToken, require("./routes/posts"));

// Ruta protegida que requiere autenticación
/* app.get("/api/posts", authenticateToken, (req, res) => {
  res.json(posts);
}); */
/* app.post("/api/posts", authenticateToken, (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const post = {
    id: posts.length + 1,
    title: req.body.title,
    completed: false,
  };

  posts.push(post);

  res.json(post);
}); */

//multer
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./files");        
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    },
});

require("../auth-back/schema/pdfDetails");
const PdfSchema = mongoose.model("PdfDetails")
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
    console.log(req.file);
    const titulo = req.body.titulo;
    const autor = req.body.autor;
    const resumen = req.body.resumen;
    const fileName = req.file.filename;
    try {
      await PdfSchema.create({ titulo: titulo, autor: autor, resumen: resumen, pdf: fileName });
      res.send({ status:"ok" });

    } catch (error) {
      res.json({status:error})
    }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    
  }
});
app.use(express.static('public'));
app.get('/api/buscar', (req, res) => {
  const searchTerm = req.query.q.toLowerCase();
  const datos = obtenerDatosDesdeBD();

  const resultados = datos.filter(item => 
    item.autor.toLowerCase().includes(searchTerm) ||
    item.titulo.toLowerCase().includes(searchTerm) ||
    item.resumen.toLowerCase().includes(searchTerm)
);
res.json(resultados);
});

//conexion al servidor
app.use("/api/user", authenticateToken, require("./routes/user"));

app.listen(port, () => {
  console.log(`El servidor esta ejecutandose en el puerto: ${port}`);
});

module.exports = app;
