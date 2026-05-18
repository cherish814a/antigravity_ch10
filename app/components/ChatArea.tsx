"use client";

import React, { useState } from 'react';
import styles from './ChatArea.module.css';
import { Settings, User, Send, Star, Sparkles, MessageSquare, Database } from 'lucide-react';

type Review = {
  id: number;
  content: string;
  title: string;
  rating: number;
  author: string;
  matchPercentage: number;
};

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  reviews?: Review[];
};

const ChatArea = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const handleIndexData = async () => {
    setIsIndexing(true);
    try {
      const res = await fetch('/api/index-data', { method: 'POST' });
      if (res.ok) {
        alert('샘플 데이터 인덱싱 완료!');
      } else {
        alert('인덱싱 실패.');
      }
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await res.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message || '응답을 가져올 수 없습니다.',
        reviews: data.results || [],
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: '검색 중 오류가 발생했습니다.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatArea}>
      <header className={styles.header}>
        <h2 className={styles.productTitle}>프리미엄 무선 이어폰 Pro</h2>
        <div className={styles.headerActions}>
          <button 
            onClick={handleIndexData} 
            disabled={isIndexing}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              padding: '6px 12px', borderRadius: '6px', 
              backgroundColor: isIndexing ? '#e5e7eb' : '#eff6ff',
              color: isIndexing ? '#9ca3af' : 'var(--primary)',
              fontSize: '13px', fontWeight: '600'
            }}
          >
            <Database size={14} />
            {isIndexing ? '인덱싱 중...' : '샘플 데이터 인덱싱'}
          </button>
          <Settings size={20} className={styles.icon} />
          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
        </div>
      </header>

      <div className={styles.chatContent}>
        {messages.length === 0 && (
          <div className={styles.welcomeSection}>
            <div className={styles.botIconLarge}>
              <Sparkles size={32} color="var(--primary)" />
            </div>
            <h1>안녕하세요!</h1>
            <p>'프리미엄 무선 이어폰 Pro' 리뷰 분석 봇입니다.</p>
            
            <div className={styles.suggestionChips}>
              <button className={styles.chip} onClick={() => setInput('운동할 때 써도 돼요?')}>운동할 때 써도 돼요?</button>
              <button className={styles.chip} onClick={() => setInput('배터리 오래 가나요?')}>배터리 오래 가나요?</button>
              <button className={styles.chip} onClick={() => setInput('통화 품질은?')}>통화 품질은?</button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? styles.messageRowUser : styles.messageRowAI}>
            {msg.role === 'ai' && (
              <div className={styles.botAvatar}>
                <MessageSquare size={16} color="var(--primary)" />
              </div>
            )}
            
            <div className={msg.role === 'ai' ? styles.aiBubbleContainer : ''}>
              <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                {msg.content}
              </div>
              
              {msg.role === 'ai' && msg.reviews && msg.reviews.length > 0 && (
                <div className={styles.referenceSection}>
                  <div className={styles.refHeader}>
                    <Sparkles size={12} />
                    <span>{msg.reviews.length}개의 리뷰 참고됨</span>
                    <span className={styles.chevron}>▾</span>
                  </div>
                  
                  <div className={styles.reviewCards}>
                    {msg.reviews.map((review, idx) => (
                      <div key={idx} className={styles.reviewCard}>
                        <div className={styles.cardHeader}>
                          <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < review.rating ? "#1a56db" : "#e5e7eb"} color={i < review.rating ? "#1a56db" : "#e5e7eb"} />
                            ))}
                          </div>
                          <span className={styles.matchBadge}>{review.matchPercentage}% 일치</span>
                        </div>
                        <p className={styles.cardText}>{review.content}</p>
                        <span className={styles.reviewer}>{review.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={styles.messageRowAI}>
            <div className={styles.botAvatar}>
              <MessageSquare size={16} color="var(--primary)" />
            </div>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <form className={styles.inputContainer} onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="리뷰 데이터에 대해 무엇이든 물어보세요..." 
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
        <p className={styles.disclaimer}>
          InsightEngine AI는 실수를 할 수 있습니다. 중요한 결정을 내리기 전에 원본 리뷰를 확인하세요.
        </p>
      </footer>
    </div>
  );
};

export default ChatArea;
