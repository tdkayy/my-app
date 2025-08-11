import React from "react";
import { motion } from "framer-motion";
import { 
  Code, 
  Server, 
  Database, 
  Shield, 
  Zap, 
  CheckCircle,
  ExternalLink,
  Clock,
  Users,
  Target
} from "lucide-react";

export default function Documentation() {
  const challenges = [
    {
      title: "Authentication System",
      description: "Implement secure login",
      time: "10 days",
      status: "completed",
      technologies: ["JavaScript", "AJAX", "Cookie Management"]
    },
    {
      title: "Transaction Management",
      description: "Create, read, and display transaction data",
      time: "3 days", 
      status: "completed",
      technologies: ["PHP Proxy", "API Integration", "Data Processing"]
    },
    {
      title: "Real-time UI Updates",
      description: "Single-page application without page refreshes",
      time: "4 days",
      status: "completed", 
      technologies: ["Vanilla JavaScript", "DOM Manipulation", "State Management"]
    },
    {
      title: "Performance Optimization",
      description: "Handle large datasets efficiently",
      time: "5 days",
      status: "completed",
      technologies: ["Virtual Scrolling", "Data Caching", "Lazy Loading"]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Token-based authentication with the Expensify API using secure credential handling."
    },
    {
      icon: Database,
      title: "Transaction Management", 
      description: "Full CRUD operations for expense transactions with real-time data synchronization."
    },
    {
      icon: Zap,
      title: "Performance Optimized",
      description: "Handles large datasets with efficient rendering and minimal memory footprint."
    },
    {
      icon: Code,
      title: "Clean Architecture",
      description: "Well-structured code with separation of concerns and maintainable components."
    }
  ];

  const techStack = [
    { name: "Frontend", technologies: ["Vanilla JavaScript", "HTML5", "CSS3", "jQuery"] },
    { name: "Backend", technologies: ["PHP", "cURL", "JSON"] },
    { name: "API", technologies: ["Expensify API", "RESTful Services", "Authentication"] },
    { name: "Deployment", technologies: ["AWS/Heroku", "Apache/Nginx", "SSL/HTTPS"] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Adesanya Banking
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          A comprehensive web application exercising JavaScript, PHP, and API integration skills 
          through expense management functionality.
        </p>
      </motion.div>

      {/* Challenge Overview */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-8"
        >
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">Project Overview</h2>
          </div>
          <div className="space-y-4 text-slate-600">
            <p>
              This project was built as a technical challenge to increase proficiency in 
              full-stack web development using vanilla JavaScript, PHP, and third-party API integration.
            </p>
            <p>
              The application showcases the ability to work with incomplete specifications, 
              implement secure authentication, handle large datasets efficiently, and create 
              a polished user experience without relying on heavy frameworks.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8"
        >
          <div className="flex items-center mb-6">
            <Clock className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">Time Investment</h2>
          </div>
          <div className="space-y-4">
            {challenges.map((challenge, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">{challenge.title}</h3>
                  <p className="text-sm text-slate-600">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 mb-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{challenge.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center gradient-text mb-12">
          Key Features & Capabilities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="glass-effect rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center gradient-text mb-12">
          Technology Stack
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, index) => (
            <div key={index} className="glass-effect rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-600" />
                {stack.name}
              </h3>
              <div className="space-y-2">
                {stack.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="flex items-center text-sm text-slate-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Implementation Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-2xl p-8"
      >
        <div className="flex items-center mb-6">
          <Code className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-slate-800">Implementation Highlights</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Frontend Architecture</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Single-page application with dynamic content loading
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Vanilla JavaScript for all interactions and state management
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Responsive design with modern CSS Grid and Flexbox
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Performance optimizations for large dataset handling
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Backend & API Integration</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                PHP proxy to handle CORS and secure API communication
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Secure credential handling and token management
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                Error handling and user-friendly feedback
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                RESTful API integration with proper data validation
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}