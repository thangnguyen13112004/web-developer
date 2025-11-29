import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Chatbox.css';

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Bạn có thể hỏi tôi hoặc gửi ảnh thuốc để tôi tìm giúp nhé.", sender: "bot", type: "text" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); // Ref cho input file ẩn
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

    // Xử lý gửi tin nhắn text
    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { text: input, sender: "user", type: "text" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.text })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { text: data.answer, sender: "bot", type: "text" }]);
        } catch (error) {
            console.error("Lỗi API:", error);
            setMessages(prev => [...prev, { text: "Lỗi kết nối AI.", sender: "bot", type: "text" }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý chọn ảnh
    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleSendImage(e.target.files[0]);
        }
    };

    // Xử lý gửi ảnh lên Server Python
    const handleSendImage = async (file) => {
        // Hiện ảnh user vừa gửi
        const imageUrl = URL.createObjectURL(file);
        setMessages(prev => [...prev, { text: "Đã gửi một ảnh...", sender: "user", type: "image", imageUrl: imageUrl }]);
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/predict-image", {
                method: "POST",
                body: formData // Gửi FormData (Multipart)
            });
            const data = await response.json();

            // Nhận kết quả
            if (data.type === 'product') {
                setMessages(prev => [...prev, { 
                    text: data.answer, 
                    sender: "bot", 
                    type: "product", 
                    product: data.product 
                }]);
            } else {
                setMessages(prev => [...prev, { text: data.answer, sender: "bot", type: "text" }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { text: "Lỗi xử lý ảnh.", sender: "bot", type: "text" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/san-pham/${productId}`); // Điều hướng sang trang chi tiết
        setIsOpen(false); // Đóng chat
    };

    return (
        <div className="chatbox-wrapper">
            {!isOpen && (
                <button className="chatbox-toggle" onClick={() => setIsOpen(true)}>
                    <i className="fa-solid fa-comments"></i>
                </button>
            )}

            {isOpen && (
                <div className="chatbox-window">
                    <div className="chatbox-header">
                        <div className="chatbox-header-title">
                            <i className="fa-solid fa-robot"></i> Trợ lý Pharmacity AI
                        </div>
                        <button className="chatbox-close" onClick={() => setIsOpen(false)}>
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>

                    <div className="chatbox-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                <div className="message-content">
                                    {/* Loại Text */}
                                    {msg.type === 'text' && msg.text}

                                    {/* Loại Image (User gửi) */}
                                    {msg.type === 'image' && (
                                        <img src={msg.imageUrl} alt="User upload" style={{maxWidth: '100%', borderRadius: '8px'}} />
                                    )}

                                    {/* Loại Product (Bot trả về) */}
                                    {msg.type === 'product' && (
                                        <div>
                                            <p>{msg.text}</p>
                                            <div 
                                                className="chat-product-card" 
                                                onClick={() => handleProductClick(msg.product.mathuoc)}
                                                style={{cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginTop: '5px', background: '#fff'}}
                                            >
                                                <img 
                                                    src={msg.product.hinhanh || 'https://placehold.co/100'} 
                                                    alt={msg.product.tenthuoc} 
                                                    style={{width: '100%', height: '100px', objectFit: 'contain'}} 
                                                />
                                                <h4 style={{fontSize: '14px', margin: '5px 0', color: '#1B51A6'}}>{msg.product.tenthuoc}</h4>
                                                <span style={{color: '#ee4d2d', fontWeight: 'bold'}}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(msg.product.giaban)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="chat-message bot"><div className="message-content typing">...</div></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbox-footer">
                        {/* Nút Upload Ảnh */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            style={{display: 'none'}} 
                            onChange={handleImageSelect}
                        />
                        <button type="button" onClick={() => fileInputRef.current.click()} style={{marginRight: '5px'}}>
                            <i className="fa-solid fa-image"></i>
                        </button>

                        <input
                            type="text"
                            placeholder="Hỏi hoặc gửi ảnh..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbox;