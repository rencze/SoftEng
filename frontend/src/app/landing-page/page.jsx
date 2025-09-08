    "use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, Star, Shield, Clock, Users, Wrench, Phone, Mail, MapPin, Menu, X, Snowflake, Wind, Thermometer, CheckCircle, ArrowRight, User, UserPlus, Plus, Minus } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

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

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="w-full bg-white text-gray-900 overflow-x-hidden">

      {/* ================= Clean Modern Navbar ================= */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">

            {/* Enhanced Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
            
            {/* Clean Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { name: 'Home', href: '#home' },
                { name: 'About', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Reviews', href: '#testimonials' },
                { name: 'FAQ', href: '#faq' }
              ].map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>
            
            {/* Primary CTA Buttons */}
            <div className="flex items-center space-x-4">
              {/* Book Service */}
              <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
                <Phone className="w-4 h-4 mr-2" />
                Book Service
              </button>

              {/* Login */}
              <Link href="/auth/login">
                <button className="hidden sm:flex items-center px-6 py-3 bg-white text-blue-600 font-semibold border border-blue-600 rounded-lg shadow hover:bg-blue-50 transition-all">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </button>
              </Link>

              {/* Register */}
              <Link href="auth/register">
                <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </button>
              </Link>
            </div>

          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100">
              <nav className="flex flex-col space-y-2">
                {[
                  { name: 'Home', href: '#home' },
                  { name: 'About', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Reviews', href: '#testimonials' },
                  { name: 'FAQ', href: '#faq' }
                ].map((item) => (
                  <a 
                    key={item.name}
                    href={item.href} 
                    className="px-4 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <button className="mt-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Book Service
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ================= Enhanced Hero Section with Photo Background ================= */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Photo Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Car Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/70"></div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 z-1">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl opacity-50 animate-pulse"></div>
        </div>

        {/* 3D Car Section */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block z-2">
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3"
                alt="Luxury Car"
                className="w-[600px] h-[400px] object-contain filter drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Cool Air Effects */}
              <div className="absolute top-32 left-32 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex items-center space-x-2 animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <Wind className="w-5 h-5 text-blue-300" />
                    <div className="w-12 h-1 bg-blue-300 rounded-full opacity-70"></div>
                  </div>
                ))}
              </div>
              
              {/* Temperature Display */}
              <div className="absolute bottom-20 right-20 bg-white/20 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100/20 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">18°C</p>
                    <p className="text-sm text-blue-100">Perfect Cool</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:w-1/2">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30">
                <Snowflake className="w-4 h-4 text-blue-300 mr-2" />
                <span className="text-blue-100 font-semibold text-sm">Premium Car AC Services</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white">
                Stay Cool,<br />
                <span className="text-blue-300">Drive Fresh</span>
              </h1>
            </div>
            
            <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
              Experience ultimate comfort with our professional car air conditioning services. 
              From expert repairs to premium installations - we keep you cool on every journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
                <Snowflake className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                Book Your Service
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl shadow-lg hover:bg-white/30 hover:shadow-xl border border-white/30 transition-all">
                <Phone className="w-5 h-5 mr-3 text-blue-300" />
                Call Now
              </button>
            </div>
            
            {/* Clean Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                { icon: <CheckCircle className="w-5 h-5" />, text: "Expert Certified Technicians" },
                { icon: <Shield className="w-5 h-5" />, text: "Comprehensive Warranty" },
                { icon: <Clock className="w-5 h-5" />, text: "Same-Day Service Available" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 bg-white/20 backdrop-blur-md rounded-xl shadow border border-white/30">
                  <div className="text-blue-300">{feature.icon}</div>
                  <span className="text-sm font-medium text-blue-100">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center space-y-3 animate-bounce">
            <button
              onClick={() => {
                const target = document.getElementById("about");
                target?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm text-blue-200 font-semibold focus:outline-none"
            >
              Discover More
            </button>

            <button
              onClick={() => {
                const target = document.getElementById("about");
                target?.scrollIntoView({ behavior: "smooth" });
              }}
              className="p-2 bg-white/20 backdrop-blur-xl rounded-full border border-blue-300 focus:outline-none"
            >
              <ChevronDown className="w-6 h-6 text-blue-200" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= Clean About Section ================= */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${fadeInUp('about-header')}`} id="about-header">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full mb-6">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-semibold">About 2Loy</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              Your Cool Comfort <span className="text-blue-600">Experts</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transforming every drive into a comfortable journey with professional car AC services
            </p>
          </div>

          {/* Story & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Our Story */}
            <div className={`lg:col-span-2 transition-all duration-1000 delay-200 ${fadeInUp('story')}`} id="story">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
                </div>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Founded in 2009 by Vernie Calipusan, 2Loy started as a one-man operation with a passion for expert car aircon service. 
                    Over the years, our dedication and hands-on expertise earned the trust of Tagum City drivers.
                  </p>
                  <p>
                    In 2018, we moved to a bigger facility, and today our team of 7 skilled technicians 
                    continues to provide reliable, efficient, and top-quality air conditioning solutions.
                  </p>
                  <p>
                    What started small has grown into a trusted name, always putting quality service and customer satisfaction first.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={`transition-all duration-1000 delay-300 ${fadeInUp('stats')}`} id="stats">
              <div className="grid grid-cols-1 gap-4 h-full">
                {[
                  { number: "5000+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
                  { number: "10+", label: "Years Experience", icon: <Clock className="w-6 h-6" /> },
                  { number: "24/7", label: "Emergency Service", icon: <Shield className="w-6 h-6" /> },
                  { number: "99%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center hover:shadow-lg transition-shadow">
                    <div className="text-blue-600 flex justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`transition-all duration-1000 delay-400 ${fadeInUp('mission')}`} id="mission">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600">Our Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To deliver exceptional car air conditioning services that exceed expectations through 
                  innovative solutions, expert craftsmanship, and unparalleled customer care. We're committed 
                  to ensuring every vehicle provides optimal comfort and reliability for our valued clients.
                </p>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-500 ${fadeInUp('vision')}`} id="vision">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-600">Our Vision</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To be the Philippines' leading automotive air conditioning service provider, recognized 
                  for our innovation, reliability, and customer satisfaction. We envision a future where 
                  every journey is comfortable, every service exceeds expectations, and every client becomes our advocate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Clean Services Section ================= */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${fadeInUp('services-header')}`} id="services-header">
            <div className="inline-flex items-center px-6 py-3 bg-indigo-100 rounded-full mb-6">
              <Wrench className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-semibold">Our Services</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              Complete <span className="text-blue-600">AC Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Professional car air conditioning services designed to keep you comfortable
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AC Repair & Diagnostics",
                img: "AC_Repair_&_Diagnostics.png",
                icon: <Wrench className="w-6 h-6" />,
                description: "Expert diagnosis and repair of all air conditioning issues using advanced diagnostic equipment and genuine parts.",
                features: ["Complete system diagnosis", "Leak detection & repair", "Component replacement", "Performance testing"],
                color: "blue"
              },
              {
                title: "Installation & Retrofitting",
                img: "Installation_&_Retrofitting.png",
                icon: <Shield className="w-6 h-6" />,
                description: "Professional installation of new AC systems and retrofitting of existing units with latest technology.",
                features: ["New system installation", "Retrofit solutions", "Upgrade consultations", "Warranty coverage"],
                color: "indigo"
              },
              {
                title: "Maintenance & Service",
                img: "Maintenance_&_Service.png",
                icon: <Clock className="w-6 h-6" />,
                description: "Regular maintenance and preventive care to ensure your AC system runs efficiently year-round.",
                features: ["Preventive maintenance", "Filter replacement", "System cleaning", "Performance optimization"],
                color: "green"
              },
            ].map((service, i) => (
              <div
                key={i}
                className={`group transition-all duration-1000 ${fadeInUp(`service-${i}`)}`}
                id={`service-${i}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className={`absolute top-4 left-4 w-12 h-12 bg-${service.color}-600 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {service.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button className={`w-full py-3 bg-${service.color}-600 text-white font-semibold rounded-lg hover:bg-${service.color}-700 transition-colors`}>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Clean Testimonials ================= */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${fadeInUp('testimonials-header')}`} id="testimonials-header">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-100 rounded-full mb-6">
              <Star className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-600 font-semibold">Client Reviews</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              What Our <span className="text-blue-600">Clients Say</span>
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
                text: "2Loy completely transformed my car's AC system! The cooling is now incredibly efficient and the service was professional from start to finish. Highly recommended!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b5f4?ixlib=rb-4.0.3"
              },
              {
                name: "Carlos Rodriguez", 
                role: "Fleet Manager",
                company: "Logistics Pro",
                text: "Outstanding service quality and attention to detail. They've been maintaining our entire fleet's AC systems for over two years now. Never disappointed!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3"
              },
              {
                name: "Jennifer Lee",
                role: "Sales Director", 
                company: "Metro Realty",
                text: "Fast, reliable, and reasonably priced. My car's AC broke down during summer, and 2Loy had it running perfectly within hours. Absolute lifesavers!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3"
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`transition-all duration-1000 ${fadeInUp(`testimonial-${i}`)}`}
                id={`testimonial-${i}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Text */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 shadow"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ Section ================= */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${fadeInUp('faq-header')}`} id="faq-header">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full mb-6">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-semibold">Frequently Asked Questions</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
              Your <span className="text-blue-600">Questions</span> Answered
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Find answers to common questions about our car air conditioning services
            </p>
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            {[
              {
                question: "How often should I service my car's air conditioning system?",
                answer: "We recommend servicing your car's AC system at least once a year to maintain optimal performance. If you notice reduced cooling, strange noises, or unpleasant odors, it's best to schedule a service immediately."
              },
              {
                question: "What causes car AC systems to lose cooling efficiency?",
                answer: "Common causes include refrigerant leaks, clogged filters, compressor issues, electrical problems, or a faulty condenser. Our technicians can diagnose the exact issue through comprehensive testing."
              },
              {
                question: "How long does a typical AC service take?",
                answer: "A basic service usually takes 1-2 hours. More complex repairs might require 3-4 hours. For major issues, we may need to keep your vehicle for a full day. We always provide a time estimate before starting any work."
              },
              {
                question: "Do you use genuine parts for repairs and replacements?",
                answer: "Yes, we use only high-quality, genuine parts from reputable manufacturers. We also offer warranty options on all parts and labor to ensure your peace of mind."
              },
              {
                question: "Can you service all car makes and models?",
                answer: "Absolutely! Our technicians are trained to work on all vehicle types, from compact cars to SUVs and luxury vehicles. We have the tools and expertise to handle both domestic and imported models."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept cash, credit/debit cards, and bank transfers. We also offer flexible payment plans for major repairs through our financing partners."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className={`mb-4 transition-all duration-1000 ${fadeInUp(`faq-${index}`)}`}
                id={`faq-${index}`}
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-5 bg-gray-50 rounded-xl text-left font-semibold text-gray-900 hover:bg-blue-50 transition-colors border border-gray-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {openFAQ === index ? (
                    <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={`px-6 pt-4 pb-5 bg-white border border-gray-200 rounded-b-xl overflow-hidden transition-all duration-500 ${
                    openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA at bottom of FAQ */}
          <div className={`text-center mt-16 transition-all duration-1000 ${fadeInUp('faq-cta')}`} id="faq-cta">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Still have questions?</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our team is ready to answer any other questions you might have about our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Contact Us
              </button>
              <button className="px-8 py-4 border border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                View All Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Clean CTA Section ================= */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700/20"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className={`transition-all duration-1000 ${fadeInUp('cta')}`} id="cta">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Snowflake className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white">
              Ready to Stay Cool?
            </h2>
            <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Experience the difference with 2Loy's premium car air conditioning services. 
              Book your appointment today and drive in perfect comfort.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <div className="flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Book Service Now
                </div>
              </button>
              
              <button className="px-12 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-3" />
                  Get Free Quote
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Clean Footer ================= */}
      <footer className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Snowflake 
                    className="w-6 h-6 text-white animate-spin" 
                    style={{ animationDuration: '8s' }} 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">2LOY</h3>
                  <p className="text-gray-400">Car Aircon Services</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Your trusted partner for all car air conditioning needs. Professional, reliable, 
                and committed to keeping you cool on every journey across the Philippines.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <button key={social} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all">
                    <span className="text-sm font-bold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '#home' },
                  { name: 'About Us', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Reviews', href: '#testimonials' },
                  { name: 'FAQ', href: '#faq' }
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Contact Info</h4>
              <div className="space-y-4">
                {[
                  { icon: <Phone className="w-5 h-5" />, info: "+63 926 863 6456" },
                  { icon: <Mail className="w-5 h-5" />, info: "hello@2loy.com" },
                  { icon: <MapPin className="w-5 h-5" />, info: "Purok 1 Rizal, Canocotan Tagum City, Philippines" }
                ].map((contact, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      {contact.icon}
                    </div>
                    <span className="text-gray-400">{contact.info}</span>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-8 p-4 bg-gray-800 rounded-xl">
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
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-center lg:text-left">
                © 2025 2Loy Car Aircon Services. All rights reserved. | Designed with ❄️ for your comfort | Developed by Lawrence Gonzaga
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // "use client";

    // import Link from 'next/link';
    // import { useState, useEffect } from 'react';
    // import { ChevronDown, Star, Shield, Clock, Users, Wrench, Phone, Mail, MapPin, Menu, X, Snowflake, Wind, Thermometer, CheckCircle, ArrowRight, User, UserPlus  } from 'lucide-react';

    // export default function LandingPage() {
    //   const [scrollY, setScrollY] = useState(0);
    //   const [isVisible, setIsVisible] = useState({});
    //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    //   useEffect(() => {
    //     const handleScroll = () => setScrollY(window.scrollY);
    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    //   }, []);

    //   useEffect(() => {
    //     const observer = new IntersectionObserver(
    //       (entries) => {
    //         entries.forEach((entry) => {
    //           if (entry.isIntersecting) {
    //             setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
    //           }
    //         });
    //       },
    //       { threshold: 0.1 }
    //     );

    //     document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    //     return () => observer.disconnect();
    //   }, []);

    //   const fadeInUp = (id) => isVisible[id] ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0';

    //   return (
    //     <div className="w-full bg-white text-gray-900 overflow-x-hidden">


    //       {/* ================= Clean Modern Navbar ================= */}
    //       <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
    //         <div className="container mx-auto px-6 py-4">
    //           <div className="flex justify-between items-center">

    //                         {/* Enhanced Logo */}
    //                 <div className="flex items-center space-x-4">
    //                   <div className="relative w-16 h-16">
    //                     <img 
    //                       src="/logo.png" 
    //                       alt="Logo" 
    //                       className="w-full h-full object-contain" 
    //                     />
    //                   </div>
    //                 {/* <div>
    //                     <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
    //                     2LOY
    //                     </h1>
    //                     <p className="text-xs font-semibold text-gray-300">Car Aircon Services</p>
    //                 </div> */}
    //                 </div>
    
    //             {/* Clean Logo */}
    //             {/* <div className="flex items-center space-x-4">
    //               <div className="relative group">
    //                 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all duration-300">
    //                   <Snowflake className="w-6 h-6 text-white" />
    //                 </div>
    //               </div>
    //               <div>
    //                 <h1 className="text-2xl font-bold text-blue-600">2LOY</h1>
    //                 <p className="text-xs font-medium text-gray-600">Car Aircon Services</p>
    //               </div>
    //             </div> */}
                
    //             {/* Clean Navigation */}
    //             <nav className="hidden lg:flex items-center space-x-8">
    //               {[
    //                 { name: 'Home', href: '#home' },
    //                 { name: 'About', href: '#about' },
    //                 { name: 'Services', href: '#services' },
    //                 { name: 'Reviews', href: '#testimonials' }
    //               ].map((item) => (
    //                 <a 
    //                   key={item.name}
    //                   href={item.href} 
    //                   className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
    //                 >
    //                   {item.name}
    //                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
    //                 </a>
    //               ))}
    //             </nav>
                
    //                 {/* Primary CTA Buttons */}
    //                 <div className="flex items-center space-x-4">
    //                 {/* Book Service */}
    //                 {/* <Link href="/book-service"> */}
    //                     <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
    //                     <Phone className="w-4 h-4 mr-2" />
    //                     Book Service
    //                     </button>
    //                 {/* </Link> */}

    //                 {/* Login */}
    //                 <Link href="/auth/login">
    //                     <button className="hidden sm:flex items-center px-6 py-3 bg-white text-blue-600 font-semibold border border-blue-600 rounded-lg shadow hover:bg-blue-50 transition-all">
    //                     <User className="w-4 h-4 mr-2" />
    //                     Login
    //                     </button>
    //                 </Link>

    //                 {/* Register */}
    //                 <Link href="auth/register">
    //                     <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
    //                     <UserPlus className="w-4 h-4 mr-2" />
    //                     Register
    //                     </button>
    //                 </Link>
    //                 </div>


    //           </div>
              
    //           {/* Mobile Menu */}
    //           {mobileMenuOpen && (
    //             <div className="lg:hidden mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100">
    //               <nav className="flex flex-col space-y-2">
    //                 {[
    //                   { name: 'Home', href: '#home' },
    //                   { name: 'About', href: '#about' },
    //                   { name: 'Services', href: '#services' },
    //                   { name: 'Reviews', href: '#testimonials' }
    //                 ].map((item) => (
    //                   <a 
    //                     key={item.name}
    //                     href={item.href} 
    //                     className="px-4 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
    //                     onClick={() => setMobileMenuOpen(false)}
    //                   >
    //                     {item.name}
    //                   </a>
    //                 ))}
    //                 <button className="mt-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
    //                   Book Service
    //                 </button>
    //               </nav>
    //             </div>
    //           )}
    //         </div>
    //       </header>











    //       {/* ================= Hero Section with 3D Car ================= */}
    //       <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
    //         {/* Background Elements */}
    //         <div className="absolute inset-0">
    //           <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse"></div>
    //           <div className="absolute bottom-32 right-16 w-48 h-48 bg-indigo-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
    //           <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-cyan-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
    //         </div>

    //         {/* 3D Car Section */}
    //         <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
    //           <div 
    //             className="relative w-full h-full flex items-center justify-center"
    //             style={{ transform: `translateY(${scrollY * 0.1}px)` }}
    //           >
    //             <div className="relative group">
    //               <img
    //                 src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3"
    //                 alt="Luxury Car"
    //                 className="w-[600px] h-[400px] object-contain filter drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700"
    //               />
                  
    //               {/* Cool Air Effects */}
    //               <div className="absolute top-32 left-32 space-y-3">
    //                 {[...Array(4)].map((_, i) => (
    //                   <div 
    //                     key={i}
    //                     className="flex items-center space-x-2 animate-pulse"
    //                     style={{ animationDelay: `${i * 0.3}s` }}
    //                   >
    //                     <Wind className="w-5 h-5 text-blue-500" />
    //                     <div className="w-12 h-1 bg-blue-400 rounded-full opacity-70"></div>
    //                   </div>
    //                 ))}
    //               </div>
                  
    //               {/* Temperature Display */}
    //               <div className="absolute bottom-20 right-20 bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
    //                 <div className="flex items-center space-x-3">
    //                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
    //                     <Thermometer className="w-5 h-5 text-blue-600" />
    //                   </div>
    //                   <div>
    //                     <p className="text-2xl font-bold text-blue-600">18°C</p>
    //                     <p className="text-sm text-gray-600">Perfect Cool</p>
    //                   </div>
    //                 </div>
    //               </div>


    //             </div>
    //           </div>
    //         </div>

    //         {/* Hero Content */}
    //         <div className="relative z-10 container mx-auto px-6 lg:w-1/2">
    //           <div className="space-y-8">
    //             <div className="space-y-6">
    //               <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
    //                 <Snowflake className="w-4 h-4 text-blue-600 mr-2" />
    //                 <span className="text-blue-600 font-semibold text-sm">Premium Car AC Services</span>
    //               </div>
                  
    //               <h1 className="text-5xl lg:text-7xl font-black leading-tight text-gray-900">
    //                 Stay Cool,<br />
    //                 <span className="text-blue-600">Drive Fresh</span>
    //               </h1>
    //             </div>
                
    //             <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
    //               Experience ultimate comfort with our professional car air conditioning services. 
    //               From expert repairs to premium installations - we keep you cool on every journey.
    //             </p>
                
    //             <div className="flex flex-col sm:flex-row gap-4 pt-4">
    //               <button className="group flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:scale-105">
    //                 <Snowflake className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
    //                 Book Your Service
    //                 <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
    //               </button>
                  
    //               <button className="flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all">
    //                 <Phone className="w-5 h-5 mr-3 text-blue-600" />
    //                 Call Now
    //               </button>
    //             </div>
                
    //             {/* Clean Features */}
    //             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
    //               {[
    //                 { icon: <CheckCircle className="w-5 h-5" />, text: "Expert Certified Technicians" },
    //                 { icon: <Shield className="w-5 h-5" />, text: "Comprehensive Warranty" },
    //                 { icon: <Clock className="w-5 h-5" />, text: "Same-Day Service Available" }
    //               ].map((feature, i) => (
    //                 <div key={i} className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow border border-gray-100">
    //                   <div className="text-blue-600">{feature.icon}</div>
    //                   <span className="text-sm font-medium text-gray-700">{feature.text}</span>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         </div>

            

    //                 {/* Enhanced Scroll Indicator */}
    //                     <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
    //             <div className="flex flex-col items-center space-y-3 animate-bounce">
    //                 <button
    //                 onClick={() => {
    //                     const target = document.getElementById("about"); // change "about" to your next section's id
    //                     target?.scrollIntoView({ behavior: "smooth" });
    //                 }}
    //                 className="text-sm text-gray-400 font-semibold focus:outline-none"
    //                 >
    //                 Discover More
    //                 </button>

    //                 <button
    //                 onClick={() => {
    //                     const target = document.getElementById("about");
    //                     target?.scrollIntoView({ behavior: "smooth" });
    //                 }}
    //                 className="p-2 bg-gray-500/30 backdrop-blur-xl rounded-full border border-gray-400 focus:outline-none"
    //                 >
    //                 <ChevronDown className="w-6 h-6 text-gray-200" />
    //                 </button>
    //             </div>
    //             </div>






    //                 {/* Enhanced Scroll Indicator */}
    //         {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
    //         <div className="flex flex-col items-center space-y-3 animate-bounce">
    //             <p className="text-sm text-gray-400 font-semibold">Discover More</p>
    //             <div className="p-2 bg-gray-500/30 backdrop-blur-xl rounded-full border border-gray-400">
    //             <ChevronDown className="w-6 h-6 text-gray-200" />
    //             </div>
    //         </div>
    //         </div> */}


    //       </section>

    //       {/* ================= Clean About Section ================= */}
    //       <section id="about" className="py-24 bg-gray-50">
    //         <div className="container mx-auto px-6">
    //           {/* Header */}
    //           <div className={`text-center mb-20 transition-all duration-1000 ${fadeInUp('about-header')}`} id="about-header">
    //             <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full mb-6">
    //               <Users className="w-5 h-5 text-blue-600 mr-2" />
    //               <span className="text-blue-600 font-semibold">About 2Loy</span>
    //             </div>
    //             <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
    //               Your Cool Comfort <span className="text-blue-600">Experts</span>
    //             </h2>
    //             <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
    //               Transforming every drive into a comfortable journey with professional car AC services
    //             </p>
    //           </div>

    //           {/* Story & Stats Grid */}
    //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
    //             {/* Our Story */}
    //             <div className={`lg:col-span-2 transition-all duration-1000 delay-200 ${fadeInUp('story')}`} id="story">
    //               <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
    //                 <div className="flex items-center mb-6">
    //                   <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
    //                     <Users className="w-6 h-6 text-white" />
    //                   </div>
    //                   <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
    //                 </div>
    //                 <div className="space-y-4 text-gray-600 leading-relaxed">
    //                   <p>
    //                     ounded in 2009 by Vernie Calipusan, 2Loy started as a one-man operation with a passion for expert car aircon service. 
    //                     Over the years, our dedication and hands-on expertise earned the trust of Tagum City drivers.
    //                   </p>
    //                   <p>
    //                     In 2018, we moved to a bigger facility, and today our team of 7 skilled technicians 
    //                     continues to provide reliable, efficient, and top-quality air conditioning solutions.
    //                   </p>
    //                   <p>
    //                     What started small has grown into a trusted name, always putting quality service and customer satisfaction first.
    //                   </p>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* Stats */}
    //             <div className={`transition-all duration-1000 delay-300 ${fadeInUp('stats')}`} id="stats">
    //               <div className="grid grid-cols-1 gap-4 h-full">
    //                 {[
    //                   { number: "5000+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
    //                   { number: "10+", label: "Years Experience", icon: <Clock className="w-6 h-6" /> },
    //                   { number: "24/7", label: "Emergency Service", icon: <Shield className="w-6 h-6" /> },
    //                   { number: "99%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> }
    //                 ].map((stat, i) => (
    //                   <div key={i} className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center hover:shadow-lg transition-shadow">
    //                     <div className="text-blue-600 flex justify-center mb-3">
    //                       {stat.icon}
    //                     </div>
    //                     <div className="text-2xl font-bold text-blue-600 mb-1">
    //                       {stat.number}
    //                     </div>
    //                     <div className="text-sm font-medium text-gray-600">
    //                       {stat.label}
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //           </div>

    //           {/* Mission & Vision */}
    //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    //             <div className={`transition-all duration-1000 delay-400 ${fadeInUp('mission')}`} id="mission">
    //               <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
    //                 <div className="flex items-center mb-6">
    //                   <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
    //                     <Shield className="w-6 h-6 text-white" />
    //                   </div>
    //                   <h3 className="text-2xl font-bold text-blue-600">Our Mission</h3>
    //                 </div>
    //                 <p className="text-gray-600 leading-relaxed">
    //                   To deliver exceptional car air conditioning services that exceed expectations through 
    //                   innovative solutions, expert craftsmanship, and unparalleled customer care. We're committed 
    //                   to ensuring every vehicle provides optimal comfort and reliability for our valued clients.
    //                 </p>
    //               </div>
    //             </div>

    //             <div className={`transition-all duration-1000 delay-500 ${fadeInUp('vision')}`} id="vision">
    //               <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
    //                 <div className="flex items-center mb-6">
    //                   <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4">
    //                     <Star className="w-6 h-6 text-white" />
    //                   </div>
    //                   <h3 className="text-2xl font-bold text-indigo-600">Our Vision</h3>
    //                 </div>
    //                 <p className="text-gray-600 leading-relaxed">
    //                   To be the Philippines' leading automotive air conditioning service provider, recognized 
    //                   for our innovation, reliability, and customer satisfaction. We envision a future where 
    //                   every journey is comfortable, every service exceeds expectations, and every client becomes our advocate.
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </section>

    //       {/* ================= Clean Services Section ================= */}
    //       <section id="services" className="py-24 bg-white">
    //         <div className="container mx-auto px-6">
    //           {/* Header */}
    //           <div className={`text-center mb-16 transition-all duration-1000 ${fadeInUp('services-header')}`} id="services-header">
    //             <div className="inline-flex items-center px-6 py-3 bg-indigo-100 rounded-full mb-6">
    //               <Wrench className="w-5 h-5 text-indigo-600 mr-2" />
    //               <span className="text-indigo-600 font-semibold">Our Services</span>
    //             </div>
    //             <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
    //               Complete <span className="text-blue-600">AC Solutions</span>
    //             </h2>
    //             <p className="text-xl text-gray-600 max-w-4xl mx-auto">
    //               Professional car air conditioning services designed to keep you comfortable
    //             </p>
    //           </div>

    //           {/* Services Grid */}
    //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    //             {[
    //               {
    //                 title: "AC Repair & Diagnostics",
    //                 img: "AC_Repair_&_Diagnostics.png",
    //                 icon: <Wrench className="w-6 h-6" />,
    //                 description: "Expert diagnosis and repair of all air conditioning issues using advanced diagnostic equipment and genuine parts.",
    //                 features: ["Complete system diagnosis", "Leak detection & repair", "Component replacement", "Performance testing"],
    //                 color: "blue"
    //               },
    //               {
    //                 title: "Installation & Retrofitting",
    //                 img: "Installation_&_Retrofitting.png",
    //                 icon: <Shield className="w-6 h-6" />,
    //                 description: "Professional installation of new AC systems and retrofitting of existing units with latest technology.",
    //                 features: ["New system installation", "Retrofit solutions", "Upgrade consultations", "Warranty coverage"],
    //                 color: "indigo"
    //               },
    //               {
    //                 title: "Maintenance & Service",
    //                 img: "Maintenance_&_Service.png",
    //                 icon: <Clock className="w-6 h-6" />,
    //                 description: "Regular maintenance and preventive care to ensure your AC system runs efficiently year-round.",
    //                 features: ["Preventive maintenance", "Filter replacement", "System cleaning", "Performance optimization"],
    //                 color: "green"
    //               },
    //             ].map((service, i) => (
    //               <div
    //                 key={i}
    //                 className={`group transition-all duration-1000 ${fadeInUp(`service-${i}`)}`}
    //                 id={`service-${i}`}
    //                 style={{ transitionDelay: `${(i + 1) * 100}ms` }}
    //               >
    //                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
    //                   {/* Image */}
    //                   <div className="relative h-48 overflow-hidden">
    //                     <img
    //                       src={service.img}
    //                       alt={service.title}
    //                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    //                     />
    //                     <div className="absolute inset-0 bg-black/20"></div>
    //                     <div className={`absolute top-4 left-4 w-12 h-12 bg-${service.color}-600 rounded-xl flex items-center justify-center text-white shadow-lg`}>
    //                       {service.icon}
    //                     </div>
    //                   </div>
                      
    //                   {/* Content */}
    //                   <div className="p-6">
    //                     <h3 className="text-xl font-bold mb-3 text-gray-900">
    //                       {service.title}
    //                     </h3>
    //                     <p className="text-gray-600 mb-4 leading-relaxed">
    //                       {service.description}
    //                     </p>
                        
    //                     {/* Features */}
    //                     <ul className="space-y-2 mb-6">
    //                       {service.features.map((feature, idx) => (
    //                         <li key={idx} className="flex items-center text-sm text-gray-600">
    //                           <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
    //                           {feature}
    //                         </li>
    //                       ))}
    //                     </ul>
                        
    //                     <button className={`w-full py-3 bg-${service.color}-600 text-white font-semibold rounded-lg hover:bg-${service.color}-700 transition-colors`}>
    //                       Learn More
    //                     </button>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       </section>

    //       {/* ================= Clean Testimonials ================= */}
    //       <section id="testimonials" className="py-24 bg-gray-50">
    //         <div className="container mx-auto px-6">
    //           {/* Header */}
    //           <div className={`text-center mb-16 transition-all duration-1000 ${fadeInUp('testimonials-header')}`} id="testimonials-header">
    //             <div className="inline-flex items-center px-6 py-3 bg-yellow-100 rounded-full mb-6">
    //               <Star className="w-5 h-5 text-yellow-600 mr-2" />
    //               <span className="text-yellow-600 font-semibold">Client Reviews</span>
    //             </div>
    //             <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
    //               What Our <span className="text-blue-600">Clients Say</span>
    //             </h2>
    //             <p className="text-xl text-gray-600 max-w-4xl mx-auto">
    //               Real experiences from satisfied customers who trust us with their comfort
    //             </p>
    //           </div>

    //           {/* Testimonials Grid */}
    //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    //             {[
    //               {
    //                 name: "Maria Santos",
    //                 role: "Business Executive",
    //                 company: "Tech Solutions Inc.",
    //                 text: "2Loy completely transformed my car's AC system! The cooling is now incredibly efficient and the service was professional from start to finish. Highly recommended!",
    //                 rating: 5,
    //                 image: "https://images.unsplash.com/photo-1494790108755-2616b612b5f4?ixlib=rb-4.0.3"
    //               },
    //               {
    //                 name: "Carlos Rodriguez", 
    //                 role: "Fleet Manager",
    //                 company: "Logistics Pro",
    //                 text: "Outstanding service quality and attention to detail. They've been maintaining our entire fleet's AC systems for over two years now. Never disappointed!",
    //                 rating: 5,
    //                 image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3"
    //               },
    //               {
    //                 name: "Jennifer Lee",
    //                 role: "Sales Director", 
    //                 company: "Metro Realty",
    //                 text: "Fast, reliable, and reasonably priced. My car's AC broke down during summer, and 2Loy had it running perfectly within hours. Absolute lifesavers!",
    //                 rating: 5,
    //                 image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3"
    //               },
    //             ].map((testimonial, i) => (
    //               <div
    //                 key={i}
    //                 className={`transition-all duration-1000 ${fadeInUp(`testimonial-${i}`)}`}
    //                 id={`testimonial-${i}`}
    //                 style={{ transitionDelay: `${(i + 1) * 100}ms` }}
    //               >
    //                 <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
    //                   {/* Rating */}
    //                   <div className="flex mb-4">
    //                     {[...Array(testimonial.rating)].map((_, idx) => (
    //                       <Star key={idx} className="w-5 h-5 text-yellow-400 fill-current" />
    //                     ))}
    //                   </div>
                      
    //                   {/* Text */}
    //                   <blockquote className="text-gray-700 mb-6 leading-relaxed">
    //                     "{testimonial.text}"
    //                   </blockquote>
                      
    //                   {/* Author */}
    //                   <div className="flex items-center">
    //                     <img
    //                       src={testimonial.image}
    //                       alt={testimonial.name}
    //                       className="w-12 h-12 rounded-full object-cover mr-4 shadow"
    //                     />
    //                     <div>
    //                       <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
    //                       <p className="text-gray-600 text-sm">{testimonial.role}</p>
    //                       <p className="text-gray-500 text-xs">{testimonial.company}</p>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       </section>

    //       {/* ================= Clean CTA Section ================= */}
    //       <section className="py-24 bg-blue-600 relative overflow-hidden">
    //         <div className="absolute inset-0 bg-blue-700/20"></div>
            
    //         <div className="container mx-auto px-6 text-center relative z-10">
    //           <div className={`transition-all duration-1000 ${fadeInUp('cta')}`} id="cta">
    //             <div className="flex justify-center mb-8">
    //               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
    //                 <Snowflake className="w-8 h-8 text-white" />
    //               </div>
    //             </div>
                
    //             <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white">
    //               Ready to Stay Cool?
    //             </h2>
    //             <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto">
    //               Experience the difference with 2Loy's premium car air conditioning services. 
    //               Book your appointment today and drive in perfect comfort.
    //             </p>
                
    //             <div className="flex flex-col sm:flex-row gap-6 justify-center">
    //               <button className="px-12 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
    //                 <div className="flex items-center justify-center">
    //                   <Phone className="w-5 h-5 mr-3" />
    //                   Book Service Now
    //                 </div>
    //               </button>
                  
    //               <button className="px-12 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
    //                 <div className="flex items-center justify-center">
    //                   <Mail className="w-5 h-5 mr-3" />
    //                   Get Free Quote
    //                 </div>
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </section>

    //       {/* ================= Clean Footer ================= */}
    //       <footer className="bg-gray-900 py-16">
    //         <div className="container mx-auto px-6">
    //           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
    //             {/* Company */}
    //             <div className="lg:col-span-2">
    //               <div className="flex items-center space-x-4 mb-6">

    //                     <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
    //                     <Snowflake 
    //                         className="w-6 h-6 text-white animate-spin" 
    //                         style={{ animationDuration: '8s' }} 
    //                     />
    //                     </div>

    //                 <div>
    //                   <h3 className="text-2xl font-bold text-white">2LOY</h3>
    //                   <p className="text-gray-400">Car Aircon Services</p>
    //                 </div>
    //               </div>
    //               <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
    //                 Your trusted partner for all car air conditioning needs. Professional, reliable, 
    //                 and committed to keeping you cool on every journey across the Philippines.
    //               </p>
                  
    //               {/* Social Links */}
    //               <div className="flex space-x-4">
    //                 {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
    //                   <button key={social} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all">
    //                     <span className="text-sm font-bold">{social[0]}</span>
    //                   </button>
    //                 ))}
    //               </div>
    //             </div>

    //             {/* Quick Links */}
    //             <div>
    //               <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
    //               <ul className="space-y-3">
    //                 {[
    //                   { name: 'Home', href: '#home' },
    //                   { name: 'About Us', href: '#about' },
    //                   { name: 'Services', href: '#services' },
    //                   { name: 'Reviews', href: '#testimonials' },
    //                   { name: 'Contact', href: '#contact' }
    //                 ].map((link) => (
    //                   <li key={link.name}>
    //                     <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
    //                       {link.name}
    //                     </a>
    //                   </li>
    //                 ))}
    //               </ul>
    //             </div>

    //             {/* Contact Info */}
    //             <div>
    //               <h4 className="text-lg font-bold text-white mb-6">Contact Info</h4>
    //               <div className="space-y-4">
    //                 {[
    //                   { icon: <Phone className="w-5 h-5" />, info: "+63 926 863 6456" },
    //                   { icon: <Mail className="w-5 h-5" />, info: "hello@2loy.com" },
    //                   { icon: <MapPin className="w-5 h-5" />, info: "Purok 1 Rizal, Canocotan Tagum City, Philippines" }
    //                 ].map((contact, i) => (
    //                   <div key={i} className="flex items-center space-x-3">
    //                     <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
    //                       {contact.icon}
    //                     </div>
    //                     <span className="text-gray-400">{contact.info}</span>
    //                   </div>
    //                 ))}
    //               </div>

    //               {/* Business Hours */}
    //               <div className="mt-8 p-4 bg-gray-800 rounded-xl">
    //                 <h5 className="text-white font-semibold mb-3">Business Hours</h5>
    //                 <div className="space-y-2 text-sm">
    //                   <div className="flex justify-between text-gray-300">
    //                     <span>Mon - Fri:</span>
    //                     <span>8:00 AM - 6:00 PM</span>
    //                   </div>
    //                   <div className="flex justify-between text-gray-300">
    //                     <span>Saturday:</span>
    //                     <span>8:00 AM - 4:00 PM</span>
    //                   </div>
    //                   <div className="flex justify-between text-gray-300">
    //                     <span>Sunday:</span>
    //                     <span>Emergency Only</span>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>

    //           {/* Footer Bottom */}
    //           <div className="border-t border-gray-800 mt-12 pt-8">
    //             <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
    //               <div className="text-gray-400 text-center lg:text-left">
    //                 © 2025 2Loy Car Aircon Services. All rights reserved. | Designed with ❄️ for your comfort | Developed by Lawrence Gonzaga
    //               </div>
    //               <div className="flex space-x-6 text-sm">
    //                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
    //                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
    //                 <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </footer>
    //     </div>
    //   );
    // }
