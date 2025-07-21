import React, { useState, useEffect } from 'react';

const CountingScreen = ({ survey, onEndSurvey, onBack }) => {
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  // ---【変更点】初期化処理を修正 ---
  useEffect(() => {
    const initialCounts = {};
    // 各カテゴリの項目に、カテゴリ名をプレフィックスとして付けて一意なキーを作成
    survey.realWork.forEach(item => { initialCounts[`real-${item}`] = 0; });
    survey.incidentalWork.forEach(item => { initialCounts[`incidental-${item}`] = 0; });
    survey.wastefulWork.forEach(item => { initialCounts[`wasteful-${item}`] = 0; });
    
    setCounts(initialCounts);
    setTotalCount(0);
  }, [survey]);

  // ---【変更点】カウント処理のキーを一意なものに変更 ---
  const handleCount = (category, item) => {
    const key = `${category}-${item}`; // 'real-手作業' のような一意なキーを生成
    setCounts(prevCounts => ({ ...prevCounts, [key]: prevCounts[key] + 1 }));
    setTotalCount(prevTotal => prevTotal + 1);
  };

  // ---【追加】各カテゴリのボタンをレンダリングするヘルパー関数 ---
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
            {/* ---【変更点】ヘルパー関数を使ってボタンを表示 --- */}
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
        <button className="mode-button action-button" onClick={() => onEndSurvey(counts)}>調査終了</button>
        <button className="mode-button back-button" onClick={onBack}>調査選択に戻る</button>
      </footer>
    </div>
  );
};

export default CountingScreen;