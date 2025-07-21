import React from 'react';

const ResultsScreen = ({ survey, results, onBack, onReturnToMain }) => {
  // ---【変更点】カテゴリプレフィックスを考慮した集計関数 ---
  const getSubtotal = (category, items) => {
    return items.reduce((sum, item) => {
        const key = `${category}-${item}`;
        return sum + (results[key] || 0);
    }, 0);
  };

  const realWorkSubtotal = getSubtotal('real', survey.realWork);
  const incidentalWorkSubtotal = getSubtotal('incidental', survey.incidentalWork);
  const wastefulWorkSubtotal = getSubtotal('wasteful', survey.wastefulWork);
  
  const total = realWorkSubtotal + incidentalWorkSubtotal + wastefulWorkSubtotal;
  const discoveryRate = total > 0 ? (((realWorkSubtotal * 0) + (incidentalWorkSubtotal * 0.2) + (wastefulWorkSubtotal * 0.5)) / total) * 100 : 0;

  const getEvaluationRank = (rate) => {
    if (rate < 3) return 'S';
    if (rate < 8) return 'A';
    if (rate < 13) return 'B';
    if (rate < 18) return 'C';
    return 'D';
  };
  const rank = getEvaluationRank(discoveryRate);

  const handleSaveResults = async () => {
    const resultData = {
      surveyId: survey.id,
      surveyName: survey.name,
      counts: results,
      totalCount: total,
      discoveryRate: discoveryRate,
      rank: rank,
    };

    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/results`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(resultData)
      });
      
      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || '保存中にエラーが発生しました。');
      }

      alert('調査結果を保存しました。');
      onReturnToMain();

    } catch (e) {
      console.error("Error saving result: ", e);
      alert(e.message);
    }
  };

  // ---【変更点】カテゴリプレフィックスを考慮した行レンダリング関数 ---
  const renderTableRows = (title, category, items) => (
    items.length > 0 && items.map((item, index) => {
      const key = `${category}-${item}`;
      const count = results[key] || 0;
      return (
        <tr key={`${category}-${index}`}>
          {index === 0 && <td rowSpan={items.length}>{title}</td>}
          <td>{item}</td>
          <td>{count}</td>
          <td>{total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</td>
        </tr>
      );
    })
  );

  return (
    <div className="results-container">
      <h1 className="results-title">調査結果</h1>
      <div className="results-summary">
        <div className="results-box">
          <span className="results-label">評価</span>
          <span className="results-value evaluation-rank">{rank}</span>
        </div>
        <div className="results-box">
          <span className="results-label">ムダ発見率</span>
          <span className="results-value">{discoveryRate.toFixed(1)}%</span>
        </div>
      </div>
      <table className="results-table">
        <thead>
          <tr><th>大分類</th><th>作業項目</th><th>カウント</th><th>構成比</th></tr>
        </thead>
        <tbody>
          {renderTableRows('実作業', 'real', survey.realWork)}
          {renderTableRows('付随作業', 'incidental', survey.incidentalWork)}
          {renderTableRows('ムダ作業', 'wasteful', survey.wastefulWork)}
        </tbody>
        <tfoot>
          <tr><th colSpan="2">合計</th><th>{total}</th><th>100.0%</th></tr>
        </tfoot>
      </table>
      <div className="form-actions">
        <button className="mode-button action-button" onClick={handleSaveResults}>今回の結果を保存</button>
        <button className="mode-button back-button" onClick={onReturnToMain}>調査を破棄</button>
      </div>
      <button className="mode-button" onClick={onBack}>カウント画面に戻る</button>
    </div>
  );
};

export default ResultsScreen;