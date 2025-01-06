const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { client, connectToDatabase } = require('./dbConnection');

const db = client.db(process.env.DB_NAME);
const messagesCollection = db.collection('messages');

const PORT = 5001;
const app = express();

connectToDatabase().then(() => {
  app.use(cors({ origin: 'http://localhost:3000' })); // Allow CORS for the frontend
  app.use(bodyParser.json()); // Parse JSON body

  // GET: Fetch all messages
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await messagesCollection.find().toArray();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    const { message } = req.body;
    if (message) {
      try {
        const result = await messagesCollection.insertOne({ message });
        const newMessage = { _id: result.insertedId, message }; // Include the ID in the response
        res.json(newMessage);
      } catch (error) {
        console.error('Error inserting message', error);
        res.status(500).json({ error: 'Database error' });
      }
    } else {
      res.status(400).json({ error: 'Message is required' });
    }
  });

  // PUT: Update an existing message
  app.put('/api/messages/:id', async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
  
    if (!message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
  
    try {
      const result = await messagesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { message } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating message', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
  

  // DELETE: Remove a message
  app.delete('/api/messages/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    try {
      const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ id }); // Return the deleted message ID
    } catch (error) {
      console.error('Error deleting message', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
  

  // Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
