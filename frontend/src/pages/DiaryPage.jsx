import { useEffect, useState } from "react";
import StoryForm from "../components/StoryForm";

function DiaryPage() {
  const [diaries, setDiaries] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDiaries = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/diary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === "success") {
        setDiaries(result.data);
      } else {
        setMessage(result.message || "Gagal mengambil diary.");
      }
    } catch {
      setMessage("Terjadi kesalahan saat mengambil data.");
    }
  };

  useEffect(() => {
    fetchDiaries();
  }, []);

  return (
    <div>
      <h2>Diary Pribadiku</h2>

      <StoryForm onStoryAdded={fetchDiaries} />

      {message && <p>{message}</p>}
      {diaries.length === 0 ? (
        <p>Belum ada diary pribadi.</p>
      ) : (
        <ul>
          {diaries.map((story) => (
            <li key={story.id}>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
              <small>Diposting: {new Date(story.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DiaryPage;
