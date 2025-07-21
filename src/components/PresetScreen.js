import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './PresetScreen.css'; // ---【追加】CSSをインポート

// ---【追加】ドラッグハンドル用のアイコン ---
const DragHandle = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drag-handle-icon">
        <path d="M7 10H5C4.44772 10 4 9.55228 4 9V7C4 6.44772 4.44772 6 5 6H7C7.55228 6 8 6.44772 8 7V9C8 9.55228 7.55228 10 7 10Z" fill="currentColor"/>
        <path d="M14 10H12C11.4477 10 11 9.55228 11 9V7C11 6.44772 11.4477 6 12 6H14C14.5523 6 15 6.44772 15 7V9C15 9.55228 14.5523 10 14 10Z" fill="currentColor"/>
        <path d="M21 10H19C18.4477 10 18 9.55228 18 9V7C18 6.44772 18.4477 6 19 6H21C21.5523 6 22 6.44772 22 7V9C22 9.55228 21.5523 10 21 10Z" fill="currentColor"/>
        <path d="M7 17H5C4.44772 17 4 16.5523 4 16V14C4 13.4477 4.44772 13 5 13H7C7.55228 13 8 13.4477 8 14V16C8 16.5523 7.55228 17 7 17Z" fill="currentColor"/>
        <path d="M14 17H12C11.4477 17 11 16.5523 11 16V14C11 13.4477 11.4477 13 12 13H14C14.5523 13 15 13.4477 15 14V16C15 16.5523 14.5523 17 14 17Z" fill="currentColor"/>
        <path d="M21 17H19C18.4477 17 18 16.5523 18 16V14C18 13.4477 18.4477 13 19 13H21C21.5523 13 22 13.4477 22 14V16C22 16.5523 21.5523 17 21 17Z" fill="currentColor"/>
    </svg>
);

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

  const onDragEnd = (result, items, setItems) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  const renderWorkCategory = (title, items, setItems, placeholder, className, droppableId) => (
    <div className={`work-category-box ${className}`}>
      <h2>{title}</h2>
      <DragDropContext onDragEnd={(result) => onDragEnd(result, items, setItems)}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`list-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="drag-handle">
                        <DragHandle />
                      </div>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="form-input"
                        value={item.text}
                        onChange={(e) => handleItemChange(items, setItems, item.id, e.target.value)}
                      />
                      <button onClick={() => deleteItem(items, setItems, item.id)} className="delete-button">削除</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={() => addItem(items, setItems)} className="add-button">＋ 項目を追加</button>
    </div>
  );

  return (
    <div className="form-container">
      <h1 className="form-title">{editingItem ? 'プリセット編集' : 'プリセット登録'}</h1>
      <div className="input-group">
        <input type="text" placeholder="プリセット名" className="form-input" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
      </div>
      {renderWorkCategory('実作業', realWorkItems, setRealWorkItems, '実作業 項目', 'real-work', 'presetRealWork')}
      {renderWorkCategory('付随作業', incidentalWorkItems, setIncidentalWorkItems, '付随作業 項目', 'incidental-work', 'presetIncidentalWork')}
      {renderWorkCategory('ムダ作業', wastefulWorkItems, setWastefulWorkItems, 'ムダ作業 項目', 'wasteful-work', 'presetWastefulWork')}
      <div className="form-actions">
        <button className="mode-button action-button" onClick={handleSave}>{editingItem ? '更新完了' : 'プリセット登録'}</button>
        <button className="mode-button back-button" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
};

export default PresetScreen;