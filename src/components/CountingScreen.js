import React, { useState, useEffect } from 'react';

const CountingScreen = ({ survey, instanceId, onEndSurvey, onBack }) => { // ---【変更点】instanceIdを受け取る
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  // ---【変更点】localStorageのキーをインスタンスごとに一意にする ---
  const storageKey = `survey-progress-${instanceId}`;

  useEffect(() => {
    // ---【変更点】localStorageから途中経過を読み込む ---
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setCounts(parsedProgress);
        // 合計カウントも復元
        const total = Object.values(parsedProgress).reduce((sum, count) => sum + count, 0);
        setTotalCount(total);
    } else {
        // 保存されたデータがない場合、カウントを初期化
        const initialCounts = {};
        survey.realWork.forEach(item => { initialCounts[`real-${item}`] = 0; });
        survey.incidentalWork.forEach(item => { initialCounts[`incidental-${item}`] = 0; });
        survey.wastefulWork.forEach(item => { initialCounts[`wasteful-${item}`] = 0; });
        setCounts(initialCounts);
        setTotalCount(0);
    }
  }, [survey, instanceId, storageKey]); // 依存配列にinstanceIdとstorageKeyを追加

  const handleCount = (category, item) => {
    const key = `${category}-${item}`;
    const newCounts = { ...counts, [key]: (counts[key] || 0) + 1 };
    setCounts(newCounts);
    setTotalCount(prevTotal => prevTotal + 1);
    // ---【変更点】カウントのたびにlocalStorageに保存 ---
    localStorage.setItem(storageKey, JSON.stringify(newCounts));
  };

  const handleEndSurvey = () => {
    // ---【変更点】調査終了時にlocalStorageのデータを削除 ---
    localStorage.removeItem(storageKey);
    onEndSurvey(counts);
  };

  const renderCountButtons = (category, items, buttonClass) => {
    return items.map((item, index) => {
        const key = `${category}-${item}`;
        return (
            <button key={index} className={`count-button ${buttonClass}`} onClick={() => handleCount(category, item)}>
                {item}
                <span className="count-number">{counts[key] || 0}</span>
            </button>
        );
    });
  };

  return (
    <div className="counting-container">
      <header className="counting-header">
        <h1>調査: {survey.name}</h1>
        <h2>カウント合計: {totalCount}</h2>
      </header>
      <main className="counting-main">
        <section className="count-category">
          <h3 className="real-work-header">実作業</h3>
          <div className="count-grid">
            {renderCountButtons('real', survey.realWork, 'real-work-button')}
          </div>
        </section>
        <section className="count-category">
          <h3 className="incidental-work-header">付随作業</h3>
          <div className="count-grid">
            {renderCountButtons('incidental', survey.incidentalWork, 'incidental-work-button')}
          </div>
        </section>
        <section className="count-category">
          <h3 className="wasteful-work-header">ムダ作業</h3>
          <div className="count-grid">
            {renderCountButtons('wasteful', survey.wastefulWork, 'wasteful-work-button')}
          </div>
        </section>
      </main>
      <footer className="counting-footer">
        <button className="mode-button action-button" onClick={handleEndSurvey}>調査終了</button>
        <button className="mode-button back-button" onClick={onBack}>調査選択に戻る</button>
      </footer>
    </div>
  );
};

export default CountingScreen;