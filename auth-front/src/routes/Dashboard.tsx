import { useEffect, useState } from "react";
import PortalLayout from "../layout/PortalLayout";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import axios from "axios";
import { pdfjs } from "react-pdf";
import doc from "../assets/doc.png"


interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function Dashboard() {
  const auth = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [value, setValue] = useState("");

  async function getTodos() {
    const accessToken = auth.getAccessToken();
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setTodos(json);
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function createTodo() {
    if (value.length > 3) {
      try {
        const response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
          body: JSON.stringify({ title: value }),
        });
        if (response.ok) {
          const todo = (await response.json()) as Todo;
          setTodos([...todos, todo]);
        }
      } catch (error) { }
    }
  }

  useEffect(() => {
    getTodos();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTodo();
  }

  /*--- PAF RECUPERADOS DEL BACKEND ---*/
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();

  const [allImage, setAllImage] = useState<Array<{ titulo: string; autor: string; resumen: string; pdf: string }> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async (): Promise<void> => {
    const result = await axios.get("http://localhost:3000/get-files");
    console.log(result.data.data);
    setAllImage(result.data.data);
  };

  const showPdfFullScreen = (pdf: string): void => {
    window.open(`http://localhost:3000/files/${pdf}`, "_blank", "fullscreen=yes");
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredPdfs = allImage?.filter(data =>
    data.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.resumen.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
      <PortalLayout>

      <h1 className="text-center">BIENVENIDO AL REPOSITORIOS INSTITUCIONAL</h1>
      <div className="buscador">
      <input
        type="text"
        name="buscador"
        id="buscador"
        placeholder="Buscar PAF..."
        value={searchTerm}
        onChange={handleSearch}
      />
      </div><p></p>
      <div className="container">
        <div className="pdfs">
          {filteredPdfs == null
            ? ""
            : filteredPdfs.map((data) => (
              <div className="pdf" key={data.pdf}>
                <img className="imagendoc" src={doc} alt="" />
                <h6>Titulo: {data.titulo}</h6>
                <h6>Autor: {data.autor}</h6>
                <h6 hidden>Resumen: {data.resumen}</h6>
                <button
                  className="btn btn-primary"
                  onClick={() => showPdfFullScreen(data.pdf)}>
                  Ver PDF
                </button>
              </div>
            ))}
        </div>
      </div>
    </PortalLayout>

    );
  }