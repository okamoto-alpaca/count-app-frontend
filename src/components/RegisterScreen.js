import React, { useState, useEffect } from 'react';
import './RegisterScreen.css'; // ---【追加】モーダル用のCSSをインポート

// ---【追加】プリセット選択モーダルのコンポーネント ---
const PresetModal = ({ presets, onSelect, onClose }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <h2>プリセットを選択</h2>
            <div className="preset-grid">
                {presets.map(preset => (
                    <button key={preset.id} className="preset-select-button" onClick={() => onSelect(preset)}>
                        {preset.name}
                    </button>
                ))}
            </div>
            <button className="mode-button back-button" onClick={onClose}>閉じる</button>
        </div>
    </div>
);

const RegisterScreen = ({ onBack }) => {
  const [surveyNo, setSurveyNo] = useState('');
  const [surveyName, setSurveyName] = useState('');
  const [realWorkItems, setRealWorkItems] = useState([{ id: 1, text: '' }]);
  const [incidentalWorkItems, setIncidentalWorkItems] = useState([{ id: 1, text: '' }]);
  const [wastefulWorkItems, setWastefulWorkItems] = useState([{ id: 1, text: '' }]);

  // ---【追加】プリセット関連のstate ---
  const [presets, setPresets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // ---【追加】プリセット一覧を取得する処理 ---
  useEffect(() => {
    const fetchPresets = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/presets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setPresets(data);
            }
        } catch (error) {
            console.error("Failed to fetch presets", error);
        }
    };
    fetchPresets();
  }, []);

  // ---【追加】プリセットを選択したときの処理 ---
  const handleSelectPreset = (preset) => {
    const mapToItems = (arr) => arr.map(text => ({ id: Date.now() + Math.random(), text }));
    
    setRealWorkItems(preset.realWork.length > 0 ? mapToItems(preset.realWork) : [{ id: 1, text: '' }]);
    setIncidentalWorkItems(preset.incidentalWork.length > 0 ? mapToItems(preset.incidentalWork) : [{ id: 1, text: '' }]);
    setWastefulWorkItems(preset.wastefulWork.length > 0 ? mapToItems(preset.wastefulWork) : [{ id: 1, text: '' }]);
    
    setIsModalOpen(false);
  };


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
    <>
      {/* ---【追加】モーダル表示の制御 --- */}
      {isModalOpen && <PresetModal presets={presets} onSelect={handleSelectPreset} onClose={() => setIsModalOpen(false)} />}
      
      <div className="form-container">
        <div className="form-header">
            <h1 className="form-title">調査名・項目登録</h1>
            {/* ---【追加】プリセット呼び出しボタン --- */}
            <button className="mode-button preset-call-button" onClick={() => setIsModalOpen(true)}>プリセットから呼び出す</button>
        </div>

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
    </>
  );
};

export default RegisterScreen;