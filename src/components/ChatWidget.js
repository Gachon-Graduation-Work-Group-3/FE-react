import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { UserContext } from '../context/UserContext';
import './ChatWidget.css';
import api from '../api/axiosInstance';
const BASE_URL = 'https://rakunko.store';
function ChatWidget({ initialMessage, sellerId, source, carId }) {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('token');
    const { logout, refreshUserToken } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const messagesRef= useRef([]);
    const [newMessage, setNewMessage] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [otherUserId, setOtherUserId] = useState(sellerId);
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const [isComponentMounted, setIsComponentMounted] = useState(true);
    const initialMessageApplied = useRef(false);
    const hasConnected = useRef(false);

    const componentMountCount = useRef(0);
    let connectionCount = 0;
    const chatWidgetRef = useRef(null);
    const stompClinet = useRef(null);
    const stompAttempted = useRef(false);
    //마운트 카운트
      // 스크롤 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    // 메시지 목록이 업데이트될 때마다 스크롤
    useEffect(() => {
        scrollToBottom();
      }, [messages]); // messages 배열이 변경될 때마다 실행

      useEffect(() => {
        if (sellerId) {
          console.log('sellerId 변경됨:', sellerId);
          setOtherUserId(sellerId);
        }
      }, [sellerId]);
    // STOMP 연결 끊는 함수
    const disconnectStomp = () => {
        if (stompClient.current) {
          // 재연결 시도를 막기 위한 설정
          stompClient.current.configure({
            brokerURL: 'https://rakunko.store/ws',
            reconnectDelay: 0,  // 재연결 시도 안 함
            heartbeatIncoming: 0,
            heartbeatOutgoing: 0
          });
          
          stompClient.current.deactivate();
          stompClient.current = null;
          console.log('STOMP 연결 종료');
        }
      };


    //초기 메시지 세팅 함수
    useEffect(()=>{
        if(!initialMessageApplied.current&& initialMessage){
            const initialMsg = {
                id: 0,
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
        if (stompAttempted.current) {
            console.log('이미 STOMP 연결 시도함, 중복 연결 방지');
            return;
        }
        
        console.log('웹소켓 연결 시도');
        if (isAuthenticated && user?.userId) {
            stompAttempted.current = true; // 연결 시도 표시
            
            const socket = new SockJS(`${BASE_URL}/ws/chat`);
            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
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
                console.log(user.userId)
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
                if(!isComponentMounted){
                    console.log('stomp에러 '+isComponentMounted)
                    return;
                }else{
                    setConnected(false);
                    // 토큰 갱신 후 재연결 시도
                    refreshUserToken().then(() => {
                        // 토큰 갱신 성공 후 바로 재연결 시도
                        if (!connected) {
                            connectWebSocket();
                        }
                    }).catch(error => {
                        console.error('토큰 갱신 실패:', error);
                        // 실패시 5초 후 재시도
                        setTimeout(() => {
                            if (!connected) {
                                connectWebSocket();
                            }
                        }, 5000);
                    });
                }
                
            };
            stompClient.current.activate();
        } else {
            console.log('인증 정보 부족, STOMP 연결 불가');
        }
    }, [isAuthenticated, user?.userId]);

    // 인증 상태 변경 시에만 웹소켓 연결
    useEffect(() => {
        console.log('ChatWidget 마운트, 인증 상태:', isAuthenticated);
        
        // 마운트 시 그리고 인증 정보가 있을 때만 연결 시도
        if (isAuthenticated && user?.userId && !stompClient.current) {
            connectWebSocket();
        }
        
        return () => {
            console.log('ChatWidget 언마운트, STOMP 연결 종료');
            if (stompClient.current) {
                stompClient.current.deactivate();
                stompClient.current = null;
                stompAttempted.current = false; // 언마운트 시 재설정
            }
        };
    }, [isAuthenticated, user?.userId, connectWebSocket]);



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
                // 중복 메시지인지 확인 (같은 내용, 같은 시간의 메시지 필터링)
                const isDuplicate = messagesRef.current.some(msg => 
                    msg.text === messageContent && 
                    msg.timestamp === new Date().toLocaleString()
                );
                
                if (!isDuplicate) {
                    const newMessage = {
                        id: Date.now() + Math.random(), // 유니크 ID 생성
                        text: messageContent,
                        sender: receivedMessage.sender === user.userId ? "sent" : "received",
                        timestamp: new Date().toLocaleString()
                    };
                    
                    // 한 번만 업데이트
                    setMessages(prev => {
                        const updatedMessages = [...prev, newMessage];
                        messagesRef.current = updatedMessages;
                        return updatedMessages;
                    });
                }
            }
        } catch (error) {
            console.error('메시지 처리 중 오류:', error);
            console.error('원본 메시지:', message);
        }
    };

    const loadChatHistory = async (roomId) => {
        console.log('loadChatHistory 실행');
        try {
            const response = await fetch(
                `${BASE_URL}/api/chat/message/?roomId=${roomId}&page=0&size=100`, 
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                }
            );
            
            if(response.status === 401){
                await refreshUserToken();
                loadChatHistory();
                return;
            }
            else if (!response.ok) {
                throw new Error('채팅 내역 조회 실패');
            }

            const data = await response.json();
            console.log(data);
            if (data.code === "COMMON200") {
                const messages = data.result.chatMessages.content.map(msg => ({
                    id: msg.id,
                    text: JSON.parse(msg.message).content,
                    sender: msg.senderId === user?.userId ? "received" : "sent",
                    timestamp: new Date(JSON.parse(msg.message).timestamp).toLocaleString()
                }
            ));
                
                messages.reverse();
                setMessages(messages);
            }
        } catch (error) {
            console.error('채팅 내역 로드 실패:', error);
        }
    };

    const initializeChat = async () => {
        try {
            // 1. 채팅방 존재 여부 확인
            const response = await api.get(`/api/chat/room/?page=0&size=5`);
            console.log("토글버튼 클릭 챗 초기화")
            
            
            if(response.status === 401){
                logout();
                return;
            }
            console.log(response.data);
            if (response.status === 200) {
                console.log('room get 요청 성공: '+JSON.stringify(response.data.result));
                console.log('otherUserId: '+otherUserId);
                //user2(판매자)가 현재 유저가 구독한 방중에 같은 사람이 있으면 existroom에 넣는다.
                const existRoom = response.data.result.content.find(room => room.user2Id === otherUserId);
                
                if (existRoom) {
                    console.log("채팅방 존재")
                    setRoomId(existRoom.roomId);
                    setOtherUserId(existRoom.user2Id);
                    await loadChatHistory(existRoom.roomId);
                } else {
                    console.log("채팅방 없음")
                    console.log('user2Id: '+otherUserId);
                    console.log('carId: '+carId);
                    // 채팅방이 없는 경우, 새로운 채팅방 생성
                    //현재는 고정된 사용자 사용
                    const createResponse = await api.post(`/api/chat/room/?user2Id=${otherUserId}&carId=${carId}`);
                    console.log('createResponse: '+createResponse);
                if(createResponse.status === 401){
                    await refreshUserToken();
                    initializeChat();
                    return;
                }
                else if (!createResponse.ok) {
                    throw new Error('채팅방 생성 실패');
                }


                if(createResponse.status === 200){
                    const roomListResponse = await api.get(`/api/chat/room/?page=0&size=5`);
                        
                    if(roomListResponse.status === 401){
                        initializeChat();
                        return;
                    }
                    console.log(roomListResponse.data);
                    if(roomListResponse.data.code === "COMMON200"){
                        console.log('roomListResponse.data.result.content: '+roomListResponse.data.result.content);
                        const newRoom = roomListResponse.data.result.content.find(room => room.user2Id === otherUserId);
                        if(newRoom){
                            setRoomId(newRoom.roomId);
                            setOtherUserId(newRoom.user2Id);

                            await loadChatHistory(newRoom.roomId);
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
        console.log('click');
        e.preventDefault();
        console.log('connected: '+connected);
        console.log('roomId: '+roomId);
        console.log('newMessage: '+newMessage);
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
                    body: JSON.stringify(messageData),
                    routingKey: `chat.user.${user.userId}`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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

    //메시지 변경시  메시지 출력
    // useEffect(() => {
    //     // 메시지 배열 변경 시 로그 출력
    //     console.log('메시지 배열 변경시 [...messagesRef.current]:', [...messagesRef.current]);
        
    //     // 스크롤을 항상 최신 메시지로 이동
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [messages]);
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
            <button onClick={toggleChat} className="chat-toggle">
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
}

export default React.memo(ChatWidget);