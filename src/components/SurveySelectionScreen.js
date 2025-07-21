import React, { useState, useEffect } from 'react';

const SurveySelectionScreen = ({ onBack, onSelectSurvey }) => {
  const [surveyTemplates, setSurveyTemplates] = useState([]);
  const [inProgressSurveys, setInProgressSurveys] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchTemplatesAndInProgress = async () => {
      try {
        // テンプレート一覧を取得
        const templatesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const templatesData = await templatesResponse.json();
        if (templatesResponse.ok) {
            setSurveyTemplates(templatesData);

            // 進行中の調査を取得
            const inProgressResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/survey-instances/in-progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const inProgressData = await inProgressResponse.json();
            if (inProgressResponse.ok) {
                const populatedInstances = inProgressData.map(instance => {
                    const template = templatesData.find(t => t.id === instance.surveyTemplateId);
                    return { ...instance, name: template ? template.name : '不明な調査' };
                });
                setInProgressSurveys(populatedInstances);
            }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    
    fetchTemplatesAndInProgress();
  }, []);


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
                // ---【変更点】テンプレートの名前も渡す ---
                body: JSON.stringify({ 
                    surveyTemplateId: surveyTemplate.id,
                    surveyTemplateName: surveyTemplate.name 
                })
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