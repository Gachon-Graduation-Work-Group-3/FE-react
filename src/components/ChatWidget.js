import React, { useState, useEffect, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from '../context/UserContext';
import './ChatWidget.css';

const BASE_URL = 'https://rakunko.store';

function ChatWidget({ initialMessage, otherUserId, source }) {
    const {user} = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: initialMessage || "메시지를 입력하세요.", 
            sender: "system", 
            timestamp: new Date().toLocaleDateString()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [roomId, setRoomId] = useState(null);
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);

    // 웹소켓 연결 설정
    useEffect(() => {
        if (isOpen && !connected) {
            const socket = new SockJS(`${BASE_URL}/ws/chat`);
            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'credentials': 'include',
                    'userId': user.userId
                },
                debug: (str) => {
                    console.log('STOMP: ' + str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            stompClient.current.onConnect = () => {
                setConnected(true);
                console.log('웹소켓 연결 성공');
                
                // 개인 채팅 구독
                stompClient.current.subscribe(`/queue/chat.user.${user.userId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, {
                        id: prev.length + 1,
                        text: receivedMessage.content,
                        sender: "other",
                        timestamp: new Date().toLocaleDateString()
                    }]);
                });
            };

            stompClient.current.onDisconnect = () => {
                setConnected(false);
                console.log('웹소켓 연결 해제');
            };

            stompClient.current.activate();
        }

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [isOpen]);

    // 채팅방 생성
    const createChatRoom = async () => {
        try {
            console.log('채팅방 생성 시도 - 판매자 ID:', otherUserId);
            
            const response = await fetch(`https://rakunko.store/api/chat/${otherUserId}`, {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('채팅방 생성 응답:', data);
            
            if (data.isSuccess) {
                setRoomId(data.result.roomId);
                return data.result.roomId;
            } else {
                throw new Error(data.message || '채팅방 생성 실패');
            }
        } catch (error) {
            console.error('채팅방 생성 에러:', error);
            throw error;
        }
    };

    // 메시지 전송
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && connected) {
            const messageData = {
                content: newMessage,
                roomId: roomId,
                timestamp: new Date().toISOString()
            };

            try {
                // 메시지 발송
                stompClient.current.publish({
                    destination: `/pub/${roomId}`,
                    body: JSON.stringify(messageData)
                });

                // 로컬 메시지 목록 업데이트
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: newMessage,
                    sender: "user",
                    timestamp: new Date().toLocaleDateString()
                }]);
                
                setNewMessage('');
            } catch (error) {
                console.error('메시지 전송 실패:', error);
            }
        }
    };

    // 채팅 위젯 토글 함수
    const toggleChat = async () => {
        try {
            if (!user) {
                alert('로그인이 필요한 서비스입니다.');
                return;
            }

            if (!isOpen && !roomId) {
                // 채팅방이 없을 때만 생성
                await createChatRoom();
            }
            
            setIsOpen(!isOpen);
        } catch (error) {
            alert('채팅방 연결에 실패했습니다.');
            console.error('채팅 토글 에러:', error);
        }
    };



    // if (source !== '얼마일카') {
    //     return null;
    // }

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