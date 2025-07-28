import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentForm from '../components/CommentForm';
import Swal from 'sweetalert2';
import { FiHeart, FiMessageCircle, FiRepeat, FiBookmark } from 'react-icons/fi';

const getAnonymousId = () => {
  let id = localStorage.getItem('anonymousId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('anonymousId', id);
  }
  return id;
};

function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [openCommentMenu, setOpenCommentMenu] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_URL}/stories/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setStory(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Gagal ambil cerita:', err);
          setLoading(false);
        });
    }, 600);
  }, [id, refresh]);

  const handleDeleteComment = async (commentId) => {
    const konfirmasi = await Swal.fire({
      title: 'Hapus Komentar?',
      text: 'Yakin ingin menghapus komentar ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!konfirmasi.isConfirmed) return;

    const token = localStorage.getItem('token');
    const anonymousId = getAnonymousId();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stories/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-anonymous-id': anonymousId,
        },
      });

      const data = await res.json();
      if (data.status === 'success') {
        setRefresh(!refresh);
      } else {
        Swal.fire('Gagal', data.message || 'Tidak dapat menghapus komentar.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Terjadi kesalahan saat menghapus komentar.', 'error');
    }
  };

  if (loading)
    return (
      <div className="spinner">
        <p className="text-center">Memuat cerita...</p>
      </div>
    );

  if (!story) return <p>Cerita tidak ditemukan.</p>;

  return (
    <div className="container">
      <h2>{story.title}</h2>
      <p>{story.body}</p>

      <div className="story-user">
        <img src="/anon-avatar.png" alt="avatar" className="avatar-small" />
        <small>
          Oleh: {story.user?.name || 'Anonim'} | Diposting: {new Date(story.createdAt).toLocaleString()}
        </small>
      </div>

      <div className="social-row">
        <button className="icon-button no-highlight"><FiHeart />Suka</button>
        <button className="icon-button no-highlight"><FiMessageCircle />Komentar</button>
        <button className="icon-button no-highlight"><FiRepeat />Bagikan</button>
        <button className="icon-button no-highlight"><FiBookmark />Simpan</button>
      </div>

      <h4>Komentar ({story.comments.length})</h4>
      {story.comments.length === 0 && <p>Belum ada komentar.</p>}
      <ul>
        {story.comments.map((comment) => {
          const isOwner =
            comment.user?.anonymousId === getAnonymousId() ||
            comment.user?.id === story.user?.id;

          return (
            <li key={comment.id} className="comment-item" style={{ position: 'relative' }}>
              <img src="/anon-avatar.png" alt="avatar" className="avatar-small" />

              <div style={{ flex: 1, position: 'relative' }}>
                <div className="comment-text">
                  <strong>{comment.user?.name || 'Anonim'}:</strong> {comment.body}
                  <p className="comment-meta">
                    Diposting: {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>

                {isOwner && (
                  <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <button
                      className="comment-menu-btn"
                      onClick={() =>
                        setOpenCommentMenu(openCommentMenu === comment.id ? null : comment.id)
                      }
                    >
                      ⋮
                    </button>
                    {openCommentMenu === comment.id && (
                      <div className="menu-dropdown">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-btn"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <CommentForm storyId={story.id} onCommentSuccess={() => setRefresh(!refresh)} />
    </div>
  );
}

export default StoryDetail;
