import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { UserContext } from './context/UserContext';
import api from './api/axiosInstance';
import Header from './components/Header';
import './chatRoomPage.css';
const BASE_URL = 'https://rakunko.store';

function ChatRooms() {
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = JSON.parse(localStorage.getItem('userData'));
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isComponentMounted, setIsComponentMounted] = useState(false);
    const { logout } = useContext(UserContext);
    const token = localStorage.getItem('token');
    useEffect(() => {
        console.log(isAuthenticated);
        console.log(user.userId);
    }, [isAuthenticated, user]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    // 메시지 목록이 업데이트될 때마다 스크롤
    useEffect(() => {
        scrollToBottom();
      }, [messages]);
    // 웹소켓 연결
    const connectWebSocket = useCallback(() => {
        if (isAuthenticated && !connected && user?.userId && !stompClient.current) {
            const socket = new SockJS(`${BASE_URL}/ws/chat`);
            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
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
                    handleNewMessage,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
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


    // 새 메시지 처리
    const handleNewMessage = (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('새 메시지 수신:', receivedMessage);
        receivedMessage.message = JSON.parse(receivedMessage.message);
        console.log(receivedMessage.message);
        console.log(receivedMessage.senderId);
        console.log(user.userId);
        setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: receivedMessage.content || receivedMessage.message.content,
            sender: receivedMessage.senderId === user.userId ? "received" : "sent",
            timestamp: new Date().toLocaleString()
        }]);
        
    };

    // 채팅방 목록 로드
    const loadChatRooms = async () => {
        try {
            const response = await api.get(`/api/chat/room/?page=0&size=5`);
            console.log(response);
            if (response.status !== 200) {
                throw new Error('채팅방 목록 조회 실패');
            }

            console.log('채팅방 목록 로드 성공',response.data);
            if (response.data.result.content) {
                const rooms = response.data.result.content;
                const roomsWithInfo = await Promise.all(rooms.map(async (room) => {
                    try{
                        const roomInfoResponse = await api.get(`/api/chat/room/info?roomId=${room.roomId}`);
                        console.log(roomInfoResponse);
                        return {
                            ...room,    
                            info: roomInfoResponse.data.result.carSaleInfo,
                            image: roomInfoResponse.data.result.carSaleInfo.image|| '/default-profile.png',
                        };
                    } catch (error) {
                        console.error('채팅방 정보 조회 실패:', error);
                        return {
                            ...room,
                            info: null,
                            image: '/default-profile.png'
                        };
                    }
                }));
                console.log(roomsWithInfo);
                setChatRooms(roomsWithInfo);
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
            console.log(roomId);
            const response = await fetch(
                `${BASE_URL}/api/chat/message/?roomId=${roomId}&page=0&size=100`, 
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                }
            );
            const data = await response.json();
            console.log(data);
            if (data.code === "COMMON200") {
                const messages = data.result.chatMessages.content.map(msg => ({
                    id: msg.id,
                    text: JSON.parse(msg.message).content,
                    sender: msg.senderId === user?.userId ? "sent" : "received",
                    timestamp: new Date(JSON.parse(msg.message).timestamp).toLocaleString()
                }));
                messages.reverse();
                setMessages(messages);
            }
        } catch (error) {
            console.error('채팅 내역 로드 실패:', error);
        }
    };



    // 채팅방 선택
    const selectRoom = async (room) => {
        setSelectedRoom(room);
        await loadChatHistory(room.roomId);
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
                    body: JSON.stringify(messageData),
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
        //메시지 변경시  메시지 출력
        useEffect(() => {
            // 스크롤을 항상 최신 메시지로 이동
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, [messages]);

    return (
        <div className="chat-rooms-container">
            <div className="chat-rooms-header">
                <Header />
            </div>
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
                                </div>
                                <img 
                                    src={room.picture || '/default-profile.png'} 
                                    alt="프로필" 
                                    className="chat-profile-image"
                                />
                            </div>
                            {room.info && (
                   <div className="chat-car-info">
                   <img 
                       src={room.image || '/default-car.png'} 
                       alt="차량 이미지"
                       className="car-thumbnail" 
                   />
                   <div className="car-details">
                       <p className="car-name">{room.info.name}</p>
                       <p className="car-price">{room.info.price.toLocaleString()}원</p>
                       <p className="car-sub-details">{room.info.age.substring(0, 4)}년식 • {room.info.mileage.toLocaleString()}km</p>
                   </div>
                   {room.info.saleStatus && <span className="sold-badge">판매완료</span>}
               </div>
                )}
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
                        {/* 스크롤 위치를 잡기 위한 빈 div */}
                        <div ref={messagesEndRef} />
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