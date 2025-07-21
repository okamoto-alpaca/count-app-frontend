import React, { useState, useEffect } from 'react';

const SurveySelectionScreen = ({ onBack, onSelectSurvey }) => {
  const [surveyTemplates, setSurveyTemplates] = useState([]);
  const [inProgressSurveys, setInProgressSurveys] = useState([]);
  
  // 調査テンプレートと進行中の調査の両方を取得する
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // テンプレート一覧を取得
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setSurveyTemplates(data);
      } catch (error) {
        console.error("Error fetching survey templates: ", error);
      }
    };

    // 進行中の調査を取得
    const fetchInProgress = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/survey-instances/in-progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // テンプレート名を追加情報として結合しておく
                const populatedInstances = data.map(instance => {
                    const template = surveyTemplates.find(t => t.id === instance.surveyTemplateId);
                    return { ...instance, name: template ? template.name : '不明な調査' };
                });
                setInProgressSurveys(populatedInstances);
            }
        } catch (error) {
            console.error("Error fetching in-progress surveys: ", error);
        }
    };

    // テンプレートを先に取得し、その後で進行中の調査を取得
    fetchTemplates().then(fetchInProgress);

  }, [surveyTemplates]); // surveyTemplatesが更新された後、再実行


  const handleStartNew = async (surveyTemplate) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('認証エラー。再ログインしてください。');
        return;
    }

    if (window.confirm(`「${surveyTemplate.name}」の調査を新しく開始しますか？`)) {
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
            onSelectSurvey(surveyTemplate, data.instanceId);
        } catch (error) {
            console.error("Error starting survey instance:", error);
            alert(error.message);
        }
    }
  };

  const handleResume = (instance) => {
    const template = surveyTemplates.find(t => t.id === instance.surveyTemplateId);
    if (template) {
        onSelectSurvey(template, instance.id);
    } else {
        alert('元の調査テンプレートが見つかりませんでした。');
    }
  };


  return (
    <div className="screen-container">
      {/* ---【追加】進行中の調査があれば表示 --- */}
      {inProgressSurveys.length > 0 && (
        <div className="in-progress-section">
            <h2>進行中の調査</h2>
            {inProgressSurveys.map(instance => (
                <button key={instance.id} className="survey-select-button resume-button" onClick={() => handleResume(instance)}>
                    {instance.name} を再開する
                </button>
            ))}
        </div>
      )}

      <h1>新しく調査を開始</h1>
      <div className="survey-grid">
        {surveyTemplates.map(survey => (
          <button key={survey.id} className="survey-select-button" onClick={() => handleStartNew(survey)}>
            {survey.name}
          </button>
        ))}
      </div>
      <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
    </div>
  );
};

export default SurveySelectionScreen;