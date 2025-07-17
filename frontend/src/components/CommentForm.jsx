import { useState, useEffect } from 'react';
import { getAnonymousId } from '../utils/anonymousId';

function CommentForm({ storyId, onCommentSuccess }) {
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const isUserLoggedIn = !!token;

  useEffect(() => {
    setIsAnonymous(!isUserLoggedIn);
  }, [isUserLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.trim() === '') {
      setMessage('Komentar tidak boleh kosong.');
      return;
    }

    const anonymousId = getAnonymousId(); // Ambil ID dari localStorage

    try {
      const response = await fetch(`http://localhost:5000/stories/${storyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ comment, isAnonymous, anonymousId }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setMessage('Komentar berhasil ditambahkan!');
        setComment('');
        onCommentSuccess();
      } else {
        setMessage(result.message || 'Gagal menambahkan komentar.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan saat mengirim komentar.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Info untuk pengguna anonim */}
      {isAnonymous && (
        <div className="anon-info">
          💡 <strong>Info:</strong> Komentar Anda hanya bisa dihapus selama Anda menggunakan browser ini. Jika Anda berganti perangkat, tab, atau menghapus data browser, komentar tidak bisa dihapus lagi.
        </div>
      )}

      <textarea
        placeholder="Tulis komentar..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      ></textarea><br />

      <label>
        <input
          type="checkbox"
          checked={isAnonymous}
          disabled={!isUserLoggedIn}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Kirim sebagai Anonim
      </label><br />

      <button type="submit">Kirim Komentar</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CommentForm;
