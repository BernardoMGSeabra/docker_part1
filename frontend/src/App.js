import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const messageListRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/messages")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          scrollToBottom();
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch(error => console.error('Error fetching messages:', error));
  }, []);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      alert("Message cannot be empty");
      return;
    }

    fetch('http://localhost:5001/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage }),
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to add message");
        return response.json();
      })
      .then(data => {
        setMessages(prevMessages => [...prevMessages, data]);
        setNewMessage("");
        scrollToBottom();
      })
      .catch(error => console.error('Error adding message:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5001/api/messages/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete message");
        return response.json();
      })
      .then(() => {
        setMessages(prevMessages => prevMessages.filter(msg => msg._id !== id));
      })
      .catch(error => console.error('Error deleting message:', error));
  };

  const handleEdit = (id, currentMessage) => {
    setEditingMessageId(id);
    setEditingMessageText(currentMessage);
  };

  const handleSaveEdit = (id) => {
    if (!editingMessageText.trim()) {
      alert("Message cannot be empty");
      return;
    }

    fetch(`http://localhost:5001/api/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: editingMessageText }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update message');
        return res.json();
      })
      .then(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === id ? { ...msg, message: editingMessageText } : msg
          )
        );
        setEditingMessageId(null);
        setEditingMessageText("");
        scrollToBottom();
      })
      .catch((error) => console.error('Error updating message:', error));
  };

  return (
    <div>
      <h1>Message Board</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Add Message</button>
      </form>

      <h2>Messages:</h2>
      <div ref={messageListRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              {editingMessageId === msg._id ? (
                <>
                  <input
                    type="text"
                    value={editingMessageText}
                    onChange={(e) => setEditingMessageText(e.target.value)}
                  />
                  <button onClick={() => handleSaveEdit(msg._id)}>Save</button>
                  <button onClick={() => { setEditingMessageId(null); setEditingMessageText(""); }}>Cancel</button>
                </>
              ) : (
                <>
                  {msg.message}
                  <button onClick={() => handleEdit(msg._id, msg.message)}>Edit</button>
                  <button onClick={() => handleDelete(msg._id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
