import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection     from '../components/ui/HeroSection';
import FeaturedCourses from '../components/ui/FeaturedCourses';
import ServicesSection     from '../components/ui/ServicesSection';
import Web3AcademySection  from '../components/ui/Web3AcademySection';
import StatsSection        from '../components/ui/StatsSection';
import WhyFinodiv      from '../components/ui/WhyFinodiv';
import LandingFooter   from '../components/ui/LandingFooter';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="custom-scrollbar" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <HeroSection
        onStartLearning={() => navigate('/login')}
        onExploreCourses={() => navigate('/courses')}
      />
      <FeaturedCourses
        onCourseClick={id => navigate(`/courses/${id}`)}
        onViewAll={() => navigate('/courses')}
      />
      <ServicesSection />
      <Web3AcademySection />
      <StatsSection />
      <WhyFinodiv />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
