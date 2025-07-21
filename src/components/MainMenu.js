import React from 'react';

const MainMenu = ({ onNavigate, user, onLogout }) => {
    // master または super 権限があるかどうかを判定
    const hasAdminRights = user.role === 'master' || user.role === 'super';

    return (
        <div className="mode-selection-container">
            <h2>モードを選ぶ</h2>
            
            {/* master/super権限の場合のみ表示 */}
            {hasAdminRights && (
                <button className="mode-button" onClick={() => onNavigate('register')}>登録</button>
            )}

            {/* 全ユーザーが表示可能 */}
            <button className="mode-button" onClick={() => onNavigate('survey')}>調査</button>

            {/* master/super権限の場合のみ表示 */}
            {hasAdminRights && (
                <>
                    <button className="mode-button" onClick={() => onNavigate('summary')}>集計</button>
                    <button className="mode-button" onClick={() => onNavigate('data_management')}>データ管理</button>
                </>
            )}

            {/* ---【変更点】onClickイベントをonLogoutに変更 --- */}
            <button className="mode-button" onClick={onLogout}>終了</button>
        </div>
    );
};

export default MainMenu;