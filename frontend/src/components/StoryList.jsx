import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function StoryList() {
  const [stories, setStories] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [userId, setUserId] = useState(null);

  // Ambil ID user dari token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('✅ Token decoded:', decoded);
        setUserId(decoded.id);
      } catch (err) {
        console.error('❌ Token invalid:', err.message);
      }
    } else {
      console.warn('⚠️ Tidak ada token di localStorage');
    }
  }, []);

  // Ambil daftar cerita dari server
  useEffect(() => {
    fetch(`${API_BASE_URL}/stories`)
      .then((res) => res.json())
      .then((data) => {
        console.log('📦 Cerita dari server:', data);
        if (data.status === 'success') {
          setStories(data.data);
        }
      })
      .catch((err) => {
        console.error('❌ Gagal fetch stories:', err);
      });
  }, [refresh]);

  const handleCommentSuccess = () => {
    setRefresh(!refresh);
  };

  const handleDelete = async (storyId, commentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${storyId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.status === 'success') {
        setRefresh(!refresh);
      } else {
        alert(data.message || 'Gagal menghapus komentar.');
      }
    } catch (err) {
      console.error('❌ Gagal hapus komentar:', err.message);
      alert('Gagal terhubung ke server.');
    }
  };

  return (
    <div>
      <h2>Daftar Cerita</h2>
      {stories.length === 0 && <p>Belum ada cerita untuk ditampilkan.</p>}
      {stories.map((story) => (
        <div key={story.id} className="story">
          <h3>{story.title}</h3>
          <p>{story.body}</p>
          <p><strong>Oleh:</strong> {story.user?.name}</p>

          <h4>Komentar:</h4>
          {story.comments.length === 0 && <p>Belum ada komentar.</p>}
          <ul>
            {story.comments.map((comment) => {
              const isOwner = comment.user?.id === userId;
              console.log('💬 Komentar:', comment);
              console.log('👤 userId login:', userId);
              console.log('🟢 isOwner:', isOwner);

              return (
                <li key={comment.id} className="comment-item">
                  <span className="comment-text">
                    <strong>{comment.user?.name || 'Anonim'}:</strong> {comment.body}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(story.id, comment.id)}
                      className="inline-delete-btn"
                    >
                      Hapus
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <CommentForm storyId={story.id} onCommentSuccess={handleCommentSuccess} />
        </div>
      ))}
    </div>
  );
}

export default StoryList;
