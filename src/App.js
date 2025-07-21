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
import PresetScreen from './components/PresetScreen';
import UserManagementScreen from './components/UserManagementScreen';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [currentScreen, setCurrentScreen] = useState('main');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyResults, setSurveyResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [activeInstanceId, setActiveInstanceId] = useState(null);
  const [isResultReadOnly, setIsResultReadOnly] = useState(false);


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
        setIsResultReadOnly(true);
        setCurrentScreen('results');
    } else {
        alert("元の調査テンプレートが見つかりませんでした。");
    }
  };

  const handleEdit = (mode, item) => {
    setEditingItem(item);
    setCurrentScreen(mode === 'surveys' ? 'register' : 'preset');
  };

  const handleBackFromForm = () => {
    setEditingItem(null);
    setCurrentScreen('main');
  };

  const handleSelectSurvey = (surveyTemplate, instanceId) => {
    setSelectedSurvey(surveyTemplate);
    setActiveInstanceId(instanceId);
    setCurrentScreen('counting');
  };
  
  const handleEndSurvey = (counts) => {
    setSurveyResults(counts);
    setIsResultReadOnly(false);
    setCurrentScreen('results');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'register':
        return <RegisterScreen onBack={handleBackFromForm} editingItem={editingItem} />;
      case 'preset':
        return <PresetScreen onBack={handleBackFromForm} editingItem={editingItem} />;
      case 'survey':
        return <SurveySelectionScreen onBack={() => setCurrentScreen('main')} onSelectSurvey={handleSelectSurvey} />;
      case 'counting':
        return <CountingScreen survey={selectedSurvey} instanceId={activeInstanceId} onBack={() => setCurrentScreen('survey')} onEndSurvey={handleEndSurvey} />;
      case 'results':
        return <ResultsScreen 
                    survey={selectedSurvey} 
                    results={surveyResults}
                    instanceId={activeInstanceId}
                    isReadOnly={isResultReadOnly}
                    onBack={() => isResultReadOnly ? setCurrentScreen('summary') : setCurrentScreen('counting')} 
                    onReturnToMain={() => setCurrentScreen('main')} 
                />;
      case 'summary':
        return <SummaryScreen onBack={() => setCurrentScreen('main')} onShowResults={handleShowResults} />;
      case 'data_management':
        return <DataManagementScreen onBack={() => setCurrentScreen('main')} onEdit={handleEdit} />;
      case 'user_management':
        return <UserManagementScreen onBack={() => setCurrentScreen('main')} user={user} />;
      default:
        return <MainMenu onNavigate={setCurrentScreen} user={user} onLogout={handleLogout} />;
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
      {renderScreen()}
    </div>
  );
}

export default App;