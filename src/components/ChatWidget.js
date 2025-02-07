import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from '../context/UserContext';
import './ChatWidget.css';

const BASE_URL = 'https://rakunko.store';

function ChatWidget({ initialMessage, otherUserId: initialOtherUserId, source, carId }) {
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
    const [otherUserId, setOtherUserId] = useState(initialOtherUserId);
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);

    const connectWebSocket = (roomId) => {
        if (!connected) {
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

            return new Promise((resolve, reject) => {
                stompClient.current.onConnect = () => {
                    setConnected(true);
                    console.log('웹소켓 연결 성공');
                    
                    // 1. 개인 메시지 큐 구독 (현재 사용자)
                    stompClient.current.subscribe(`/queue/chat.user.${user.userId}`, handleNewMessage);
                    
                    // 2. 개인 메시지 큐 구독 (상대방)
                    stompClient.current.subscribe(`/queue/chat.user.${otherUserId}`, handleNewMessage);
                    
                    // 3. 특정 채팅방 구독
                    stompClient.current.subscribe(`/sub/${roomId}`, handleNewMessage);
                    
                    console.log(`채팅방 ${roomId} 구독 완료`);
                    resolve();
                };

                stompClient.current.onDisconnect = () => {
                    setConnected(false);
                    console.log('웹소켓 연결 해제');
                    reject(new Error('웹소켓 연결 해제'));
                };

                stompClient.current.activate();
            });
        }
    };

    const handleNewMessage = (message) => {
        try {
            const receivedMessage = JSON.parse(message.body);
            console.log('새 메시지 수신:', receivedMessage);

            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: receivedMessage.content || receivedMessage.message,
                sender: receivedMessage.senderId === user.userId ? "user" : "other",
                timestamp: new Date().toLocaleString()
            }]);
        } catch (error) {
            console.error('메시지 처리 중 오류:', error);
        }
    };

    const loadChatHistory = async (roomId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/chat/message?roomId=${roomId}&page=0&size=50`,
                { credentials: 'include' }
            );
            
            const data = await response.json();
            if (data.isSuccess) {
                setMessages(data.result.chatMessages.map(msg => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.senderId === user.userId ? 'user' : 'other',
                    timestamp: new Date(msg.createdAt).toLocaleString()
                })));
            }
        } catch (error) {
            console.error('채팅 내역 로드 실패:', error);
        }
    };

    const initializeChat = async () => {
        try {
            // 1. 채팅방 존재 여부 확인
            const response = await fetch(`${BASE_URL}/api/chat/room/${carId}`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.isSuccess) {
                const room = data.result;
                setRoomId(room.roomId);
                setOtherUserId(room.user2Id);
            } else {
                // 채팅방이 없는 경우, 새로운 채팅방 생성
                const createResponse = await fetch(`${BASE_URL}/api/chat/${otherUserId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ carId: carId })
                });
                
                const createData = await createResponse.json();
                if (createData.isSuccess) {
                    setRoomId(createData.result.roomId);
                    setOtherUserId(createData.result.user2Id);
                } else {
                    throw new Error('채팅방 생성 실패');
                }
            }

            // 채팅방이 있거나 생성된 경우
            if (roomId) {
                // 2. 먼저 웹소켓 연결 및 구독 설정
                await connectWebSocket(roomId);
                
                // 3. 연결된 후 채팅 내역 로드
                if (connected) {
                    await loadChatHistory(roomId);
                }
            }
        } catch (error) {
            console.error('채팅 초기화 실패:', error);
            alert('채팅 연결에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && connected && roomId) {
            const messageData = {
                content: newMessage,
                roomId: roomId,
                timestamp: new Date().toISOString()
            };

            try {
                // 메시지 발송
                stompClient.current.publish({
                    destination: `/pub/${roomId}/${user.userId}`,
                    body: JSON.stringify(messageData)
                });

                setNewMessage('');
            } catch (error) {
                console.error('메시지 전송 실패:', error);
                alert('메시지 전송에 실패했습니다.');
            }
        }
    };

    const toggleChat = () => {
        if (!isOpen) {
            initializeChat();
        }
        setIsOpen(!isOpen);
    };

    // 컴포넌트 언마운트 시 연결 해제
    useEffect(() => {
        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
                setConnected(false);
            }
        };
    }, []);

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