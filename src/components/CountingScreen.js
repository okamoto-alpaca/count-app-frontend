import React, { useState, useEffect } from 'react';
import './CountingScreen.css'; // 新しいCSSをインポート

const CountingScreen = ({ survey, instanceId, onEndSurvey, onBack }) => {
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [isMinusMode, setIsMinusMode] = useState(false); // マイナスモードの状態

  const storageKey = `survey-progress-${instanceId}`;

  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setCounts(parsedProgress);
        const total = Object.values(parsedProgress).reduce((sum, count) => sum + count, 0);
        setTotalCount(total);
    } else {
        const initialCounts = {};
        survey.realWork.forEach(item => { initialCounts[`real-${item}`] = 0; });
        survey.incidentalWork.forEach(item => { initialCounts[`incidental-${item}`] = 0; });
        survey.wastefulWork.forEach(item => { initialCounts[`wasteful-${item}`] = 0; });
        setCounts(initialCounts);
        setTotalCount(0);
    }
  }, [instanceId, storageKey, survey]);


  const handleCount = (category, item) => {
    const key = `${category}-${item}`;
    const currentCount = counts[key] || 0;

    // マイナスモードで、かつカウントが0より大きい場合のみ減算
    if (isMinusMode && currentCount > 0) {
        const newCounts = { ...counts, [key]: currentCount - 1 };
        setCounts(newCounts);
        setTotalCount(prevTotal => prevTotal - 1);
        localStorage.setItem(storageKey, JSON.stringify(newCounts));
    } else if (!isMinusMode) {
        const newCounts = { ...counts, [key]: currentCount + 1 };
        setCounts(newCounts);
        setTotalCount(prevTotal => prevTotal + 1);
        localStorage.setItem(storageKey, JSON.stringify(newCounts));
    }
  };

  const handleEndSurvey = () => {
    localStorage.removeItem(storageKey);
    onEndSurvey(counts);
  };
  
  // カメラ機能を呼び出す（input要素をトリガーする）
  const handleCameraClick = () => {
    document.getElementById('camera-input').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // ここで撮影した写真の処理を行う（例：プレビュー表示、アップロードなど）
        // 今回はコンソールにファイル情報を表示するのみとします。
        console.log('撮影したファイル:', file);
        alert(`写真「${file.name}」が選択されました。（アップロード機能は未実装です）`);
    }
  };

  // 全ての作業項目を一つの配列にまとめる
  const allItems = [
    ...survey.realWork.map(item => ({ category: 'real', name: item, className: 'real-work-button' })),
    ...survey.incidentalWork.map(item => ({ category: 'incidental', name: item, className: 'incidental-work-button' })),
    ...survey.wastefulWork.map(item => ({ category: 'wasteful', name: item, className: 'wasteful-work-button' })),
  ];

  return (
    <div className="counting-container">
      {/* ---【変更点】ヘッダー --- */}
      <header className="counting-header-single-line">
        <h1>調査: {survey.name}</h1>
        <h2>カウント合計: {totalCount}</h2>
        <button 
            className={`minus-mode-button ${isMinusMode ? 'active' : ''}`}
            onClick={() => setIsMinusMode(!isMinusMode)}
        >
            ー
        </button>
      </header>

      {/* ---【変更点】ボディ --- */}
      <main className="counting-grid">
        {allItems.map((item, index) => {
            const key = `${item.category}-${item.name}`;
            return (
                <button 
                    key={index} 
                    className={`grid-item-button ${item.className}`} 
                    onClick={() => handleCount(item.category, item.name)}
                >
                    {item.name}
                    <span className="count-number">{counts[key] || 0}</span>
                </button>
            );
        })}
      </main>

      <footer className="counting-footer">
        {/* ---【変更点】カメラボタン --- */}
        <button className="mode-button action-button" onClick={handleCameraClick}>カメラを起動</button>
        {/* 非表示のinput要素で実際にカメラを呼び出す */}
        <input 
            type="file" 
            id="camera-input" 
            accept="image/*" 
            capture="environment" 
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
        <button className="mode-button action-button" onClick={handleEndSurvey}>調査終了</button>
        <button className="mode-button back-button" onClick={onBack}>調査選択に戻る</button>
      </footer>
    </div>
  );
};

export default CountingScreen;