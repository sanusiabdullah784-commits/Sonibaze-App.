import React from 'react';

export default function BackgroundEffects() {
  // The complete list of SoniBaze courses
  const courses = [
    'Computer Networking', 'Staff Training', 'Software Development', 
    'Mobile App Development', 'Cybersecurity', 'Web Development', 
    'Cloud Computing', 'Data Analytics', 'Data Science', 
    'AI Automation', 'AI Engineer/Builder', 'Machine Learning (ML)', 
    'Computer Training', 'Project Management', 'Digital Marketing', 
    'UI/UX Design', 'Video Editing'
  ];

  return (
    // Changed to 'absolute' so it stays perfectly inside the main container
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 1. The Network Web Background (Subtle Grid) */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#9333ea 1px, transparent 1px), linear-gradient(90deg, #9333ea 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* 2. Floating Bubbles (Visible and glowing) */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-green-400 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* 3. The Marquee (Scrolling Courses) */}
      <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-purple-900 via-blue-900 to-green-900 py-3 border-b border-white/10 z-20 shadow-lg">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* We repeat the list 4 times to ensure a seamless, infinite scroll */}
            {[...courses, ...courses, ...courses, ...courses].map((course, index) => (
              <div key={index} className="flex items-center gap-3 mx-6 shrink-0">
                <span className="text-white/90 text-sm font-bold tracking-wide uppercase">
                  {course}
                </span>
                <span className="text-green-400 text-lg">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}