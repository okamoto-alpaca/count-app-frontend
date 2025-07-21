import React, { useState, useEffect } from 'react';

const DataManagementScreen = ({ onBack }) => {
  const [mode, setMode] = useState('surveys'); // 'surveys' or 'presets'
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
      }

      // modeに応じてAPIのエンドポイントを切り替える
      const endpoint = mode === 'surveys' ? '/api/surveys' : '/api/presets';

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'リストの取得に失敗しました。');
        }
        setItems(data);
      } catch (error) {
        console.error(`Failed to fetch ${mode}:`, error);
        alert(error.message);
      }
    };

    // modeが空の場合は何もしない（リスト再読み込みのトリック用）
    if (mode) {
        fetchItems();
    }
    setSelectedIds([]); // モードが切り替わったら選択をリセット
  }, [mode]); // modeが変更されたら再実行

  const handleCheckboxChange = (id) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(selectedId => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert(`削除する${mode === 'surveys' ? '調査テンプレート' : 'プリセット'}を選択してください。`);
      return;
    }

    if (window.confirm(`選択した ${selectedIds.length} 件の${mode === 'surveys' ? '調査テンプレート' : 'プリセット'}を本当に削除しますか？`)) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
      }
      
      const endpoint = mode === 'surveys' ? '/api/surveys' : '/api/presets';

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ids: selectedIds })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || '削除中にエラーが発生しました。');
        }

        alert('削除が完了しました。');
        setSelectedIds([]);
        // リストを再読み込みするためにmodeを一度空にしてから戻すトリック
        const currentMode = mode;
        setMode('');
        setTimeout(() => setMode(currentMode), 0);

      } catch (error) {
        console.error("Error removing documents: ", error);
        alert(error.message);
      }
    }
  };

  return (
    <div className="data-management-container">
      {/* ---【追加】タブ切り替えUI --- */}
      <div className="mode-toggle">
        <button
          className={`toggle-button ${mode === 'surveys' ? 'active' : ''}`}
          onClick={() => setMode('surveys')}
        >
          調査テンプレート
        </button>
        <button
          className={`toggle-button ${mode === 'presets' ? 'active' : ''}`}
          onClick={() => setMode('presets')}
        >
          プリセット
        </button>
      </div>

      <div className="data-list">
        {items.map(item => (
          <div key={item.id} className="data-item">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
            <span className="data-name">{item.name}</span>
            <span className="data-date">作成日: {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      <footer className="data-management-footer">
        <button className="mode-button delete-button" onClick={handleDelete}>選択した項目を削除</button>
        <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
      </footer>
    </div>
  );
};

export default DataManagementScreen;