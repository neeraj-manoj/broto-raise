# 🚀 BrotoRaise - Student Complaint Management System

> **Brototype - Lovable Challenge 2025** 🏆
> A next-generation complaint management platform built with AI assistance, showcasing the power of vibe-coding and pushing the limits of modern web development.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 📖 About The Project

**BrotoRaise** is a comprehensive complaint management system designed for Brocamp's multi-location operations. It enables students to raise complaints, admins to manage and respond to them, and super admins to oversee the entire system across all locations.

### 🎯 Built For
This project was created as part of the **Brototype - Lovable Challenge**, where we pushed the boundaries of what's possible with AI-assisted development. Every feature, from the responsive UI to the intelligent BroBot assistant, showcases the power of modern tooling and AI collaboration.

### ✨ Key Features

- 🎨 **Modern, Responsive UI** - Beautiful dark-themed interface optimized for all devices
- 🤖 **BroBot AI Assistant** - Intelligent chatbot powered by HuggingFace for instant help
- 📊 **Advanced Analytics** - Real-time insights with interactive charts and filters
- 🔐 **Role-Based Access Control** - Student, Admin, and Super Admin hierarchies
- 📱 **Mobile-First Design** - Optimized navigation and layouts for mobile users
- 🌍 **Multi-Location Support** - Manage complaints across multiple Brocamp locations
- 📎 **File Attachments** - Support for images and documents in complaints
- 🔔 **Real-time Notifications** - Stay updated with toast notifications
- 🎯 **Smart Filtering** - Advanced search and filter options for efficient management
- 🌈 **Smooth Animations** - Delightful micro-interactions throughout the app

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                      │
│                                                         │
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS    │
│  • Server Components for optimal performance            │
│  • Client Components for interactivity                  │
│  • shadcn/ui for consistent component design            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                       │
│                                                         │
│                    Supabase Platform                    │
│  ┌─────────────┬──────────────┬─────────────────────┐   │
│  │   Auth      │   Storage    │   PostgreSQL DB     │   │
│  │  (Users)    │  (Files)     │  (RLS Policies)     │   │
│  └─────────────┴──────────────┴─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       AI LAYER                          │
│                                                         │
│              BroBot (HuggingFace Models)                │
│  • Conversational AI for student assistance             │
│  • Context-aware responses                              │
│  • Role-specific guidance                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DEPLOYMENT                           │
│                                                         │
│                      Vercel                             │
│  • Automatic deployments from git                       │
│  • Global CDN for fast loading                          │
│  • Environment variable management                      │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🧩 shadcn/ui Components
- 📊 Recharts for Analytics
- 🎭 Framer Motion for Animations
- 📝 TypeScript

**Backend:**
- 🔥 Supabase (PostgreSQL + Auth + Storage)
- 🛡️ Row Level Security (RLS)
- 🔒 Secure API Routes

**AI Integration:**
- 🤖 HuggingFace Inference API
- 💬 Conversational AI (BroBot)

**Deployment:**
- 🚀 Vercel

## 🎮 Demo Access

Experience BrotoRaise live: https://broto-raise.vercel.app/

### 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@demo.com | student123 |
| **Admin** | admin@demo.com | admin123 |
| **Super Admin** | superadmin@demo.com | superadmin123 |

> ⚠️ **Note:** This is a demo application. Please don't upload sensitive information.

## 📸 Screenshots

### Landing Page
![Landing Page 1](./screenshots/desktop/landing_1.png)
![Landing Page 2](./screenshots/desktop/landing_2.png)
![Landing Page 3](./screenshots/desktop/landing_3.png)

### Authentication
![Login](./screenshots/desktop/login.png)
![Sign Up](./screenshots/desktop/signup.png)

### Student Dashboard
Beautiful, intuitive interface for students to raise and track complaints.
![Student Dashboard](./screenshots/desktop/student/dashboard.png)

### Complaint Management
![Student Complaints](./screenshots/desktop/student/complaints.png)
![New Complaint 1](./screenshots/desktop/student/newcomplaint_1.png)
![New Complaint 2](./screenshots/desktop/student/newcomplaint_2.png)

### Admin Interface
![Admin Dashboard](./screenshots/desktop/admin/dashboard_stats.png)
![Admin Complaints](./screenshots/desktop/admin/complaints.png)

### Analytics & Reporting
![Analytics Overview](./screenshots/desktop/admin/analytics_stats.png)
![Analytics Details 1](./screenshots/desktop/admin/analytics_1.png)
![Analytics Details 2](./screenshots/desktop/admin/analytics_2.png)

### BroBot AI Assistant
![BroBot Chat](./screenshots/desktop/student/brobot.png)

### Mobile Experience
Fully responsive design optimized for mobile devices across all user roles.

| ![Student Dashboard](./screenshots/mobile/student/dashboard_stats.jpg) <br> <sub>Student Dashboard</sub> | ![New Complaint](./screenshots/mobile/student/newcomplaint_1.jpg) <br> <sub>New Complaint</sub> |
|:--:|:--:|
| ![Admin Analytics](./screenshots/mobile/admin/analytics_1.jpg) <br> <sub>Admin Analytics</sub> | ![Admin Complaints](./screenshots/mobile/admin/complaints.jpg) <br> <sub>Admin Complaints</sub> |

## 🚀 API Overview

BrotoRaise uses a RESTful API architecture with the following key endpoints:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Complaints Management
- `GET /api/complaints` - Fetch user complaints (student view)
- `POST /api/complaints/create` - Create new complaint
- `PATCH /api/complaints/[id]` - Update complaint
- `DELETE /api/complaints/[id]` - Delete complaint

### Admin Operations
- `GET /api/admin/complaints` - Fetch all complaints (admin view)
- `PATCH /api/admin/complaints/[id]/respond` - Respond to complaint
- `PATCH /api/admin/complaints/[id]/status` - Update complaint status

### Super Admin Operations
- `GET /api/super-admin/admins` - Fetch all admins
- `POST /api/super-admin/create-admin` - Create new admin
- `PATCH /api/super-admin/admins/[id]` - Update admin details
- `DELETE /api/super-admin/delete-admin` - Delete admin account
- `POST /api/super-admin/promote-admin` - Promote admin to super admin

### AI Assistant (BroBot)
- `POST /api/brobot/chat` - Send message to BroBot
- `POST /api/brobot/quick-questions` - Get quick answer suggestions

### File Upload
- `POST /api/upload` - Upload file attachments (images, documents)

> 🔒 **Security:** All endpoints are protected by Supabase Row Level Security (RLS) policies ensuring users can only access data they're authorized to view or modify.

## 🎨 Features Showcase

### For Students
- ✅ Raise complaints with rich text descriptions
- ✅ Attach images and documents as evidence
- ✅ Track complaint status in real-time
- ✅ View response history from admins
- ✅ Get instant help from BroBot AI
- ✅ Mobile-optimized interface

### For Admins
- ✅ View and filter complaints by status, category, priority, location
- ✅ Respond to complaints with AI assistance
- ✅ Update complaint status and priority
- ✅ View student profiles and complaint history
- ✅ Access analytics dashboard
- ✅ Manage profile and settings

### For Super Admins
- ✅ All admin capabilities
- ✅ Create and manage admin accounts
- ✅ Promote admins to super admin status
- ✅ View system-wide analytics
- ✅ Oversee all locations
- ✅ Access comprehensive reports

### BroBot AI Features
- 💡 Context-aware conversations
- 💡 Role-specific assistance
- 💡 Quick question suggestions
- 💡 Help with platform navigation
- 💡 Complaint submission guidance
- 💡 Real-time, intelligent responses

## 🎯 Database Schema

### Core Tables

**profiles**
- User information (name, email, role, location, avatar)
- Links to auth.users

**complaints**
- Complaint details (title, description, status, priority, category)
- Foreign keys to profiles and locations
- Attachment URLs

**complaint_responses**
- Admin responses to complaints
- Timestamps and admin information

**locations**
- Brocamp location details
- City, state, address information

### Row Level Security (RLS)

All tables implement strict RLS policies:
- Students can only view/edit their own complaints
- Admins can view complaints for their assigned location
- Super admins have full system access
- Responses are restricted to admin roles



## 🎯 About## Learn More## 🛠️ Development Highlights

### Mobile-First Approach
- Responsive stat cards with 2x2 grid on mobile
- Horizontally scrollable tabs for better UX
- Touch-optimized buttons (44px minimum)
- Bottom navigation for easy thumb access
- Hidden scrollbars for cleaner appearance

### Performance Optimizations
- Server-side rendering for faster initial loads
- Optimized images with Next.js Image component
- Lazy loading for heavy components
- Efficient React hooks usage
- Minimal client-side JavaScript

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color schemes
- Focus indicators
- Semantic HTML structure

### Developer Experience
- TypeScript for type safety
- Consistent code formatting
- Modular component architecture
- Reusable utility functions
- Clear naming conventions

## 🤝 Contributing

This project was built for the Brototype - Lovable Challenge. While it's primarily a competition entry, feedback and suggestions are welcome!

## 👨‍💻 Author

**Neeraj Manoj**
- GitHub: [@neeraj-manoj](https://github.com/neeraj-manoj)
- Project Link: [https://github.com/neeraj-manoj/broto-raise](https://github.com/neeraj-manoj/broto-raise)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Brototype** for organizing the Lovable Challenge
- **Supabase** for the amazing backend platform
- **HuggingFace** for AI model access
- **Vercel** for Next.js and great developer tools
- **shadcn/ui** for beautiful component primitives
- **AI Tools** that made this vibe-coding experience incredible

## 🌟 Competition Notes

This project showcases:
- ✨ Modern web development best practices
- 🤖 Effective use of AI assistance in development
- 🎨 Attention to UI/UX design
- 🏗️ Scalable architecture patterns
- 📱 Mobile-first responsive design
- 🔐 Security-focused implementation
- 🚀 Production-ready code quality

Built with ❤️ and AI assistance for the Brototype - Lovable Challenge 2025

---

**⭐ If you like this project, please star it on GitHub! ⭐**
