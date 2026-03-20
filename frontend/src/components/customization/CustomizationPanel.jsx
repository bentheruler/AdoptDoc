import { useState, useRef, useEffect } from 'react';

const WELCOME = `Hi! I'm your AI document assistant. Tell me about yourself and I'll help build your CV.\n\nTry:\n• "Change my name to Sarah Kim"\n• "Add a skill: Docker"\n• "Update my summary to focus on leadership"`;

const CustomizationPanel = ({ cvData, onCVUpdate }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      let reply = "AI chat editing is not connected yet. Use the Generate button to create the document.";
      let updatedCV = null;

      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes("change my name to")) {
        const newName = userMsg.split("to").slice(1).join("to").trim();
        if (newName) {
          updatedCV = { ...cvData, name: newName };
          reply = `Okay, I updated your name to ${newName}.`;
        }
      } else if (lowerMsg.includes("add a skill")) {
        const skill = userMsg.split(":").slice(1).join(":").trim() || userMsg.split("add a skill").slice(1).join("").trim();
        if (skill) {
          const currentSkills = Array.isArray(cvData.skills) ? cvData.skills : [];
          updatedCV = { ...cvData, skills: [...currentSkills, skill] };
          reply = `Added "${skill}" to your skills.`;
        }
      } else if (lowerMsg.includes("update my summary")) {
        const summary = userMsg.split("to").slice(1).join("to").trim();
        if (summary) {
          updatedCV = { ...cvData, summary };
          reply = "Your summary has been updated.";
        }
      }

      if (updatedCV) onCVUpdate(updatedCV);

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Please try again.' }
      ]);
    }

    setLoading(false);
  };

  const bubbleStyle = (role) => ({
    maxWidth: '90%',
    background: role === 'user' ? '#1e3a5f' : '#f1f5f9',
    color: role === 'user' ? '#fff' : '#1e293b',
    borderRadius: role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
    padding: '8px 11px',
    fontSize: 11.5,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  return (
    <div
      style={{
        width: 250,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: 0
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0
        }}
      >
        <span
          style={{
            background: '#3b82f6',
            color: '#fff',
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 10
          }}
        >
          AI
        </span>
        Document Assistant
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 0,
          paddingRight: 2
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={bubbleStyle(msg.role)}>{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                background: '#f1f5f9',
                borderRadius: '12px 12px 12px 2px',
                padding: '8px 14px',
                fontSize: 18,
                color: '#94a3b8'
              }}
            >
              ···
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask AI to update your CV..."
          rows={2}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1.5px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 12,
            color: '#1e293b',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            outline: 'none'
          }}
        />

        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#cbd5e1' : '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            width: 36,
            height: 36,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ➤
        </button>
      </div>

      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
        Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
};

export default CustomizationPanel;
