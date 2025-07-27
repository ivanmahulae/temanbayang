import { useState } from 'react';

function StoryForm({ onStoryAdded }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, body, isPrivate }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setMessage('Cerita berhasil ditambahkan!');
        setTitle('');
        setBody('');
        setIsPrivate(false);
        if (onStoryAdded) onStoryAdded();
      } else {
        setMessage(result.message || 'Gagal menambahkan cerita.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan saat menambahkan cerita.');
    }
  };

  return (
    <div className="story-form-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Tulis Cerita Baru</h2>
        <input
          type="text"
          placeholder="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        /><br />
        <textarea
          placeholder="Isi cerita..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        ></textarea><br />

        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Jadikan cerita pribadi
        </label><br />

        <button type="submit">Kirim Cerita</button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default StoryForm;
