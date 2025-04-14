import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import {
  UserModel,
  ProjectModel,
  SkillModel,
  CategoryModel,
  BlogModel,
  VideoModel,
  SkillCategories
} from '@shared/schema';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function initDatabase() {
  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      UserModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      SkillModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      BlogModel.deleteMany({}),
      VideoModel.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    const admin = new UserModel({
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    });
    await admin.save();
    console.log('Created admin user');

    // Create categories
    const webDevCategory = new CategoryModel({
      name: 'Web Development',
      slug: 'web-development'
    });
    await webDevCategory.save();

    const mobileDevCategory = new CategoryModel({
      name: 'Mobile Development',
      slug: 'mobile-development'
    });
    await mobileDevCategory.save();
    console.log('Created categories');

    // Create skills
    const frontendSkills = [
      { name: 'HTML/CSS', percentage: 95, category: 'frontend', order: 1 },
      { name: 'JavaScript', percentage: 90, category: 'frontend', order: 2 },
      { name: 'React', percentage: 85, category: 'frontend', order: 3 },
      { name: 'TypeScript', percentage: 80, category: 'frontend', order: 4 },
      { name: 'Tailwind CSS', percentage: 90, category: 'frontend', order: 5 },
    ];

    const backendSkills = [
      { name: 'Node.js', percentage: 85, category: 'backend', order: 1 },
      { name: 'Express', percentage: 85, category: 'backend', order: 2 },
      { name: 'MongoDB', percentage: 80, category: 'backend', order: 3 },
      { name: 'PostgreSQL', percentage: 75, category: 'backend', order: 4 },
      { name: 'GraphQL', percentage: 70, category: 'backend', order: 5 },
    ];

    await SkillModel.insertMany([...frontendSkills, ...backendSkills]);
    console.log('Created skills');

    // Create sample projects
    const projects = [
      {
        title: 'E-commerce Dashboard',
        description: 'A comprehensive admin dashboard for e-commerce platforms with sales analytics and inventory management',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        projectUrl: 'https://project1.example.com',
        githubUrl: 'https://github.com/example/project1',
        featured: true,
        authorId: admin._id
      },
      {
        title: 'Real-time Chat Application',
        description: 'A real-time messaging application with private chats, group channels and file sharing capabilities',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        technologies: ['Socket.io', 'React', 'Redux', 'MongoDB'],
        projectUrl: 'https://project2.example.com',
        githubUrl: 'https://github.com/example/project2',
        featured: true,
        authorId: admin._id
      },
      {
        title: 'Task Management System',
        description: 'A collaborative task management system with kanban boards, progress tracking and team collaboration',
        imageUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        projectUrl: 'https://project3.example.com',
        githubUrl: 'https://github.com/example/project3',
        featured: true,
        authorId: admin._id
      }
    ];

    await ProjectModel.insertMany(projects);
    console.log('Created projects');

    // Create sample blogs
    const blogs = [
      {
        title: 'Getting Started with React Hooks',
        slug: 'getting-started-with-react-hooks',
        content: `
# Getting Started with React Hooks

React Hooks are a powerful feature that allows you to use state and other React features without writing a class component. In this article, we'll explore the basics of React Hooks and how they can make your code cleaner and more reusable.

## What are React Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don't work inside classes — they let you use React without classes.

## Why Hooks?

- They let you split one component into smaller functions based on what pieces are related
- They let you use state without writing a class
- They let you reuse stateful logic without changing your component hierarchy

## Basic Hooks

### useState

The useState hook lets you add React state to function components:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect

The useEffect hook lets you perform side effects in function components:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Custom Hooks

You can also create your own Hooks to reuse stateful logic between components.

\`\`\`jsx
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return width;
}
\`\`\`

## Conclusion

React Hooks provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle. They also offer a new powerful way to combine them.
        `,
        excerpt: 'Learn how to use React Hooks to simplify your components and reuse stateful logic in your React applications.',
        imageUrl: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        categoryId: webDevCategory._id,
        authorId: admin._id,
        published: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      {
        title: 'Building REST APIs with Node.js and Express',
        slug: 'building-rest-apis-with-nodejs-express',
        content: `
# Building REST APIs with Node.js and Express

In this guide, we'll walk through the process of building a RESTful API using Node.js and Express.js. We'll cover setting up routes, connecting to a database, and implementing CRUD operations.

## Getting Started

First, let's set up our project:

\`\`\`bash
mkdir node-api
cd node-api
npm init -y
npm install express mongoose body-parser
\`\`\`

## Setting Up Express

Create an \`index.js\` file:

\`\`\`javascript
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize express app
const app = express();

// Parse requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a simple route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to our API" });
});

// Listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
\`\`\`

## Connecting to MongoDB

Add the connection to your database:

\`\`\`javascript
// MongoDB connection
mongoose.connect('mongodb://localhost/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Successfully connected to the database");
})
.catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});
\`\`\`

## Creating a Model

Let's create a simple model:

\`\`\`javascript
// models/product.model.js
const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
\`\`\`

## Implementing CRUD Routes

Create routes for our API:

\`\`\`javascript
// routes/product.routes.js
module.exports = (app) => {
    const products = require('../controllers/product.controller.js');

    // Create a new Product
    app.post('/api/products', products.create);

    // Retrieve all Products
    app.get('/api/products', products.findAll);

    // Retrieve a single Product with productId
    app.get('/api/products/:productId', products.findOne);

    // Update a Product with productId
    app.put('/api/products/:productId', products.update);

    // Delete a Product with productId
    app.delete('/api/products/:productId', products.delete);
}
\`\`\`

## Implementing Controllers

Create controller functions:

\`\`\`javascript
// controllers/product.controller.js
const Product = require('../models/product.model.js');

// Create and Save a new Product
exports.create = (req, res) => {
    // Validate request
    if(!req.body.name) {
        return res.status(400).send({
            message: "Product name can not be empty"
        });
    }

    // Create a Product
    const product = new Product({
        name: req.body.name,
        description: req.body.description || "No description",
        price: req.body.price,
        category: req.body.category
    });

    // Save Product in the database
    product.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Product."
        });
    });
};

// Retrieve all Products from the database
exports.findAll = (req, res) => {
    Product.find()
    .then(products => {
        res.send(products);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving products."
        });
    });
};

// Find a single product with a productId
exports.findOne = (req, res) => {
    Product.findById(req.params.productId)
    .then(product => {
        if(!product) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });            
        }
        res.send(product);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving product with id " + req.params.productId
        });
    });
};

// Update a product identified by the productId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.name) {
        return res.status(400).send({
            message: "Product name can not be empty"
        });
    }

    // Find product and update it with the request body
    Product.findByIdAndUpdate(req.params.productId, {
        name: req.body.name,
        description: req.body.description || "No description",
        price: req.body.price,
        category: req.body.category
    }, {new: true})
    .then(product => {
        if(!product) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });
        }
        res.send(product);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });                
        }
        return res.status(500).send({
            message: "Error updating product with id " + req.params.productId
        });
    });
};

// Delete a product with the specified productId in the request
exports.delete = (req, res) => {
    Product.findByIdAndRemove(req.params.productId)
    .then(product => {
        if(!product) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });
        }
        res.send({message: "Product deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });                
        }
        return res.status(500).send({
            message: "Could not delete product with id " + req.params.productId
        });
    });
};
\`\`\`

## Conclusion

We've built a basic RESTful API with Node.js, Express, and MongoDB. This serves as a foundation that you can expand upon for more complex applications. For production, you would want to add authentication, validation, error handling, and more robust security measures.
        `,
        excerpt: 'Learn how to create a RESTful API using Node.js and Express.js, including database integration and CRUD operations.',
        imageUrl: 'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        categoryId: webDevCategory._id,
        authorId: admin._id,
        published: true,
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2023-02-20')
      },
      {
        title: 'Introduction to React Native',
        slug: 'introduction-to-react-native',
        content: `
# Introduction to React Native

React Native is a popular JavaScript framework that allows you to build native mobile applications for iOS and Android using a single codebase. In this introduction, we'll explore what React Native is, how it works, and why you might want to use it for your next mobile project.

## What is React Native?

React Native is an open-source framework developed by Facebook that uses React to build mobile applications. Unlike other approaches to cross-platform development, React Native doesn't rely on WebViews. Instead, it renders using native components, which results in applications that look, feel, and perform like native apps.

## Why Choose React Native?

### 1. Cross-Platform Development

One of the most significant advantages of React Native is the ability to share code between platforms. You can write your application once and deploy it to both iOS and Android, saving development time and resources.

### 2. Familiar Technology Stack

If you're already familiar with React for web development, the transition to React Native is relatively smooth. The core principles—components, state, props, and the component lifecycle—remain the same.

### 3. Hot Reloading

React Native's hot reloading feature allows you to see changes in real-time without rebuilding the entire application, significantly speeding up the development process.

### 4. Native Performance

React Native bridges JavaScript and native code, allowing your application to access native device features and deliver performance comparable to fully native applications.

## Getting Started with React Native

Let's set up a basic React Native project:

\`\`\`bash
# Install the React Native CLI
npm install -g react-native-cli

# Create a new project
react-native init MyFirstApp

# Move into the project directory
cd MyFirstApp

# Start the development server
react-native run-ios  # For iOS
react-native run-android  # For Android
\`\`\`

## Basic Components

React Native provides a set of built-in components that map to native UI elements:

### 1. View

The \`View\` component is similar to a \`div\` in web development and is used for layout:

\`\`\`jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

const Box = () => {
  return <View style={styles.box} />;
};

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
  },
});

export default Box;
\`\`\`

### 2. Text

The \`Text\` component is used to display text:

\`\`\`jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Greeting = () => {
  return <Text style={styles.text}>Hello, React Native!</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
  },
});

export default Greeting;
\`\`\`

### 3. Image

The \`Image\` component is used to display images:

\`\`\`jsx
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const Logo = () => {
  return (
    <Image
      style={styles.logo}
      source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
  },
});

export default Logo;
\`\`\`

## Creating a Simple App

Let's create a simple counter app:

\`\`\`jsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CounterApp = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter App</Text>
      <Text style={styles.counter}>{count}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increment" onPress={() => setCount(count + 1)} />
        <Button title="Decrement" onPress={() => setCount(count - 1)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  counter: {
    fontSize: 48,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
});

export default CounterApp;
\`\`\`

## Conclusion

React Native offers a powerful way to build mobile applications using familiar web technologies. While there's more to learn—navigation, state management, native modules, and more—this introduction provides a foundation to start exploring React Native development.

As you progress, you'll discover that React Native is not just about cross-platform efficiency but also about delivering a quality user experience that feels truly native.
        `,
        excerpt: 'Discover how to build native mobile applications for iOS and Android using React Native and a single JavaScript codebase.',
        imageUrl: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        categoryId: mobileDevCategory._id,
        authorId: admin._id,
        published: true,
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-10')
      }
    ];

    await BlogModel.insertMany(blogs);
    console.log('Created blogs');

    // Create sample videos
    const videos = [
      {
        title: 'Building a React App from Scratch',
        videoId: 'dQw4w9WgXcQ', // This is a placeholder video ID
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg',
        views: 1250,
        publishedAt: new Date('2023-01-10'),
        featured: true,
        order: 1
      },
      {
        title: 'Node.js REST API Tutorial',
        videoId: 'QH2-TGUlwu4', // This is a placeholder video ID
        thumbnailUrl: 'https://img.youtube.com/vi/QH2-TGUlwu4/0.jpg',
        views: 980,
        publishedAt: new Date('2023-02-15'),
        featured: true,
        order: 2
      },
      {
        title: 'MongoDB Crash Course',
        videoId: 'jNQXAC9IVRw', // This is a placeholder video ID
        thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/0.jpg',
        views: 760,
        publishedAt: new Date('2023-03-20'),
        featured: false,
        order: 3
      }
    ];

    await VideoModel.insertMany(videos);
    console.log('Created videos');

    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();