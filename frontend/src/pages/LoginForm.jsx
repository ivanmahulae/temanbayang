import { useNavigate } from 'react-router-dom'; // ⬅️ Tambah ini
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ⬅️ Gunakan navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        const token = result.data.token;
        localStorage.setItem('token', token);
        setMessage('Login berhasil!');
        navigate('/'); // ⬅️ Arahkan ke halaman utama setelah login
      } else {
        setMessage(result.message || 'Login gagal.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan saat login.');
    }
  };

  return (
    <div>
      <h2>Login ke TemanBayang</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Masuk</button>
      </form>

      {/* Ganti tombol daftar */}
      <p>
        Belum punya akun? <button onClick={() => navigate('/register')}>Daftar di sini</button>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginForm;
