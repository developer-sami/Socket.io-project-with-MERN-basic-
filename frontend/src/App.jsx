import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { io } from "socket.io-client";
import axios from 'axios';

// Create a Socket.IO client
const socket = io('http://localhost:4000');

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:4000/api/v1/message' : '/api/v1/message',
});

const App = () => {
  // Create state variables
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [createUserName, setCreateUserName] = useState('');
  const [typing, setTyping] = useState();

  // Create a reference to the last message element
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if the username is saved in localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }


    // Connect to the Socket.IO server

    socket.on('connect', async () => {
      await api.get('/all')
        .then(res => {
          setMessages(res.data[0]);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
    // Listen for events
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('receiveMessage', (data) => {
      setMessages((messages) => [...messages, data.data]);
    });

    socket.on('typing', (data) => {
      setTyping(data);
    });

    socket.on('stopTyping', () => {
      setTyping('');
    });

    return () => {
      // Disconnect from the Socket.IO server
      socket.disconnect();
    };
  }, []);


  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, messages]);


  // Handle send messages
  const sendMessage = () => {
    // Prevent empty messages
    if (message === "" || username === "") return;

    // store message on the database
    api.post('/send', { username, message })
      .then(res => {
        console.log('Response Data:', res.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    // Send message
    socket.emit('sendMessage', { username, message });
    setMessage("");
  };


  // Handle username
  const handleUsername = () => {
    setUsername(createUserName);
    // Save the username to localStorage
    localStorage.setItem('username', createUserName);
  }


  // Handle typing
  const handleTyping = () => {
    socket.emit('startTyping', username);
    // Clear the typing timeout to reset the typing period
    setTimeout(() => {
      socket.emit('stopTyping');
    }, 1000);
  }


  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  // delete database
  const deleteAllMessages = async () => {
    await api.delete('/delete')
      .then(res => {
        alert(res.data.message);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <>
      <div className='info'>
        <p style={{ color: "red" }}>This app is made by <a href="https://github.com/developer-sami">SAMI.</a></p>
        <p>Note: This is a simple example of how to use socket.io in MERN stack.</p>
      </div>
      <br />
      <br />
      <br />
      <div>
        <h1>A simple app using socket.io</h1>
        <p>This app is a basic demonstration of socket.io in MERN stack.</p>
      </div>

      <br />
      {username &&
        <>
          {messages.length > 0 && messages.map((msg, index) => (
            <div key={index}>
              <p style={{ color: msg.username === username ? "green" : "red", fontSize: "20px", marginTop: "7px", textTransform: "uppercase", fontWeight: "bold" }}>{msg.username} <span style={{ textTransform: "Capitalize", fontSize: "15px" }}> {`: ${msg.message}`}</span></p>
            </div>
          ))}
        </>
      }

      <br />
      {typing && <p>{typing} is typing...</p>}

      {username === "" ?
        <>
          <div id='set_username'>
            <input onChange={(e) => setCreateUserName(e.target.value)} type="text" id="username" placeholder="Enter your username" autoComplete="off" />
            <button onClick={() => handleUsername()}>Set</button>
          </div>
        </> :
        <>
          <div id="chat">
            <input value={message} onKeyDown={handleKeyPress} onChange={(e) => { setMessage(e.target.value), handleTyping() }} type="text" id="message" placeholder="Enter your message" autoComplete="off" />
            <button onClick={() => sendMessage()} >Send</button>
          </div>
        </>}

      <button ref={messagesEndRef} className='btn' onClick={() => { setMessages([]), deleteAllMessages() }}>Detete Database: {messages.length} items</button>

    </>
  )
}

export default App
