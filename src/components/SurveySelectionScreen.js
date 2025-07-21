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

  // ---【変更点】調査インスタンスを作成する処理を追加 ---
  const handleSelect = async (surveyTemplate) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }

    if (window.confirm(`「${surveyTemplate.name}」の調査を開始しますか？`)) {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/survey-instances`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ surveyTemplateId: surveyTemplate.id })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '調査の開始に失敗しました。');
            }

            // 成功したら、テンプレート情報と新しいインスタンスIDを渡して画面遷移
            onSelectSurvey(surveyTemplate, data.instanceId);

        } catch (error) {
            console.error("Error starting survey instance:", error);
            alert(error.message);
        }
    }
  };


  return (
    <div className="screen-container">
      <h1>調査を選択</h1>
      <div className="survey-grid">
        {surveys.map(survey => (
          <button key={survey.id} className="survey-select-button" onClick={() => handleSelect(survey)}>
            {survey.name}
          </button>
        ))}
      </div>
      <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
    </div>
  );
};

export default SurveySelectionScreen;