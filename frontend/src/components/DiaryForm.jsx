import { useState } from 'react';

function DiaryForm({ onDiaryAdded }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) return setMessage('Silakan login dulu.');

    try {
      const res = await fetch('http://localhost:5000/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body }),
      });

      const result = await res.json();

      if (result.status === 'success') {
        setMessage('Diary berhasil disimpan');
        setTitle('');
        setBody('');
        if (onDiaryAdded) onDiaryAdded();
      } else {
        setMessage(result.message || 'Gagal simpan diary');
      }
    } catch {
      setMessage('Error saat menyimpan diary.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Tambah Diary Baru</h3>
      <input
        type="text"
        placeholder="Judul diary"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      /><br />
      <textarea
        placeholder="Isi diary"
        value={body}
        onChange={e => setBody(e.target.value)}
        required
      ></textarea><br />
      <button type="submit">Simpan Diary</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default DiaryForm;