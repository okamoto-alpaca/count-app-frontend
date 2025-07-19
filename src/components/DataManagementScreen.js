import React, { useState, useEffect } from 'react';

const DataManagementScreen = ({ onBack }) => {
  const [surveys, setSurveys] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchSurveys = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'リストの取得に失敗しました。');
        }
        setSurveys(data);
    } catch(error) {
        console.error('Failed to fetch surveys for management:', error);
        alert(error.message);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedIds(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(selectedId => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert('削除する調査テンプレートを選択してください。');
      return;
    }
    
    if (window.confirm(`選択した ${selectedIds.length} 件の調査テンプレートを本当に削除しますか？この操作は元に戻せません。`)) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
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
        fetchSurveys();

      } catch (error) {
        console.error("Error removing documents: ", error);
        alert(error.message);
      }
    }
  };

  return (
    <div className="data-management-container">
      <h1>データ管理 (調査テンプレート)</h1>
      <div className="data-list">
        {surveys.map(survey => (
          <div key={survey.id} className="data-item">
            <input
              type="checkbox"
              checked={selectedIds.includes(survey.id)}
              onChange={() => handleCheckboxChange(survey.id)}
            />
            <span className="data-name">{survey.name}</span>
            <span className="data-date">{new Date(survey.createdAt).toLocaleDateString()}</span>
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