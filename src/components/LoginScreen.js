import React, { useState } from 'react';

const LoginScreen = ({ onLogin, error }) => {
  const [companyCode, setCompanyCode] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin(companyCode, userId, password);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>ログイン</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="企業コード"
          className="form-input"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="ユーザーID"
          className="form-input"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="mode-button action-button" onClick={handleLogin}>
          ログイン
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;