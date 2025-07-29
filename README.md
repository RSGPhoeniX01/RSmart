# 🛒 RSmart - All-in-One E-Commerce Platform


## 📖 Overview

RSmart is a comprehensive e-commerce platform that connects buyers and sellers in a seamless marketplace experience. Built with modern web technologies, it offers a complete solution for online shopping with advanced features like voice-controlled shopping, secure payments, real-time inventory management, and more.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Secure User Registration** with email verification via OTP
- **Two-Step Registration Process** - OTP verification before account creation
- **Login/Logout** functionality with JWT tokens and secure cookies
- **Profile Management** with editable user information
- **Role-based Access** (Buyer/Seller) with different interfaces
- **Password Management** with secure updates and validation
- **Email Verification** system with nodemailer integration

### 🛍️ Shopping Experience
- **Product Browsing** with advanced filtering and search
- **Category-based Navigation** (Electronics, Fashion, Home, Sports, Books, Beauty, Toys, Health)
- **Product Details** with comprehensive information and modal views
- **Wishlist Management** for favorite items with toggle functionality
- **Shopping Cart** with quantity management and stock validation
- **Purchase History** tracking with detailed order information
- **Real-time Stock Updates** and availability checking

### 🏪 Seller Features
- **Product Listing** with image upload via Cloudinary
- **Inventory Management** with stock tracking and updates
- **My Listed Items** dashboard with edit and delete capabilities
- **Product Updates** and management with form validation
- **Seller-specific Interface** with different navigation options

### 💳 Payment & Checkout
- **Secure Payment Processing** via Razorpay integration
- **Billing Address Management** with form validation
- **Order Confirmation** and tracking
- **Payment Verification** with cryptographic signature validation
- **Cart-to-Purchase Flow** with automatic stock deduction
- **Multiple Payment Options** support

### 🎤 Voice Assistant (AI-Powered)
- **Voice-Controlled Shopping** with speech recognition
- **Natural Language Commands** for product search and cart management
- **Voice Navigation** between different sections
- **Product Search by Voice** with intelligent matching
- **Cart Management** via voice commands (add/remove items)
- **Wishlist Management** through voice interactions
- **Category Filtering** with voice commands
- **Real-time Speech Feedback** with text-to-speech

### 🎨 User Interface
- **Modern, Responsive Design** with TailwindCSS
- **Dark Theme** with gradient backgrounds and cyan accents
- **Interactive Components** with smooth animations and hover effects
- **Mobile-friendly** interface with responsive layouts
- **Real-time Updates** and notifications
- **Loading States** and error handling
- **Modal Dialogs** for product details and interactions

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library with hooks
- **React Router DOM 7.6.2** - Client-side routing
- **TailwindCSS 4.1.8** - Utility-first CSS framework
- **React Icons 5.5.0** - Icon library
- **Vite 6.3.5** - Fast build tool and dev server
- **Web Speech API** - Voice recognition and synthesis

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **MongoDB 8.15.1** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens with secure cookies
- **bcrypt** - Password hashing and validation
- **nodemailer** - Email functionality for OTP
- **Zod** - Schema validation and type checking

### External Services
- **Cloudinary** - Image upload and storage
- **Razorpay** - Payment gateway integration
- **MongoDB Atlas** - Cloud database hosting
- **Web Speech API** - Browser-based speech recognition

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Development server with auto-restart
- **CORS** - Cross-origin resource sharing
- **Express FileUpload** - File handling middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager
- Modern browser with Web Speech API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RSmart.git
   cd RSmart
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

5. **Start the Development Servers**

   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
RSmart/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Home.jsx      # Main landing page with product grid
│   │   │   ├── SignUp.jsx    # User registration with OTP
│   │   │   ├── Login.jsx     # User authentication
│   │   │   ├── Profile.jsx   # User profile management
│   │   │   ├── AddItem.jsx   # Product listing form
│   │   │   ├── Cart.jsx      # Shopping cart management
│   │   │   ├── Wishlist.jsx  # Wishlist management
│   │   │   ├── BillingAddress.jsx # Payment checkout
│   │   │   ├── MyListedItems.jsx # Seller dashboard
│   │   │   ├── PurchaseHistory.jsx # Order history
│   │   │   ├── ItemModal.jsx # Product detail modal
│   │   │   ├── Otp.jsx       # OTP verification component
│   │   │   ├── Navbar.jsx    # Navigation with voice assistant
│   │   │   └── Footer.jsx    # Footer component
│   │   ├── utils/
│   │   │   ├── voiceAssistant.jsx # Voice control functionality
│   │   │   └── voiceControl.jsx   # Voice assistant utilities
│   │   ├── logo/             # Application assets
│   │   ├── App.jsx           # Main app component with routing
│   │   └── main.jsx          # App entry point
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                  # Node.js backend application
│   ├── controllers/          # Request handlers
│   │   ├── user.controller.js    # User management & authentication
│   │   ├── item.controller.js    # Product management
│   │   ├── cart.controller.js    # Cart operations
│   │   └── payment.controller.js # Payment processing
│   ├── models/               # Database schemas
│   │   ├── user_model.js     # User schema with wishlist
│   │   ├── item_model.js     # Product schema
│   │   ├── cart.model.js     # Cart schema
│   │   ├── purchase.model.js # Purchase schema
│   │   └── otp.model.js      # OTP verification schema
│   ├── routes/               # API routes
│   │   ├── user.route.js     # User endpoints
│   │   ├── item.route.js     # Product endpoints
│   │   ├── cart.route.js     # Cart endpoints
│   │   └── payment.route.js  # Payment endpoints
│   ├── middleware/           # Custom middleware
│   │   └── user.middleware.js # JWT authentication middleware
│   ├── server.js             # Express server setup
│   └── package.json          # Backend dependencies
└── README.md                 # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/user/signup` - Send OTP for email verification
- `POST /api/user/verify-email-otp` - Verify email OTP
- `POST /api/user/register` - Create user account after OTP verification
- `POST /api/user/signIn` - User login
- `POST /api/user/signout` - User logout
- `GET /api/user/me` - Get current user details
- `PUT /api/user/:id/update` - Update user profile

### Products
- `GET /api/item/allitems` - Get all products with filters
- `POST /api/item/create` - Create new product (seller only)
- `PUT /api/item/update/:id` - Update product (seller only)
- `DELETE /api/item/delete/:id` - Delete product (seller only)
- `GET /api/item/categories` - Get product categories
- `GET /api/item/seller-items` - Get seller's listed items
- `POST /api/item/buy/:itemId` - Direct purchase functionality

### Cart & Wishlist
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `POST /api/cart/checkout` - Checkout from cart
- `GET /api/user/wishlist` - Get user's wishlist
- `POST /api/user/wishlist/toggle` - Toggle wishlist item

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature
- `GET /api/payment/get-key` - Get Razorpay public key

### Purchase History
- `GET /api/user/purchases` - Get user's purchase history

## 🎤 Voice Assistant Commands

The voice assistant supports the following commands:

### Navigation
- "Go to home" / "Open home"
- "Open cart" 
- "Open wishlist" / "Open wish list"
- "Open profile"
- "Refresh" / "Reload"

### Product Search & Filtering
- "Show all [category]" (e.g., "Show all electronics")
- "Show all categories"

### Cart Management
- "Add [product name] to cart"
- "Remove [product name] from cart"

### Wishlist Management
- "Add [product name] in my wishlist" / "Add [product name] in my wish list"
- "Remove [product name] from wishlist" / "Remove [product name] from my wish list"

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Setup

1. **Follow the installation steps above**
2. **Set up your development environment**
3. **Run tests before submitting changes**
4. **Follow the existing code style and conventions**

### Areas for Contribution

- 🐛 **Bug Fixes** - Help identify and fix issues
- ✨ **New Features** - Add new functionality
- 📱 **UI/UX Improvements** - Enhance user experience
- 🔒 **Security Enhancements** - Improve security measures
- 📚 **Documentation** - Improve project documentation
- 🧪 **Testing** - Add unit and integration tests
- 🚀 **Performance Optimization** - Improve app performance
- 🎤 **Voice Assistant** - Enhance voice control features
- 🔍 **Search & Filtering** - Improve product discovery
- 📊 **Analytics** - Add user behavior tracking

## 📝 Code Style

- Use **ES6+** features
- Follow **React best practices** and hooks
- Use **semantic commit messages**
- Maintain **consistent indentation**
- Add **comments** for complex logic
- Use **descriptive variable names**
- Follow **MongoDB/Mongoose** best practices
- Implement **proper error handling**

## 🐛 Known Issues

- None currently reported

## 🔮 Roadmap

- [ ] **Real-time Chat** between buyers and sellers
- [ ] **Product Reviews & Ratings** system
- [ ] **Advanced Search** with AI-powered recommendations
- [ ] **Push Notifications** for order updates
- [ ] **Multi-language Support**
- [ ] **Mobile App** development
- [ ] **Analytics Dashboard** for sellers
- [ ] **Social Media Integration**
- [ ] **Voice Assistant Improvements** - More natural language processing
- [ ] **Loyalty Program** and rewards system


## 🙏 Acknowledgments

- **Razorpay** for payment processing
- **Cloudinary** for image management
- **MongoDB** for database services
- **React Community** for amazing tools and libraries
- **Web Speech API** for voice recognition capabilities

<div align="center">
  <p>Made with ❤️ by the RSmart Team</p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
