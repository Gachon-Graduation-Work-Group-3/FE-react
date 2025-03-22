import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from './context/UserContext';

const BASE_URL = 'https://rakunko.store';

function ChatRooms() {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const { user, isAuthenticated } = useUser();
    const navigate = useNavigate();
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});

    
    // 웹소켓 연결
    const connectWebSocket = useCallback(() => {
        if (isAuthenticated && !connected && user?.userId && !stompClient.current) {
            const socket = new SockJS(`${BASE_URL}/ws/chat`);
            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'credentials': 'include',
                },
                debug: (str) => {
                    console.log('STOMP: ' + str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 5000,
                heartbeatOutgoing: 5000,
                connectionTimeout: 10000
            });

            stompClient.current.onConnect = () => {
                setConnected(true);
                console.log('웹소켓 연결 성공');
                
                // 사용자 개인 메시지 큐 구독
                stompClient.current.subscribe(
                    `/queue/chat.user.${user.userId}`, 
                    handleNewMessage
                );
            };

            stompClient.current.onStompError = (frame) => {
                console.error('STOMP 에러:', frame);
                setConnected(false);
                setTimeout(() => {
                    if (!connected) {
                        connectWebSocket();
                    }
                }, 5000);
            };

            stompClient.current.onWebSocketClose = () => {
                console.log('웹소켓 연결 끊김');
                setConnected(false);
                setTimeout(() => {
                    if (!connected) {
                        connectWebSocket();
                    }
                }, 5000);
            };

            stompClient.current.activate();
        }
    }, [isAuthenticated, user?.userId, connected]);

    // 채팅방 구독
    const subscribeToChatRoom = useCallback((roomId) => {
        if (connected && stompClient.current) {
            stompClient.current.subscribe(
                `/sub/${roomId}`, 
                handleNewMessage
            );
            console.log(`채팅방 ${roomId} 구독 완료`);
        }
    }, [connected]);

    // 새 메시지 처리
    const handleNewMessage = (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('새 메시지 수신:', receivedMessage);
        receivedMessage.message = JSON.parse(receivedMessage.message);
        console.log(receivedMessage.message);

        setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: receivedMessage.content || receivedMessage.message.content,
            sender: receivedMessage.sender === user.userId ? "user" : "other",
            timestamp: new Date().toLocaleString()
        }]);
        
    };

    // 채팅방 목록 로드
    const loadChatRooms = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/chat/room/info/?page=0&size=5`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('채팅방 목록 조회 실패');
            }

            const data = await response.json();
            console.log(data);
            if (data.isSuccess) {
                setChatRooms(data.result.content);
            }
        } catch (error) {
            console.error('채팅방 목록 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 채팅 내역 로드
    const loadChatHistory = async (roomId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/chat/message/?roomId=${roomId}&page=0&size=20`, 
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('채팅 내역 조회 실패');
            }

            const data = await response.json();
            if (data.isSuccess) {
                const messages = data.result.chatMessages.content.map(msg => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.senderId === user?.userId ? "user" : "other",
                    timestamp: new Date(msg.timestamp).toLocaleString()
                }));
                setMessages(messages);
            }
        } catch (error) {
            console.error('채팅 내역 로드 실패:', error);
        }
    };

    // 읽지 않은 메시지 수 조회
    const loadUnreadCounts = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/chat/unread`, 
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.isSuccess) {
                    setUnreadCounts(data.result);
                }
            }
        } catch (error) {
            console.error('읽지 않은 메시지 수 조회 실패:', error);
        }
    };

    // 메시지 읽음 처리
    const markAsRead = async (roomId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/chat/read/${roomId}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.ok) {
                // 읽지 않은 메시지 수 업데이트
                setUnreadCounts(prev => ({
                    ...prev,
                    [roomId]: 0
                }));
            }
        } catch (error) {
            console.error('읽음 처리 실패:', error);
        }
    };

    // 채팅방 선택
    const selectRoom = async (room) => {
        setSelectedRoom(room);
        subscribeToChatRoom(room.roomId);
        await loadChatHistory(room.roomId);
        await markAsRead(room.roomId);
    };

    // 메시지 전송
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && connected && selectedRoom) {
            const messageData = {
                content: newMessage,
                roomId: selectedRoom.roomId,
                timestamp: new Date().toISOString()
            };

            try {
                stompClient.current.publish({
                    destination: `/pub/${selectedRoom.roomId}/${user.userId}`,
                    body: JSON.stringify(messageData)
                });

                setNewMessage('');
            } catch (error) {
                console.error('메시지 전송 실패:', error);
            }
        }
    };

    useEffect(() => {
        let reconnectInterval;

        if (isAuthenticated && user?.userId) {
            connectWebSocket();
            loadChatRooms();

            // 연결 상태 체크 및 재연결
            reconnectInterval = setInterval(() => {
                if (!connected && stompClient.current === null) {
                    console.log('재연결 시도...');
                    connectWebSocket();
                }
            }, 10000);
        }

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
                setConnected(false);
                stompClient.current = null;
            }
            clearInterval(reconnectInterval);
        };
    }, [isAuthenticated, user?.userId]);

    return (
        <div className="chat-rooms-container">
            <div className="chat-rooms-list">
                <h2>내 채팅 목록</h2>
                {loading ? (
                    <p>로딩 중...</p>
                ) : (
                    chatRooms.map(room => (
                        <div 
                            key={room.roomId} 
                            className={`chat-room-item ${selectedRoom?.roomId === room.roomId ? 'selected' : ''}`}
                            onClick={() => selectRoom(room)}
                        >
                            <div className="chat-room-info">
                                <div className="chat-room-details">
                                    <h3>{room.name}</h3>
                                    {unreadCounts[room.roomId] > 0 && (
                                        <span className="unread-badge">
                                            {unreadCounts[room.roomId]}
                                        </span>
                                    )}
                                </div>
                                <img 
                                    src={room.picture || '/default-profile.png'} 
                                    alt="프로필" 
                                    className="chat-profile-image"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
            {selectedRoom && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>{selectedRoom.name}</h3>
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
        </div>
    );
}

export default ChatRooms;