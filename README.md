# SoftEng

"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Star, Shield, Clock, Users, Wrench, Phone, Mail, MapPin, Menu, X, Snowflake, Wind, Thermometer, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fadeInUp = (id) => isVisible[id] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0';

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-gray-900 overflow-x-hidden">
      {/* ================= Enhanced Navbar ================= */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-2xl shadow-lg border-b border-white/20 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-all duration-300">
                  <Snowflake className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  2LOY
                </h1>
                <p className="text-sm font-semibold text-blue-600 -mt-1">Car Aircon Pro</p>
              </div>
            </div>
            
            {/* Enhanced Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { name: 'Home', href: '#home' },
                { name: 'About', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Reviews', href: '#testimonials' }
              ].map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  className="relative px-4 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                  <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </a>
              ))}
            </nav>
            
            {/* Enhanced CTA Button */}
            <div className="flex items-center space-x-4">
              <button className="hidden sm:flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all transform hover:scale-105 hover:-rotate-1 group">
                <Snowflake className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Book Service
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <nav className="flex flex-col space-y-3">
                {[
                  { name: 'Home', href: '#home' },
                  { name: 'About', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Reviews', href: '#testimonials' }
                ].map((item) => (
                  <a 
                    key={item.name}
                    href={item.href} 
                    className="px-4 py-3 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <button className="mt-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl">
                  Book Service
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ================= Revolutionary Hero Section ================= */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-300/20 to-purple-400/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-400/40 to-blue-500/40 rounded-full blur-xl animate-pulse delay-500"></div>
          
          {/* Animated Snow/Cool Effects */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <Snowflake 
                key={i}
                className={`absolute w-6 h-6 text-blue-300/30 animate-pulse`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 12}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 3D Car Section */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            {/* 3D Car Container */}
            <div className="relative group">
              {/* Car Image */}
              <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-700">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3"
                  alt="Luxury Car"
                  className="w-[600px] h-[400px] object-contain filter drop-shadow-2xl"
                />
              </div>
              
              {/* Cooling Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[300px] bg-gradient-to-r from-blue-400/20 via-cyan-300/30 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              </div>
              
              {/* Cool Air Animation */}
              <div className="absolute top-32 left-32 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex items-center space-x-2 animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <Wind className="w-6 h-6 text-cyan-500" />
                    <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Temperature Display */}
              <div className="absolute bottom-20 right-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20">
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">18°C</p>
                    <p className="text-sm text-gray-600">Perfect Cooling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:w-1/2">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/20">
                <Snowflake className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-blue-600 font-semibold text-sm">Premium Car AC Services</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Stay Cool,
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Drive Fresh
                </span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed">
              Experience the ultimate comfort with our premium car air conditioning services. 
              From repairs to installations, we keep you cool on every journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all transform hover:scale-105 hover:-rotate-1 text-lg">
                <Snowflake className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Book Your Service
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button className="flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-xl text-gray-700 font-semibold rounded-2xl shadow-xl hover:shadow-2xl border border-white/20 hover:bg-white transition-all text-lg">
                <Phone className="w-5 h-5 mr-3 text-blue-500" />
                Call Now
              </button>
            </div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
              {[
                { icon: <CheckCircle className="w-5 h-5" />, text: "Expert Technicians" },
                { icon: <Shield className="w-5 h-5" />, text: "Warranty Included" },
                { icon: <Clock className="w-5 h-5" />, text: "Same-Day Service" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="text-blue-500">{feature.icon}</div>
                  <span className="text-sm font-semibold text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <p className="text-sm text-gray-500 font-semibold">Scroll to explore</p>
            <ChevronDown className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </section>

      {/* ================= Modern About Section ================= */}
      <section id="about" className="py-32 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${fadeInUp('about-header')}`} id="about-header">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full mb-6">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-semibold">About 2Loy</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Your Cool Comfort Experts
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transforming every drive into a comfortable journey with professional car AC services
            </p>
          </div>

          {/* Modern Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Story Section */}
            <div className={`transition-all duration-1000 delay-200 ${fadeInUp('story')}`} id="story">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white p-8 lg:p-12 rounded-3xl shadow-2xl border border-white/20">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-6 group-hover:rotate-12 transition-transform duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Our Story
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Born from a passion for automotive excellence, 2Loy began as a small workshop with a big dream - 
                    to revolutionize car air conditioning services in the Philippines.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Today, we're the trusted choice for thousands of drivers who refuse to compromise on comfort. 
                    Our journey combines traditional craftsmanship with cutting-edge technology, ensuring every 
                    vehicle we service delivers perfect cooling performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={`transition-all duration-1000 delay-300 ${fadeInUp('stats')}`} id="stats">
              <div className="grid grid-cols-2 gap-6 h-full">
                {[
                  { number: "5000+", label: "Happy Customers", icon: <Users className="w-8 h-8" /> },
                  { number: "10+", label: "Years Experience", icon: <Clock className="w-8 h-8" /> },
                  { number: "24/7", label: "Emergency Service", icon: <Shield className="w-8 h-8" /> },
                  { number: "100%", label: "Satisfaction Rate", icon: <Star className="w-8 h-8" /> }
                ].map((stat, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-white/20 text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-blue-500 flex justify-center mb-4">
                        {stat.icon}
                      </div>
                      <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission */}
            <div className={`transition-all duration-1000 delay-400 ${fadeInUp('mission')}`} id="mission">
              <div className="group relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-8 lg:p-12 rounded-3xl shadow-2xl border border-white/20 h-full">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 group-hover:rotate-12 transition-transform duration-300">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-blue-600">Mission</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    To deliver exceptional car air conditioning services that exceed expectations through 
                    innovative solutions, expert craftsmanship, and unparalleled customer care. We're committed 
                    to ensuring every vehicle provides optimal comfort and reliability for our valued clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className={`transition-all duration-1000 delay-500 ${fadeInUp('vision')}`} id="vision">
              <div className="group relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-cyan-50 to-purple-50 p-8 lg:p-12 rounded-3xl shadow-2xl border border-white/20 h-full">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mr-6 group-hover:rotate-12 transition-transform duration-300">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-cyan-600">Vision</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    To be the Philippines' leading automotive air conditioning service provider, recognized 
                    for our innovation, reliability, and customer satisfaction. We envision a future where 
                    every journey is comfortable, every service exceeds expectations, and every client becomes our advocate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Ultra-Modern Services Section ================= */}
      <section id="services" className="py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${fadeInUp('services-header')}`} id="services-header">
            <div className="inline-flex items-center px-6 py-3 bg-cyan-100 rounded-full mb-6">
              <Wrench className="w-5 h-5 text-cyan-600 mr-2" />
              <span className="text-cyan-600 font-semibold">Our Services</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete AC Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Professional car air conditioning services designed to keep you comfortable on every journey
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AC Repair & Diagnostics",
                img: "https://images.unsplash.com/photo-1632823469591-d77f6ae60978?ixlib=rb-4.0.3",
                icon: <Wrench className="w-8 h-8" />,
                description: "Expert diagnosis and repair of all air conditioning issues using advanced diagnostic equipment and genuine parts for optimal performance.",
                features: ["Complete system diagnosis", "Leak detection & repair", "Component replacement", "Performance testing", "Digital diagnostics"],
                gradient: "from-red-500 to-orange-500",
                bgGradient: "from-red-50 to-orange-50"
              },
              {
                title: "Installation & Retrofitting",
                img: "https://images.unsplash.com/photo-1585372172793-c6ba3b3e2e7b?ixlib=rb-4.0.3",
                icon: <Shield className="w-8 h-8" />,
                description: "Professional installation of new AC systems and retrofitting of existing units with the latest technology for maximum efficiency.",
                features: ["New system installation", "Retrofit solutions", "Upgrade consultations", "Warranty coverage", "Energy efficiency optimization"],
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                title: "Maintenance & Service",
                img: "https://images.unsplash.com/photo-1609007734209-50e5c5fb6409?ixlib=rb-4.0.3",
                icon: <Clock className="w-8 h-8" />,
                description: "Regular maintenance services and preventive care to ensure your AC system runs efficiently year-round with optimal cooling performance.",
                features: ["Preventive maintenance", "Filter replacement", "System cleaning", "Performance optimization", "Seasonal check-ups"],
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50"
              },
            ].map((service, i) => (
              <div
                key={i}
                className={`group transition-all duration-1000 delay-${i * 100} ${fadeInUp(`service-${i}`)}`}
                id={`service-${i}`}
              >
                <div className="relative h-full">
                  {/* Card Background Glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  
                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 h-full group-hover:scale-105 transition-transform duration-500">
                    {/* Image Section */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={service.img}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`}></div>
                      
                      {/* Floating Icon */}
                      <div className={`absolute top-6 left-6 w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-300`}>
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className={`p-8 bg-gradient-to-br ${service.bgGradient}`}>
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      
                      {/* Features List */}
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      {/* Action Button */}
                      <button className={`w-full py-3 bg-gradient-to-r ${service.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all group-hover:scale-105`}>
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Testimonials Section ================= */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${fadeInUp('testimonials-header')}`} id="testimonials-header">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-100 rounded-full mb-6">
              <Star className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-600 font-semibold">Client Reviews</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                What Our Clients Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Real experiences from satisfied customers who trust us with their comfort
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Santos",
                role: "Business Executive",
                company: "Tech Solutions Inc.",
                text: "2Loy completely transformed my car's AC system! The cooling is now incredibly efficient and the service was professional from start to finish. My daily commute is so much more comfortable now. Highly recommended!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b5f4?ixlib=rb-4.0.3",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                name: "Carlos Rodriguez",
                role: "Fleet Manager",
                company: "Logistics Pro",
                text: "Outstanding service quality and attention to detail. They've been maintaining our entire fleet's AC systems for over two years now. Never disappointed! Their expertise keeps our vehicles running cool.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                name: "Jennifer Lee",
                role: "Sales Director",
                company: "Metro Realty",
                text: "Fast, reliable, and reasonably priced. My car's AC broke down during the hottest summer day, and 2Loy had it running perfectly within hours. Absolute lifesavers! Professional and efficient service.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3",
                gradient: "from-purple-500 to-indigo-500"
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`transition-all duration-1000 delay-${i * 100} ${fadeInUp(`testimonial-${i}`)}`}
                id={`testimonial-${i}`}
              >
                <div className="group relative h-full">
                  {/* Card Glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${testimonial.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 h-full group-hover:scale-105 transition-transform duration-500">
                    {/* Rating Stars */}
                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Star key={idx} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <blockquote className="text-gray-700 italic mb-8 text-lg leading-relaxed">
                      "{testimonial.text}"
                    </blockquote>
                    
                    {/* Author Info */}
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className={`absolute -inset-1 bg-gradient-to-r ${testimonial.gradient} rounded-2xl blur opacity-40`}></div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-bold text-gray-800">{testimonial.name}</h4>
                        <p className="text-gray-600 font-medium">{testimonial.role}</p>
                        <p className="text-gray-500 text-sm">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className={`mt-20 transition-all duration-1000 delay-600 ${fadeInUp('trust-indicators')}`} id="trust-indicators">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Trusted by Industry Leaders</h3>
              <p className="text-gray-600">Join thousands of satisfied customers across the Philippines</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { metric: "5000+", label: "Happy Customers" },
                { metric: "99.9%", label: "Uptime Rate" },
                { metric: "24hrs", label: "Average Response" },
                { metric: "10+", label: "Years Experience" }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                    {item.metric}
                  </div>
                  <div className="text-gray-600 font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Call to Action ================= */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-cyan-600 to-purple-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <><div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div><div className="absolute bottom-32 right-32 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/10 rounded-full blur-2xl animate-pulse delay-500"></div></>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className={`transition-all duration-1000 ${fadeInUp('cta')}`} id="cta">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center">
                <Snowflake className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-white">
              Ready to Stay Cool?
            </h2>
            <p className="text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Experience the difference with 2Loy's premium car air conditioning services. 
              Book your appointment today and drive in perfect comfort tomorrow.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button className="group px-12 py-6 bg-white text-blue-600 font-bold rounded-2xl text-xl shadow-2xl hover:shadow-white/25 transition-all transform hover:scale-105 hover:-rotate-1">
                <div className="flex items-center justify-center">
                  <Phone className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Book Service Now
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
              
              <button className="px-12 py-6 border-2 border-white text-white font-semibold rounded-2xl text-xl hover:bg-white/10 transition-all backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <Mail className="w-6 h-6 mr-3" />
                  Get Free Quote
                </div>
              </button>
            </div>

            {/* Contact Info Quick Access */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: <Phone className="w-6 h-6" />, title: "Call Us", info: "+63 917 123 4567" },
                { icon: <Mail className="w-6 h-6" />, title: "Email Us", info: "hello@2loy.com" },
                { icon: <MapPin className="w-6 h-6" />, title: "Visit Us", info: "Metro Manila, PH" }
              ].map((contact, i) => (
                <div key={i} className="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <div className="text-white">{contact.icon}</div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">{contact.title}</div>
                    <div className="text-blue-100 text-sm">{contact.info}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Modern Footer ================= */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-20 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Snowflake className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30"></div>
                </div>
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    2LOY
                  </h3>
                  <p className="text-gray-400 font-semibold">Car Aircon Pro Services</p>
                </div>
              </div>
              <p className="text-gray-300 mb-8 max-w-lg leading-relaxed text-lg">
                Your trusted partner for all car air conditioning needs. We deliver premium cooling 
                solutions with professional expertise and unmatched customer service across the Philippines.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <button key={social} className="w-12 h-12 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-bold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold text-white mb-8">Quick Links</h4>
              <ul className="space-y-4">
                {[
                  { name: 'Home', href: '#home' },
                  { name: 'About Us', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Reviews', href: '#testimonials' },
                  { name: 'Contact', href: '#contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 inline-block">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold text-white mb-8">Get in Touch</h4>
              <div className="space-y-6">
                {[
                  { icon: <Phone className="w-5 h-5" />, title: "Phone", info: "+63 917 123 4567" },
                  { icon: <Mail className="w-5 h-5" />, title: "Email", info: "hello@2loy.com" },
                  { icon: <MapPin className="w-5 h-5" />, title: "Location", info: "Metro Manila, Philippines" }
                ].map((contact, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      {contact.icon}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{contact.title}</div>
                      <div className="text-gray-400 text-sm">{contact.info}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                <h5 className="text-white font-semibold mb-3">Business Hours</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Mon - Fri:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Saturday:</span>
                    <span>8:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Sunday:</span>
                    <span>Emergency Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-center lg:text-left">
                © 2025 2Loy Car Aircon Services. All rights reserved. | Designed with ❄️ for your comfort
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
  
}
