import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import RegisterScreen from './components/RegisterScreen';
import SurveySelectionScreen from './components/SurveySelectionScreen';
import CountingScreen from './components/CountingScreen';
import ResultsScreen from './components/ResultsScreen';
import SummaryScreen from './components/SummaryScreen';
import DataManagementScreen from './components/DataManagementScreen';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [currentScreen, setCurrentScreen] = useState('main');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyResults, setSurveyResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('トークン検証エラー:', error);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);


  const handleLogin = async (companyCode, userId, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyCode, userId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.message || 'ログインに失敗しました。');
        setUser(null);
      } else {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setLoginError('');
      }
    } catch (error) {
      console.error('API通信エラー:', error);
      setLoginError('サーバーに接続できません。');
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentScreen('main');
  };
  
  const handleShowResults = (result, surveys) => {
    const surveyTemplate = surveys.find(s => s.id === result.surveyId);
    if (surveyTemplate) {
        setSelectedSurvey(surveyTemplate);
        setSurveyResults(result.counts);
        setCurrentScreen('results');
    } else {
        alert("元の調査テンプレートが見つかりませんでした。");
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'register':
        return <RegisterScreen onBack={() => setCurrentScreen('main')} />;
      case 'survey':
        return <SurveySelectionScreen onBack={() => setCurrentScreen('main')} onSelectSurvey={(survey) => { setSelectedSurvey(survey); setCurrentScreen('counting'); }} />;
      case 'counting':
        return <CountingScreen survey={selectedSurvey} onBack={() => setCurrentScreen('survey')} onEndSurvey={(counts) => { setSurveyResults(counts); setCurrentScreen('results'); }} />;
      case 'results':
        return <ResultsScreen survey={selectedSurvey} results={surveyResults} onBack={() => setCurrentScreen('counting')} onReturnToMain={() => setCurrentScreen('main')} />;
      case 'summary':
        return <SummaryScreen onBack={() => setCurrentScreen('main')} onShowResults={handleShowResults} />;
      case 'data_management':
        return <DataManagementScreen onBack={() => setCurrentScreen('main')} />;
      default:
        return <MainMenu onNavigate={setCurrentScreen} user={user} />;
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="App">
       <header className="app-header">
         <span>ようこそ {user.name}さん ({user.role})</span>
         <button onClick={handleLogout} className="mode-button back-button">ログアウト</button>
       </header>
      {renderScreen()}
    </div>
  );
}

export default App;