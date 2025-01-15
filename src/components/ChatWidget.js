import React, { useState, useEffect } from 'react';
import './ChatWidget.css';

function ChatWidget({ initialMessage, context, source }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: initialMessage || "메시지를 입력하세요.", 
            sender: "system", 
            timestamp: "2024-12-18" 
        }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([...messages, {
                id: messages.length + 1,
                text: newMessage,
                sender: "user",
                timestamp: new Date().toLocaleDateString()
            }]);
            setNewMessage('');
        }
    };

    useEffect(() => {
        if (context === 'car-description') {
            console.log('Car description context');
        }
    }, [context]);

    if (source !== '얼마일카') {
        return null;
    }

    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>데이터허브</h3>
                        <button onClick={toggleChat} className="close-button">×</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="timestamp">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="메시지를 입력하세요"
                        />
                        <button type="submit">전송</button>
                    </form>
                </div>
            )}
            <button onClick={toggleChat} className="chat-toggle">
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
}

export default ChatWidget; 