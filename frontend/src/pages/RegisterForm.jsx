import { useState } from 'react';

function RegisterForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setMessage('Registrasi berhasil! Silakan login.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setMessage(result.message || 'Registrasi gagal.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan saat registrasi.');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Daftar Akun</h2>
      <input
        type="text"
        placeholder="Nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      /><br />
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
      <button type="submit">Daftar</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default RegisterForm;
