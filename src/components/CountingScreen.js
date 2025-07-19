import React, { useState, useEffect } from 'react';

const CountingScreen = ({ survey, onEndSurvey, onBack }) => {
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const initialCounts = {};
    const allItems = [...survey.realWork, ...survey.incidentalWork, ...survey.wastefulWork];
    allItems.forEach(item => {
      initialCounts[item] = 0;
    });
    setCounts(initialCounts);
    setTotalCount(0);
  }, [survey]);

  const handleCount = (item) => {
    setCounts(prevCounts => ({ ...prevCounts, [item]: prevCounts[item] + 1 }));
    setTotalCount(prevTotal => prevTotal + 1);
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
            {survey.realWork.map((item, index) => (
              <button key={index} className="count-button real-work-button" onClick={() => handleCount(item)}>
                {item}<span className="count-number">{counts[item] || 0}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="count-category">
          <h3 className="incidental-work-header">付随作業</h3>
          <div className="count-grid">
            {survey.incidentalWork.map((item, index) => (
              <button key={index} className="count-button incidental-work-button" onClick={() => handleCount(item)}>
                {item}<span className="count-number">{counts[item] || 0}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="count-category">
          <h3 className="wasteful-work-header">ムダ作業</h3>
          <div className="count-grid">
            {survey.wastefulWork.map((item, index) => (
              <button key={index} className="count-button wasteful-work-button" onClick={() => handleCount(item)}>
                {item}<span className="count-number">{counts[item] || 0}</span>
              </button>
            ))}
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