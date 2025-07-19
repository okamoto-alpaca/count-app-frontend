import React, { useState } from 'react';

const RegisterScreen = ({ onBack }) => {
  const [surveyNo, setSurveyNo] = useState('');
  const [surveyName, setSurveyName] = useState('');
  const [realWorkItems, setRealWorkItems] = useState([{ id: 1, text: '' }]);
  const [incidentalWorkItems, setIncidentalWorkItems] = useState([{ id: 1, text: '' }]);
  const [wastefulWorkItems, setWastefulWorkItems] = useState([{ id: 1, text: '' }]);

  const handleItemChange = (items, setItems, id, newText) => {
    const updatedItems = items.map(item => (item.id === id ? { ...item, text: newText } : item));
    setItems(updatedItems);
  };

  const addItem = (items, setItems) => {
    const newItem = { id: Date.now(), text: '' };
    setItems([...items, newItem]);
  };

  const deleteItem = (items, setItems, idToDelete) => {
    if (items.length > 1) {
      const updatedItems = items.filter(item => item.id !== idToDelete);
      setItems(updatedItems);
    }
  };

  const handleRegistrationComplete = async () => {
    const surveyData = {
      no: surveyNo,
      name: surveyName,
      realWork: realWorkItems.map(item => item.text).filter(Boolean),
      incidentalWork: incidentalWorkItems.map(item => item.text).filter(Boolean),
      wastefulWork: wastefulWorkItems.map(item => item.text).filter(Boolean),
    };

    if (!surveyData.name.trim()) {
      alert('調査名を入力してください。');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(surveyData)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登録中にエラーが発生しました。');
      }

      alert('登録が完了しました。');
      onBack();

    } catch (e) {
      console.error("Error adding document: ", e);
      alert(e.message);
    }
  };

  const renderWorkCategory = (title, items, setItems, placeholder, className) => (
    <div className={`work-category-box ${className}`}>
      <h2>{title}</h2>
      {items.map(item => (
        <div key={item.id} className="list-item">
          <input
            type="text"
            placeholder={placeholder}
            className="form-input"
            value={item.text}
            onChange={(e) => handleItemChange(items, setItems, item.id, e.target.value)}
          />
          <button onClick={() => deleteItem(items, setItems, item.id)} className="delete-button">削除</button>
        </div>
      ))}
      <button onClick={() => addItem(items, setItems)} className="add-button">＋ 項目を追加</button>
    </div>
  );

  return (
    <div className="form-container">
      <h1 className="form-title">調査名・項目登録</h1>
      <div className="input-group">
        <input type="text" placeholder="調査名 No" className="form-input" value={surveyNo} onChange={(e) => setSurveyNo(e.target.value)} />
        <input type="text" placeholder="調査名" className="form-input" value={surveyName} onChange={(e) => setSurveyName(e.target.value)} />
      </div>
      {renderWorkCategory('実作業', realWorkItems, setRealWorkItems, '実作業 項目', 'real-work')}
      {renderWorkCategory('付随作業', incidentalWorkItems, setIncidentalWorkItems, '付随作業 項目', 'incidental-work')}
      {renderWorkCategory('ムダ作業', wastefulWorkItems, setWastefulWorkItems, 'ムダ作業 項目', 'wasteful-work')}
      <div className="form-actions">
        <button className="mode-button action-button" onClick={handleRegistrationComplete}>登録完了</button>
        <button className="mode-button back-button" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
};

export default RegisterScreen;