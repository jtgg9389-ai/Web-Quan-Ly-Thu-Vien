import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Bước 1: Gửi email để nhận mã token/OTP
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
        email,
      });
      setMessage(response.data.message || 'Mã xác nhận đã được gửi đến email của bạn!');
      setStep(2); // Chuyển sang form nhập mã và mật khẩu mới
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy email hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Gửi token và mật khẩu mới lên server
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:3000/api/auth/reset-password', {
        token,
        newPassword,
      });
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Quên mật khẩu</h2>

      {/* Form 1: Nhập email */}
      {step === 1 ? (
        <form onSubmit={handleRequestReset}>
          <div style={styles.formGroup}>
            <label>Nhập Email tài khoản của bạn:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@gmail.com" 
              required 
              style={styles.input}
            />
          </div>
          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? 'Đang gửi...' : 'Gửi mã xác minh'}
          </button>
        </form>
      ) : (
        /* Form 2: Nhập token từ email + Mật khẩu mới */
        <form onSubmit={handleResetPassword}>
          <div style={styles.formGroup}>
            <label>Mã xác minh (Token từ Email):</label>
            <input 
              type="text" 
              value={token} 
              onChange={(e) => setToken(e.target.value)} 
              placeholder="Nhập mã xác minh" 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Mật khẩu mới:</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Mật khẩu mới" 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Xác nhận mật khẩu mới:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Xác nhận mật khẩu mới" 
              required 
              style={styles.input}
            />
          </div>

          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
          <button type="button" onClick={() => setStep(1)} style={{ ...styles.button, ...styles.btnSecondary }}>
            Quay lại
          </button>
        </form>
      )}

      {message && <p style={styles.successMsg}>{message}</p>}
      {error && <p style={styles.errorMsg}>{error}</p>}

      <div style={styles.links}>
        <Link to="/login">Quay lại Đăng nhập</Link>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' },
  formGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '8px', boxSizing: 'border-box' as const, marginTop: '5px' },
  button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' },
  btnSecondary: { backgroundColor: '#6c757d' },
  successMsg: { color: 'green', marginTop: '10px' },
  errorMsg: { color: 'red', marginTop: '10px' },
  links: { marginTop: '15px', textAlign: 'center' as const },
};