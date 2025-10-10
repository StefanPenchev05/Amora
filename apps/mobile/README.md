# 📱 Amora Mobile App

> React Native mobile application following Clean Architecture and SOLID principles

## 📖 Directory Structure

You can see the complete directory structure [here](../../docs/mobile/directory_structure.md)

## 🏗️ Architecture Overview

This mobile app follows **Clean Architecture** principles with clear separation of concerns across four main layers:

## 🏛️ SOLID Principles Applied

### **S - Single Responsibility Principle**
- Each component/service has one reason to change
- Clear separation between UI, business logic, and data access

### **O - Open/Closed Principle**
- Components are open for extension, closed for modification
- Use interfaces and dependency injection

### **L - Liskov Substitution Principle**
- Repository implementations can be substituted without breaking functionality
- Interface-based design

### **I - Interface Segregation Principle**
- Small, focused interfaces
- Components depend only on what they need

### **D - Dependency Inversion Principle**
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)

### **🏢 Domain Layer** - Pure Business Logic
**No external dependencies - contains core business rules**
- **Entities**: Core business objects (User, Post, Calendar, Mood)
- **Repositories**: Abstract interfaces defining data access contracts  
- **Use Cases**: Business rules and application logic implementations

### **🔌 Infrastructure Layer** - External Dependencies
**Concrete implementations of domain interfaces**
- **Repositories**: Real implementations using APIs, databases, storage
- **HTTP**: API clients, network handling, request/response management

### **📱 Presentation Layer** - UI State Management
**Connects domain logic to user interface**
- **ViewModels**: State management and UI logic coordination
- **Reactive State**: Manages UI state changes and user interactions

### **🎨 UI Components** - Reusable Interface Elements
**Building blocks for consistent user experiences**
- **Components**: Reusable UI elements (Button, Input, Card, Modal)
- **Screens**: Complete user interface pages organized by feature
- **Navigation**: App routing and screen transitions

### **🔗 Services Layer** - Application-Level Services
**Cross-cutting concerns and external integrations**
- **API Services**: Backend communication and data synchronization
- **Authentication**: User security, tokens, biometric authentication  
- **Storage**: Local data persistence, caching, secure storage

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## 🧪 Testing Structure

```
__tests__/
├── domain/
├── infrastructure/  
├── presentation/
└── utils/
```

## 📦 Key Dependencies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Zustand/Redux** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Yup** - Validation

---

**Built with ❤️ following Clean Architecture principles**
