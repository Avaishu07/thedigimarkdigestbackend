// server.js
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require("./Modal/UserSignup");
const connectToDatabase = require("./dbconnect/lib");
const jwt = require("jsonwebtoken");
const ContactMessage = require("./Modal/Contact");
const AddNews = require("./Modal/AddNews");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectToDatabase();

// POST method for user signup
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, role, email, phone, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !role || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            role,
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// POST method for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a token for the user
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new contact message instance
    const newMessage = new ContactMessage({ name, email, subject, message });

    // Save the message to the database
    newMessage.save()
        .then(() => {
            console.log('New contact message:', { name, email, subject, message });
            res.status(200).json({ message: 'Message received successfully!' });
        })
        .catch(err => {
            console.error('Error saving message:', err);
            res.status(500).json({ message: 'Error saving message', error: err });
        });
});

app.post('/api/addnews', async (req, res) => {
    const { title, category, content, imageUrl } = req.body;

    // Check if all required fields are provided
    if (!title || !category || !content) {
        return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    try {
        const newNewsPost = new AddNews({
            title,
            category,
            content,
            imageUrl,
        });

        const result = await newNewsPost.save(); // Save the document to the database
        res.status(200).json({ message: 'News created successfully', post: result });
    } catch (err) {
        console.error('Error inserting news post:', err);
        res.status(500).json({ error: 'Error inserting news post' });
    }
});


// get all newsposts
app.get('/api/getnewspost', async (req, res) => {
    try {
        const newsPosts = await AddNews.find(); 
        // console.log(newsPosts)
        res.status(200).json(newsPosts);
    } catch (err) {
        console.error('Error fetching news posts:', err);
        res.status(500).json({ error: 'Error fetching news posts' });
    }
});


app.get('/api/getnews/:id', async (req, res) => {
    const blogId = req.params.id;
    try {
        const blogPost = await AddNews.findById(blogId); // Correctly fetch by ID
        if (!blogPost) {
            res.status(404).json({ error: 'Blog post not found' });
        } else {
            res.status(200).json(blogPost);
        }
    } catch (err) {
        console.error('Error retrieving blog post:', err);
        res.status(500).json({ error: 'Error retrieving blog post' });
    }
});
// get newspost with id

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
