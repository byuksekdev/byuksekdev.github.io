import React from 'react';
import { FileText, Linkedin, Github, Mail } from 'lucide-react';

const About = () => {
  const aboutLinks = [
    {
      label: "Resume",
      icon: <FileText className="w-5 h-5" />,
      href: "https://drive.google.com/file/d/1eb_TrfVe3E84kvs_qcLWup0IzrUP689h/view?usp=sharing",
      bg: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      shadow: "hover:shadow-amber-500/20"
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      href: "https://www.linkedin.com/in/burak-yuksek/",
      bg: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      shadow: "hover:shadow-blue-500/20"
    },
    {
      label: "GitHub",
      icon: <Github className="w-5 h-5" />,
      href: "https://github.com/burakyu",
      bg: "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700",
      shadow: "hover:shadow-zinc-500/20"
    },
    {
      label: "Gmail",
      icon: <Mail className="w-5 h-5" />,
      href: "mailto:burakyuksek572@gmail.com",
      bg: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      shadow: "hover:shadow-red-500/20"
    }
  ];

  return (
    <section id="about" className="pt-20 pb-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="about-card relative liquid-glass bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 md:p-8">
          <div className="about-card-overlay absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-cyan-500/[0.03] rounded-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-[1fr_2fr] gap-8 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative group">
                <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl">
                  <img
                    src="/profile.jpeg"
                    alt="Burak Yuksek"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 order-1 md:order-2">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="text-[var(--text-primary)]">Burak </span>
                  <span className="text-[var(--accent)]">Yüksek</span>
                </h1>

                {/* <h2 className="text-xl font-semibold text-[var(--text-secondary)]">
                  Game Developer
                </h2> */}

                <div className="space-y-2 text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  <p>
                    As a Game Developer with nearly 4 years of professional experience in Unity and C#, I have contributed to multiple projects by leveraging my expertise in game programming.
                  </p>
                  <p>
                    I enjoy working closely with artists, designers, and other developers to deliver polished games that leave a lasting impression on players.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {aboutLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 group relative bg-gradient-to-r ${link.bg} text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg ${link.shadow} hover:shadow-xl overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {link.icon}
                    <span className="relative">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;