import React from 'react';

const MainMenu = ({ onNavigate, user, onLogout }) => {
    const isMaster = user.role === 'master';
    const isSuper = user.role === 'super';

    return (
        <div className="mode-selection-container">
            <h2>モードを選ぶ</h2>
            
            {/* ---【変更点】master権限の場合のみ表示 --- */}
            {isMaster && (
                <>
                    <button className="mode-button" onClick={() => onNavigate('register')}>登録</button>
                    <button className="mode-button" onClick={() => onNavigate('preset')}>プリセット登録</button>
                </>
            )}

            {/* ---【変更点】masterまたはuser権限の場合のみ表示 --- */}
            {!isSuper && (
                <button className="mode-button" onClick={() => onNavigate('survey')}>調査</button>
            )}

            {/* ---【変更点】master権限の場合のみ表示 --- */}
            {isMaster && (
                <>
                    <button className="mode-button" onClick={() => onNavigate('summary')}>集計</button>
                    <button className="mode-button" onClick={() => onNavigate('data_management')}>データ管理</button>
                </>
            )}

            {/* ---【変更点】masterまたはsuper権限の場合のみ表示 --- */}
            {(isMaster || isSuper) && (
                <button className="mode-button" onClick={() => onNavigate('user_management')}>ユーザー管理</button>
            )}

            <button className="mode-button" onClick={onLogout}>終了</button>
        </div>
    );
};

export default MainMenu;