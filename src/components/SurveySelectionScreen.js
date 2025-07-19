import React, { useState, useEffect } from 'react';

const SurveySelectionScreen = ({ onBack, onSelectSurvey }) => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '調査リストの取得に失敗しました。');
        }
        const surveyList = await response.json();
        setSurveys(surveyList);
      } catch (error) {
        console.error("Error fetching surveys: ", error);
        alert(error.message);
      }
    };
    fetchSurveys();
  }, []);

  return (
    <div className="screen-container">
      <h1>調査を選択</h1>
      <div className="survey-grid">
        {surveys.map(survey => (
          <button key={survey.id} className="survey-select-button" onClick={() => onSelectSurvey(survey)}>
            {survey.name}
          </button>
        ))}
      </div>
      <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
    </div>
  );
};

export default SurveySelectionScreen;