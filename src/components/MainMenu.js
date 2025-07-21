import React from 'react';

const MainMenu = ({ onNavigate, user, onLogout }) => {
    const hasAdminRights = user.role === 'master' || user.role === 'super';

    return (
        <div className="mode-selection-container">
            <h2>モードを選ぶ</h2>
            
            {hasAdminRights && (
                <>
                    <button className="mode-button" onClick={() => onNavigate('register')}>登録</button>
                    {/* ---【追加】--- */}
                    <button className="mode-button" onClick={() => onNavigate('preset')}>プリセット登録</button>
                </>
            )}

            <button className="mode-button" onClick={() => onNavigate('survey')}>調査</button>

            {hasAdminRights && (
                <>
                    <button className="mode-button" onClick={() => onNavigate('summary')}>集計</button>
                    <button className="mode-button" onClick={() => onNavigate('data_management')}>データ管理</button>
                </>
            )}

            <button className="mode-button" onClick={onLogout}>終了</button>
        </div>
    );
};

export default MainMenu;