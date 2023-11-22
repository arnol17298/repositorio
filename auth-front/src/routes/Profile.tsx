
import { useEffect, useState } from "react";
import axios from "axios";
import { pdfjs } from "react-pdf";
import PortalLayout from "../layout/PortalLayout";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function App() {
  const [titulo, setTitulo] = useState<string>("");
  const [autor, setAutor] = useState<string>("");
  const [resumen, setResumen] = useState<string>("");
  const [file, setFile] = useState<File | string>("");
  const [allImage, setAllImage] = useState<Array<{ titulo: string; autor: string; resumen: string; pdf: string }> | null>(null);
 
  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async (): Promise<void> => {
    const result = await axios.get("http://localhost:3000/get-files");
    console.log(result.data.data);
    setAllImage(result.data.data);
  };

  const submitImage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("autor", autor);
    formData.append("resumen", resumen);
    formData.append("file", file as File); // Asumiendo que 'file' es un File o un string
    console.log(titulo, autor, resumen, file);

    const result = await axios.post(
      "http://localhost:3000/upload-files",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log(result);
    if (result.data.status === "ok") {
      alert("El PAF fue registrado con exito");
      getPdf();
    }
  };

  return (
  <PortalLayout>
    <div className="container-reg-paf">
      <form className="form-pdf" onSubmit={submitImage}>
        <h1 className="text-center">Registrar PAF</h1>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Titulo de PAF"
          required
          onChange={(e) => setTitulo(e.target.value)}
        />
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Autor del PAF"
          required
          onChange={(e) => setAutor(e.target.value)}
        />
        <br />
        <textarea 
          className="form-control"
          placeholder="Resumen del PAF"
          rows={5}
          required
          onChange={(e) => setResumen(e.target.value)}>
        </textarea>
        <br />
        <input
          type="file"
          className="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] || "")}
        />
        <br />
        <button className="btn btn-primary" type="submit">
          Registrar PAF
        </button>
      </form>
    </div>
    </PortalLayout>
  );
}



