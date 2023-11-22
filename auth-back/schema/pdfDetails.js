const mongoose = require("mongoose");

const PdfDetailsSchema = new mongoose.Schema(
    {
        pdf: String,
        titulo: String,
        autor: String,
        resumen: String,        
    },
    {collection: "PdfDetails"}
);
mongoose.model("PdfDetails", PdfDetailsSchema);