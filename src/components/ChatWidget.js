import React, { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from '../context/UserContext';
import './ChatWidget.css';

const BASE_URL = 'https://rakunko.store';
const user2Id = 4;
function ChatWidget({ initialMessage, otherUserId: initialOtherUserId, source, carId }) {
    const { user, isAuthenticated } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const messagesRef= useRef([]);
    const [newMessage, setNewMessage] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [otherUserId, setOtherUserId] = useState(initialOtherUserId);
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const initialMessageApplied = useRef(false);
    const componentMountCount = useRef(0);
    useEffect(() => {
        // 마운트 카운트 증가
        componentMountCount.current += 1;
        console.log(`ChatWidget 마운트 횟수: ${componentMountCount.current}`);
        
        // messagesRef 초기화 (이전 값이 남아있을 수 있으므로)
        messagesRef.current = [];
        
        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log('ChatWidget 언마운트');
        };
    }, []);

    useEffect(()=>{
        if(!initialMessageApplied.current&& initialMessage){
            const initialMsg = {
                id: 1,
                text: initialMessage || "메시지를 입력하세요.",
                sender: "system",
                timestamp: new Date() ? new Date().toLocaleString() : '시간 정보 없음'
            };
            setMessages([initialMsg]);
            messagesRef.current = [initialMsg];
            initialMessageApplied.current = true;
        }
    },[initialMessage]);

    // 웹소켓 연결 함수
    const connectWebSocket = useCallback(() => {
        console.log('웹소켓 연결 시도');
        console.log('connectWebSocket 실행시 메시지 배열:', [...messagesRef.current]);
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
                reconnectDelay: 4000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectionTimeout: 10000
            });

            stompClient.current.onConnect = () => {
                setConnected(true);
                console.log('웹소켓 연결 성공');
                console.log('웹소켓 성공시 메시지 배열:', [...messagesRef.current]);
                // 사용자 개인 메시지 큐 구독
                stompClient.current.subscribe(
                    `/queue/chat.user.${user.userId}`, 
                    handleNewMessage
                );
                if(roomId){
                    subscribeToChatRoom(roomId);
                }
            };

            stompClient.current.onStompError = (frame) => {
                console.error('STOMP 에러:', frame);
                setConnected(false);
                // 재연결 시도
                setTimeout(() => {
                    if (!connected) {
                        connectWebSocket();
                    }
                }, 5000);
            };

            stompClient.current.onWebSocketClose = () => {
                console.log('웹소켓 연결 끊김');
                setConnected(false);
                // 재연결 시도
                setTimeout(() => {
                    if (!connected) {
                        connectWebSocket();
                    }
                }, 5000);
            };

            stompClient.current.activate();
        }
    }, [isAuthenticated, user?.userId,connected]);

    // 인증 상태 변경 시에만 웹소켓 연결
    useEffect(() => {
        console.log('초기 useEffect 실행시 메시지 배열:', [...messagesRef.current]);
        if (isAuthenticated && user?.userId) {
            connectWebSocket();
        }
        
        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
                setConnected(false);
                stompClient.current = null;
            }
        };
    }, [isAuthenticated, user?.userId]);

    // 채팅방 입장 시 추가 구독
    const subscribeToChatRoom = useCallback((roomId) => {
        if (connected && stompClient.current) {
            stompClient.current.subscribe(
                `/sub/${roomId}`, 
                handleNewMessage
            );
            console.log(`채팅방 ${roomId} 구독 완료`);
        }
    }, [connected]);


    const handleNewMessage = (message) => {
        try {
            console.log('메시지 수신됨:', message);
            const receivedMessage = JSON.parse(message.body);
            console.log('파싱된 메시지:', receivedMessage.message);
            
            // 메시지 형식에 따른 조건부 처리
            let messageContent;
            try {
                const showmessage = JSON.parse(receivedMessage.message);
                messageContent = showmessage.content;
            } catch {
                // 직접 메시지 내용이 있는 경우
                messageContent = receivedMessage.message || receivedMessage.content;
            }
            console.log('표시할 메시지 내용:', messageContent);
            console.log('업데이트 전 메시지 배열:', [...messagesRef.current]);
            // 상태 업데이트 전에 메시지 형식 확인
            if (messageContent) {
                const currentMessages=[...messagesRef.current];
                const newMessage = {
                    id: currentMessages.length + 1,
                    text: messageContent,
                    sender: receivedMessage.sender === user.userId ? "user" : "other",
                    timestamp: new Date() ? new Date().toLocaleString() : '시간 정보 없음'
                };
                console.log('새 메시지 추가:', newMessage);
                currentMessages.push(newMessage);
                messagesRef.current=currentMessages;

                setMessages(prev => {
                    const updatedMessages = [...prev, newMessage];
                    messagesRef.current = updatedMessages;
                    return updatedMessages;
                });
                console.log('업데이트 후 메시지 배열:', [...messagesRef.current]);
            }
        } catch (error) {
            console.error('메시지 처리 중 오류:', error);
            console.error('원본 메시지:', message);
        }
    };

    // const loadChatHistory = async (roomId) => {
    //     try {
    //         const response = await fetch(
    //             `${BASE_URL}/api/chat/message/?roomId=${roomId}&page=0&size=20`, 
    //             {
    //                 method: 'GET',
    //                 credentials: 'include',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                 }
    //             }
    //         );

    //         if (!response.ok) {
    //             throw new Error('채팅 내역 조회 실패');
    //         }

    //         const data = await response.json();
    //         console.log(data);
    //         if (data.isSuccess) {
    //             const messages = data.result.chatMessages.content.map(msg => ({
    //                 id: msg.id,
    //                 text: msg.message,
    //                 sender: msg.senderId === user?.userId ? "user" : "other",
    //                 timestamp: new Date(msg.timestamp).toLocaleString()
    //             }));
    //             setMessages(messages);
    //         }
    //     } catch (error) {
    //         console.error('채팅 내역 로드 실패:', error);
    //     }
    // };

    const initializeChat = async () => {
        console.log('initializeChat 실행시 메시지 배열:', [...messagesRef.current]);
        try {
            // 1. 채팅방 존재 여부 확인
            const response = await fetch(`${BASE_URL}/api/chat/room/?page=0&size=5`, {
                method: 'GET',
                credentials: 'include'
            });
            console.log("토글버튼 클릭 챗 초기화")
            const data = await response.json();


            console.log(data)
            if (data.isSuccess) {
                const existRoom = data.result.content.find(room => room.user2Id === user2Id);

                if (existRoom) {
                    console.log("채팅방 존재")
                    setRoomId(existRoom.roomId);
                    setOtherUserId(existRoom.user2Id);
                    subscribeToChatRoom(existRoom.roomId);
                    //await loadChatHistory(existRoom.roomId);
                } else {
                    console.log("채팅방 없음")
                    // 채팅방이 없는 경우, 새로운 채팅방 생성
                    const createResponse = await fetch(`${BASE_URL}/api/chat/room/?user2Id=4`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ carId: carId })
                });
                if(createResponse.status === 200){
                    const roomListResponse = await fetch(`${BASE_URL}/api/chat/room/?page=0&size=5`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    const roomListData = await roomListResponse.json();
                    console.log(roomListData);
                    if(roomListData.isSuccess){
                        const newRoom = roomListData.result.content.find(room => room.user2Id === user2Id);
                        if(newRoom){
                            setRoomId(newRoom.roomId);
                            setOtherUserId(newRoom.user2Id);
                            subscribeToChatRoom(newRoom.roomId);

                            //await loadChatHistory(newRoom.roomId);
                        }
                    }
                }
                
                
            }

        } 
        
    }catch(error){
        console.error('채팅 초기화 실패:', error);
        alert('채팅 연결에 실패했습니다.');
    }
}
    const handleSubmit = async (e) => {
        console.log('보내기 버튼 눌렀을 떄 메시지 배열:', [...messagesRef.current]);
        console.log(`ChatWidget 마운트 횟수: ${componentMountCount.current}`);
        e.preventDefault();
        if (newMessage.trim() && connected && roomId) {
            const messageData = {
                content: newMessage,
                roomId: roomId,
                timestamp: new Date() ? new Date().toISOString() : null
            };

            try {
                console.log('메시지 전송 정보:', {
                    roomId: roomId,
                    userId: user.userId,
                    message: newMessage
                });
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

    
    useEffect(() => {
        // 메시지 배열 변경 시 로그 출력
        console.log('메시지 배열 변경시 messages:', messages);
        console.log('메시지 배열 변경시 [...messagesRef.current]:', [...messagesRef.current]);
        
        // 스크롤을 항상 최신 메시지로 이동
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>채팅방</h3>
                        <button onClick={toggleChat} className="close-button">×</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="timestamp">{msg.timestamp || '시간 정보 없음'}</span>
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