import React from 'react';
import { Send, FileText, Linkedin, Github, Mail } from 'lucide-react';

const Contact = () => {
  const contactLinks = [
    {
      icon: <FileText className="w-5 h-5 text-white" />,
      href: "https://drive.google.com/file/d/1eb_TrfVe3E84kvs_qcLWup0IzrUP689h/view?usp=sharing",
      bg: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      shadow: "hover:shadow-amber-500/30"
    },
    {
      icon: <Linkedin className="w-5 h-5 text-white" />,
      href: "https://www.linkedin.com/in/burak-yuksek/",
      bg: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      shadow: "hover:shadow-blue-500/30"
    },
    {
      icon: <Github className="w-5 h-5 text-white" />,
      href: "https://github.com/burakyu",
      bg: "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700",
      shadow: "hover:shadow-zinc-500/30"
    },
    {
      icon: <Mail className="w-5 h-5 text-white" />,
      href: "mailto:burakyuksek572@gmail.com",
      bg: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      shadow: "hover:shadow-red-500/30"
    }
  ];

  return (
    <section id="contact" className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="relative liquid-glass bg-[var(--bg-card)] rounded-3xl p-8 md:p-12 border border-[var(--border-card)]">
            <div className="relative text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="liquid-glass-soft w-12 h-12 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-2xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  Let's Connect
                </h3>
              </div>

              <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Interested in collaboration or just want to say hello? Feel free to reach out through any of these platforms.
              </p>

              <div className="flex justify-center items-center gap-4">
                {contactLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`group w-14 h-14 bg-gradient-to-br ${link.bg} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${link.shadow} hover:shadow-2xl relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="relative">{link.icon}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 border-t border-[var(--border-card)] py-6">
        <div className="text-center">
          <p className="text-[var(--text-faint)] text-sm">
            © {new Date().getFullYear()} Burak Yüksek
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;