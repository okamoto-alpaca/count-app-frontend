import React, { useState } from 'react';

const PresetScreen = ({ onBack, editingItem }) => {
  const mapToItems = (arr = []) => arr.map(text => ({ id: Date.now() + Math.random(), text }));
  
  const [presetName, setPresetName] = useState(editingItem ? editingItem.name : '');
  const [realWorkItems, setRealWorkItems] = useState(editingItem ? mapToItems(editingItem.realWork) : [{ id: 1, text: '' }]);
  const [incidentalWorkItems, setIncidentalWorkItems] = useState(editingItem ? mapToItems(editingItem.incidentalWork) : [{ id: 1, text: '' }]);
  const [wastefulWorkItems, setWastefulWorkItems] = useState(editingItem ? mapToItems(editingItem.wastefulWork) : [{ id: 1, text: '' }]);

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

  const handleSave = async () => {
    const presetData = {
      name: presetName,
      realWork: realWorkItems.map(item => item.text).filter(Boolean),
      incidentalWork: incidentalWorkItems.map(item => item.text).filter(Boolean),
      wastefulWork: wastefulWorkItems.map(item => item.text).filter(Boolean),
    };

    if (!presetData.name.trim()) {
      alert('プリセット名を入力してください。');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }

    const isEditing = !!editingItem;
    const url = isEditing
      ? `${process.env.REACT_APP_API_URL}/api/presets/${editingItem.id}`
      : `${process.env.REACT_APP_API_URL}/api/presets`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
          method: method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(presetData)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '保存中にエラーが発生しました。');
      }

      alert(isEditing ? 'プリセットを更新しました。' : 'プリセットを登録しました。');
      onBack();

    } catch (e) {
      console.error("Error saving preset: ", e);
      alert(e.message);
    }
  };

  // PresetScreenでは並び替えは不要なため、元のシンプルなrenderWorkCategoryを使用
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
      <h1 className="form-title">{editingItem ? 'プリセット編集' : 'プリセット登録'}</h1>
      <div className="input-group">
        <input type="text" placeholder="プリセット名" className="form-input" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
      </div>
      {renderWorkCategory('実作業', realWorkItems, setRealWorkItems, '実作業 項目', 'real-work')}
      {renderWorkCategory('付随作業', incidentalWorkItems, setIncidentalWorkItems, '付随作業 項目', 'incidental-work')}
      {renderWorkCategory('ムダ作業', wastefulWorkItems, setWastefulWorkItems, 'ムダ作業 項目', 'wasteful-work')}
      <div className="form-actions">
        <button className="mode-button action-button" onClick={handleSave}>{editingItem ? '更新完了' : 'プリセット登録'}</button>
        <button className="mode-button back-button" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
};

export default PresetScreen;