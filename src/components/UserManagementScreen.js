import React, { useState, useEffect } from 'react';
import './UserManagementScreen.css'; // CSSをインポート

// ユーザー作成・編集用のモーダルコンポーネント
const UserModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: user ? user.name : '',
        userId: user ? user.userId : '',
        password: '',
        role: user ? user.role : 'user',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isEditing = !!user;

    return (
        <div className="modal-backdrop">
            <form className="modal-content" onSubmit={handleSubmit}>
                <h2>{isEditing ? 'ユーザー編集' : '新規ユーザー作成'}</h2>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="氏名" required />
                <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder="ユーザーID" required />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'パスワード (変更する場合のみ入力)' : 'パスワード'} required={!isEditing} />
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="user">使用者</option>
                    <option value="master">マスター</option>
                </select>
                <div className="form-actions">
                    <button type="submit" className="mode-button action-button">{isEditing ? '更新' : '作成'}</button>
                    <button type="button" className="mode-button back-button" onClick={onClose}>キャンセル</button>
                </div>
            </form>
        </div>
    );
};


const UserManagementScreen = ({ onBack }) => {
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'ユーザーリストの取得に失敗しました。');
            setUsers(data);
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSaveUser = async (userData) => {
        const token = localStorage.getItem('token');
        const isEditing = !!editingUser;
        const url = isEditing 
            ? `${process.env.REACT_APP_API_URL}/api/users/${editingUser.id}`
            : `${process.env.REACT_APP_API_URL}/api/users`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            alert(data.message);
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers(); // リストを更新
        } catch (error) {
            alert(error.message);
        }
    };
    
    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert('削除するユーザーを選択してください。');
        if (!window.confirm(`選択した ${selectedIds.length} 件のユーザーを本当に削除しますか？`)) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ids: selectedIds })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            alert(data.message);
            setSelectedIds([]);
            fetchUsers(); // リストを更新
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <>
            {isModalOpen && <UserModal user={editingUser} onSave={handleSaveUser} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} />}
            <div className="data-management-container">
                <div className="user-management-header">
                    <h1>ユーザー管理</h1>
                    <button className="mode-button action-button" onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>新規作成</button>
                </div>
                <div className="data-list">
                    {users.map(user => (
                        <div key={user.id} className="data-item">
                            <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} />
                            <span className="data-name">{user.name} ({user.userId})</span>
                            <span className="data-date">役割: {user.role}</span>
                            <button className="mode-button edit-button" onClick={() => { setEditingUser(user); setIsModalOpen(true); }}>編集</button>
                        </div>
                    ))}
                </div>
                <footer className="data-management-footer">
                    <button className="mode-button delete-button" onClick={handleDelete}>選択した項目を削除</button>
                    <button className="mode-button back-button" onClick={onBack}>メインメニューに戻る</button>
                </footer>
            </div>
        </>
    );
};

export default UserManagementScreen;