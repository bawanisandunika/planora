import React, { useEffect, useRef } from 'react';
import { Calendar, Users, Award, Globe, Heart, Shield, ArrowRight, ChevronRight } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { scrollYProgress } = useScroll();
  const yPosHero = useTransform(scrollYProgress, [0, 1], [0, 600]);

  // Framer Motion Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  // Section Refs for scroll reveal
  const missionRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const missionInView = useInView(missionRef, { once: true, margin: '-100px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const teamInView = useInView(teamRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen font-sans antialiased bg-[#FFF8F0] overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-[#4B2E2B]">
        {/* Animated Background Elements */}
        <motion.div style={{ y: yPosHero }} className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-[#8C5A3C] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-[#C08552] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </motion.div>
        
        <div className="relative z-10 max-w-5xl px-6 mx-auto text-center sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="mb-6 text-4xl font-extrabold tracking-tight text-[#FFF8F0] sm:text-5xl lg:text-6xl leading-tight"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08552] to-[#FFF8F0]">Unforgettable</span> Experiences
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="max-w-2xl text-lg font-medium text-[#FFF8F0]/80 sm:text-xl lg:text-2xl leading-relaxed mb-12"
            >
              Planora is the modern platform for visionaries to discover, organize, and attend events that leave a lasting impact.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <button 
                onClick={() => missionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#8C5A3C] hover:bg-[#C08552] transition-colors duration-300 shadow-lg shadow-[#8C5A3C]/30 cursor-pointer"
              >
                <div className="animate-bounce">
                  <ArrowRight className="w-6 h-6 text-[#FFF8F0] transform rotate-90" />
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-24 sm:py-32 relative">
        <div className="max-w-7xl px-6 mx-auto sm:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            variants={fadeInUp}
            initial="hidden"
            animate={missionInView ? 'visible' : 'hidden'}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-[#4B2E2B] sm:text-5xl mb-6">Our Mission</h2>
            <div className="w-24 h-1.5 bg-[#C08552] mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-[#8C5A3C] font-medium leading-relaxed">
              We empower creators and attendees by building a seamless bridge. Our mission is to make amazing events accessible to everyone, and organizing them entirely effortless.
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate={missionInView ? 'visible' : 'hidden'}
          >
            {[
              {
                icon: <Calendar className="w-8 h-8 text-[#FFF8F0]" />,
                title: 'Seamless Discovery',
                description: 'Intelligent search algorithms connect you with events perfectly tailored to your unique interests and passions.',
                bg: 'bg-[#8C5A3C]'
              },
              {
                icon: <Users className="w-8 h-8 text-[#FFF8F0]" />,
                title: 'Vibrant Community',
                description: 'We foster environments where meaningful connections spark, forging bonds through unforgettable shared moments.',
                bg: 'bg-[#C08552]'
              },
              {
                icon: <Award className="w-8 h-8 text-[#FFF8F0]" />,
                title: 'Premium Quality',
                description: 'Every event on Planora is curated to meet high standards, securing a premium experience for all participants.',
                bg: 'bg-[#4B2E2B]'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative p-8 sm:p-10 bg-white rounded-[2rem] shadow-xl shadow-[#8C5A3C]/5 border border-[#FFF8F0] hover:shadow-2xl hover:shadow-[#C08552]/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${item.bg} opacity-10 transition-transform duration-500 group-hover:scale-125`}></div>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.bg} shadow-lg shadow-${item.bg}/30 mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#4B2E2B] mb-4">{item.title}</h3>
                <p className="text-base text-[#8C5A3C] leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Diagonal split background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] to-white transform -skew-y-3 origin-top-left z-0"></div>
        
        <div className="relative z-10 max-w-7xl px-6 mx-auto sm:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              className="lg:w-1/2"
              variants={staggerContainer}
              initial="hidden"
              animate={valuesInView ? 'visible' : 'hidden'}
            >
              <motion.h2 variants={fadeInUp} className="text-4xl font-extrabold tracking-tight text-[#4B2E2B] sm:text-5xl mb-6">Core Values</motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-[#8C5A3C] font-medium mb-12">
                The foundational principles behind our platform and our team. We do not compromise on these beliefs.
              </motion.p>

              <div className="space-y-8">
                {[
                  { icon: <Globe className="w-6 h-6 text-[#C08552]" />, title: 'Radical Inclusivity', desc: 'Events accessible to everyone, globally.' },
                  { icon: <Heart className="w-6 h-6 text-[#C08552]" />, title: 'Community Driven', desc: 'People and genuine human connection first.' },
                  { icon: <Shield className="w-6 h-6 text-[#C08552]" />, title: 'Unshakable Trust', desc: 'Ensuring absolute privacy and safety.' },
                ].map((val, idx) => (
                  <motion.div key={idx} variants={fadeInUp} className="flex group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF8F0] border border-[#C08552]/30 group-hover:bg-[#C08552] group-hover:scale-110 transition-all duration-300">
                        {React.cloneElement(val.icon, { className: 'w-6 h-6 text-[#C08552] group-hover:text-[#FFF8F0] transition-colors' })}
                      </div>
                    </div>
                    <div className="ml-6">
                      <h4 className="text-xl font-bold text-[#4B2E2B] mb-2">{val.title}</h4>
                      <p className="text-[#8C5A3C]">{val.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 w-full"
              variants={scaleIn}
              initial="hidden"
              animate={valuesInView ? 'visible' : 'hidden'}
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#4B2E2B]/20 aspect-square sm:aspect-video lg:aspect-square group">
                <div className="absolute inset-0 bg-[#4B2E2B]/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Excited event crowd" 
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-[#4B2E2B] text-[#FFF8F0]">
        <div className="max-w-7xl px-6 mx-auto sm:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
            variants={staggerContainer}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
          >
            {[
              { value: '10K+', label: 'Events Hosted' },
              { value: '50K+', label: 'Happy Attendees' },
              { value: '500+', label: 'Top Organizers' },
              { value: '25+', label: 'Cities Covered' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="text-center p-6 border border-[#8C5A3C]/40 rounded-3xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-[#C08552] mb-3">{stat.value}</div>
                <div className="text-sm sm:text-base font-bold tracking-wider uppercase text-[#FFF8F0]/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-24 sm:py-32 bg-[#FFF8F0]">
        <div className="max-w-7xl px-6 mx-auto sm:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-20"
            variants={fadeInUp}
            initial="hidden"
            animate={teamInView ? 'visible' : 'hidden'}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-[#4B2E2B] sm:text-5xl mb-6">Meet The Visionaries</h2>
            <p className="text-lg text-[#8C5A3C] font-medium">The passionate minds driving the future of event experiences forward.</p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                img: "https://i.pravatar.cc/300?img=47",
                name: 'Nimali Perera',
                role: 'Founder & CEO',
              },
              {
                img: "https://i.pravatar.cc/300?img=11",
                name: 'Kusal Fernando',
                role: 'Chief Technology Officer',
              },
              {
                img: "https://i.pravatar.cc/300?img=5",
                name: 'Amaya Silva',
                role: 'Head of Experiences',
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                className="group text-center"
                variants={fadeInUp}
                initial="hidden"
                animate={teamInView ? 'visible' : 'hidden'}
                transition={{ delay: index * 0.15 }}
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C08552] to-[#8C5A3C] opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className="relative w-40 h-40 mx-auto rounded-full object-cover border-4 border-white shadow-xl shadow-[#8C5A3C]/20 z-10 filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-bold text-[#4B2E2B] mb-1">{member.name}</h3>
                <p className="font-semibold text-[#C08552] uppercase tracking-wider text-xs">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8C5A3C] to-[#4B2E2B]"></div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C08552] rounded-full mix-blend-multiply opacity-20 filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFF8F0] rounded-full mix-blend-overlay opacity-10 filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-4xl px-6 mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
          >
            <motion.h2 variants={fadeInUp} className="text-5xl font-extrabold tracking-tight text-[#FFF8F0] sm:text-6xl mb-8">
              Ready to create <span className="text-[#C08552]">magic?</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-[#FFF8F0]/80 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of organizers and attendees currently revolutionizing the way events are experienced.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 font-bold text-[#4B2E2B] bg-[#FFF8F0] rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20 flex items-center justify-center group"
              >
                Join Planora 
                <ChevronRight className="w-5 h-5 ml-2 text-[#C08552] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-10 py-4 font-bold text-[#FFF8F0] border-2 border-[#FFF8F0]/30 rounded-full hover:bg-[#FFF8F0]/10 hover:border-[#FFF8F0] transition-all duration-300 flex items-center justify-center"
              >
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
};

export default About;