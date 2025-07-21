import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

// ---【追加】再計算のためのヘルパー関数 ---
const calculateMetrics = (surveyTemplate, counts) => {
    if (!surveyTemplate) return { total: 0, discoveryRate: 0, rank: 'N/A' };

    const getSubtotal = (category, items) => {
        return items.reduce((sum, item) => {
            const key = `${category}-${item}`;
            return sum + (counts[key] || 0);
        }, 0);
    };

    const realWorkSubtotal = getSubtotal('real', surveyTemplate.realWork);
    const incidentalWorkSubtotal = getSubtotal('incidental', surveyTemplate.incidentalWork);
    const wastefulWorkSubtotal = getSubtotal('wasteful', surveyTemplate.wastefulWork);
    
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

    return { total, discoveryRate, rank };
};


const PeriodResultsTable = ({ results }) => {
    // ---【変更点】countsだけでなく全てのキーを対象にする ---
    const allItems = [...new Set(results.flatMap(result => Object.keys(result.counts)))].sort();
    const sortedResults = [...results].sort((a, b) => new Date(a.surveyedAt) - new Date(b.surveyedAt));

    return (
        <div className="period-table-container">
            <table className="period-table">
                <thead>
                    <tr>
                        <th>調査日</th>
                        <th>調査名</th>
                        {allItems.map(item => <th key={item}>{item.split('-').slice(1).join('-')}</th>)}
                        <th>合計</th>
                        <th>ムダ発見率</th>
                        <th>評価</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedResults.map(result => (
                        <tr key={result.id}>
                            <td>{new Date(result.surveyedAt).toLocaleDateString()}</td>
                            <td>{result.surveyName}</td>
                            {allItems.map(item => <td key={item}>{result.counts[item] || 0}</td>)}
                            <td>{result.totalCount}</td>
                            <td>{result.discoveryRate.toFixed(1)}%</td>
                            <td>{result.rank}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PeriodResultsChart = ({ results }) => {
    const sortedResults = [...results].sort((a, b) => new Date(a.surveyedAt) - new Date(b.surveyedAt));
    const labels = sortedResults.map(r => new Date(r.surveyedAt).toLocaleDateString());

    const chartData = {
        labels,
        datasets: [
            {
                label: 'ムダ発見率 (%)',
                data: sortedResults.map(r => r.discoveryRate),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: '合計カウント数',
                data: sortedResults.map(r => r.totalCount),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '期間別データ推移' },
        },
    };

    return (
        <div className="chart-container">
            <Line options={options} data={chartData} />
        </div>
    );
};


const SummaryScreen = ({ onBack, onShowResults }) => {
  const [mode, setMode] = useState('daily');
  const [searchDate, setSearchDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [foundResults, setFoundResults] = useState([]);
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveyTemplates = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setSurveys(data);
        } catch (error) {
            console.error("Failed to fetch survey templates", error);
        }
    };
    fetchSurveyTemplates();
  }, []);

  const handleSearch = async (start, end) => {
      const token = localStorage.getItem('token');
      if (!token) {
          alert('認証エラー。再ログインしてください。');
          return;
      }
      try {
          const startDateISO = start.toISOString();
          const endDateISO = end.toISOString();
          
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/results?startDate=${encodeURIComponent(startDateISO)}&endDate=${encodeURIComponent(endDateISO)}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          });
          
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || '検索に失敗しました。');
          }

          // ---【変更点】APIからのデータに不足情報を追加する ---
          const processedResults = data.map(result => {
            const surveyTemplate = surveys.find(s => s.id === result.surveyId);
            const metrics = calculateMetrics(surveyTemplate, result.counts);
            return {
                ...result,
                totalCount: metrics.total,
                discoveryRate: metrics.discoveryRate,
                rank: metrics.rank
            };
          });
          
          setFoundResults(processedResults);
          if (processedResults.length === 0) {
              alert('その期間の調査結果は見つかりませんでした。');
          }
      } catch (error) {
          console.error("Error searching results:", error);
          alert(error.message);
      }
  };

  const handleDailySearch = async () => {
    if (!searchDate) { alert('日付を選択してください。'); return; }
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    handleSearch(startOfDay, endOfDay);
  };

  const handlePeriodSearch = async () => {
    if (!startDate || !endDate) { alert('開始日と終了日を選択してください。'); return; }
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    handleSearch(start, end);
  };

  return (
    <div className="summary-container">
      <header className="summary-header">
        <h1>集計</h1>
        <div className="mode-toggle">
          <button className={`toggle-button ${mode === 'daily' ? 'active' : ''}`} onClick={() => { setMode('daily'); setFoundResults([]); }}>日計</button>
          <button className={`toggle-button ${mode === 'period' ? 'active' : ''}`} onClick={() => { setMode('period'); setFoundResults([]); }}>期間計</button>
        </div>
      </header>
      <main className="summary-main">
        {mode === 'daily' && (
          <div>
            <div className="summary-form">
              <h3>日計モード</h3>
              <input type="date" className="form-input" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
              <button className="mode-button action-button" onClick={handleDailySearch}>集計開始</button>
            </div>
            <div className="search-results">
              {foundResults.map(result => (
                <div key={result.id} className="result-item" onClick={() => onShowResults(result, surveys)}>
                  <span className="result-name">{result.surveyName}</span>
                  <span className="result-time">{new Date(result.surveyedAt).toLocaleTimeString('ja-JP')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {mode === 'period' && (
          <div>
            <div className="summary-form period-form">
              <h3>期間計モード</h3>
              <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>〜</span>
              <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <button className="mode-button action-button" onClick={handlePeriodSearch}>集計開始</button>
            </div>
            {foundResults.length > 0 && (
              <div>
                <PeriodResultsTable results={foundResults} />
                <PeriodResultsChart results={foundResults} />
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="summary-footer">
        <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
      </footer>
    </div>
  );
};

export default SummaryScreen;