'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
  const mdtRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Scroll progress bar
    const prog = document.getElementById('prog');
    const handleScroll = () => {
      if (prog) {
        const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        prog.style.width = Math.min(pct, 100) + '%';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection observer for reveal animations
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    document.querySelectorAll('.reveal').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = (i % 3) * 0.08 + 's';
      obs.observe(el);
    });

    // Animate hero tags with delay
    const tags = [document.getElementById('t1'), document.getElementById('t2'), document.getElementById('t3')];
    tags.forEach((t, i) => {
      setTimeout(() => {
        if (t) t.classList.add('show');
      }, 900 + i * 180);
    });

    // Set mockup date
    if (mdtRef.current) {
      const d = new Date();
      mdtRef.current.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    // Animate focus bars on hover
    const fbars = document.querySelectorAll('.fbar');
    const fcard = document.querySelector('.bc:has(.focus-bars)');
    let interval: NodeJS.Timeout;
    if (fcard) {
      interval = setInterval(() => {
        const active = Math.floor(Math.random() * fbars.length);
        fbars.forEach((b, i) => b.classList.toggle('active', i === active));
      }, 1400);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (interval) clearInterval(interval);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="landing-page-wrapper">
      <div className="progress-bar" id="prog"></div>

      {/* Aurora Background */}
      <div className="aurora" aria-hidden="true">
        <div className="ab ab1"></div>
        <div className="ab ab2"></div>
        <div className="ab ab3"></div>
        <div className="ab ab4"></div>
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <a className="landing-logo" href="#">
            <div className="logo-mark" aria-hidden="true">⚡</div>
            <span className="logo-text">LifeSaver</span>
          </a>
          <ul className="nav-links" role="list">
            <li><a href="#">Features</a></li>
            <li><a href="#">Integrations</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
          <div className="nav-act">
            <Link href="/auth" className="btn-g">Sign in</Link>
            <Link href="/auth" className="btn-p">Start free →</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-in">
          <div>
            <div className="badge">
              <div className="badge-dot" aria-hidden="true">✨</div>
              Now with Gemini AI — smarter task parsing
            </div>
            <h1 className="hero-h">Turn chaos<br />into <span className="grad-text">calendar.</span></h1>
            <p className="hero-sub">LifeSaver parses your tasks by text or voice, builds your schedule, and makes sure nothing falls through the cracks — ever again.</p>
            <div className="hero-ctas">
              <Link href="/auth" className="btn-p lg">Get started free</Link>
              <a className="btn-o" href="#">Watch it work →</a>
            </div>
            <div className="sp">
              <div className="avs" aria-label="User avatars">
                <div className="av" style={{ background: 'linear-gradient(135deg,#5B6CF0,#818CF8)' }}>A</div>
                <div className="av" style={{ background: 'linear-gradient(135deg,#06B6D4,#0EA5E9)' }}>M</div>
                <div className="av" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>J</div>
                <div className="av" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>S</div>
              </div>
              <span className="sp-text"><strong>2,400+</strong> teams shipped faster this month</span>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="mock-wrap" aria-hidden="true">
            {/* Float card: habit ring */}
            <div className="fc fc1">
              <div className="ring-row">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <circle cx="25" cy="25" r="20" stroke="#E5E7EB" strokeWidth="4.5" />
                  <circle cx="25" cy="25" r="20" stroke="#5B6CF0" strokeWidth="4.5" strokeLinecap="round"
                    strokeDasharray="125.6" strokeDashoffset="25" transform="rotate(-90 25 25)" />
                  <text x="25" y="30" textAnchor="middle" fill="#0B1240" fontSize="11" fontWeight="700" fontFamily="Sora,sans-serif">80%</text>
                </svg>
                <div className="ring-inf">
                  <div className="rname">Daily habits</div>
                  <div className="rstr">🔥 14-day streak</div>
                </div>
              </div>
            </div>

            {/* Main mockup card */}
            <div className="mock-card">
              <div className="mock-head">
                <span className="mock-title">Today&apos;s Plan</span>
                <span className="mock-dt" id="mdt" ref={mdtRef}>Sun, Jun 28</span>
              </div>
              <div className="ai-box">
                <div className="ai-lbl">⚡ AI Parsing</div>
                <div className="ai-txt">dentist appt friday 3pm + call sarah<span className="cursor"></span></div>
              </div>
              <div className="tags">
                <div className="tag b" id="t1">📅 Friday 3:00 PM</div>
                <div className="tag g" id="t2">🦷 Dentist</div>
                <div className="tag am" id="t3">📞 Call Sarah</div>
              </div>
              <div className="tasks">
                <div className="t-row">
                  <div className="chk done"></div>
                  <span className="t-lbl s">Morning standup</span>
                  <span className="t-time">9:00 AM</span>
                </div>
                <div className="t-row">
                  <div className="chk done"></div>
                  <span className="t-lbl s">Review PR #247</span>
                  <span className="t-time">10:30 AM</span>
                </div>
                <div className="t-row">
                  <div className="chk"></div>
                  <span className="t-lbl">Send weekly report</span>
                  <span className="t-time u">Due 5 PM</span>
                </div>
                <div className="t-row">
                  <div className="chk"></div>
                  <span className="t-lbl">Plan Q3 roadmap</span>
                  <span className="t-time">Tomorrow</span>
                </div>
              </div>
            </div>

            {/* Float card: stats */}
            <div className="fc fc2">
              <div className="fc-lbl">Tasks completed</div>
              <div className="fc-val">14<small>↑ 23%</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGOS ═══ */}
      <div className="logos reveal">
        <div className="logos-lbl">Loved by teams at</div>
        <div className="logos-row" aria-label="Company logos">
          <span className="l-item">Notion</span>
          <span className="l-item">Linear</span>
          <span className="l-item">Vercel</span>
          <span className="l-item">Figma</span>
          <span className="l-item">Stripe</span>
          <span className="l-item">Shopify</span>
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section className="features-sec">
        <div className="landing-container">
          <div className="sec-lbl reveal">Everything you need</div>
          <h2 className="sec-h2 reveal">Built for people who actually get things done</h2>
          <p className="sec-sub reveal">From first thought to finished task — LifeSaver handles the system so you focus on the work.</p>
          <div className="bento">

            <div className="bc s7 reveal">
              <div className="ci pu" aria-hidden="true">🤖</div>
              <h3>AI that understands how you think</h3>
              <p>Type or say &quot;dentist Friday 3pm, call Sarah after&quot; and LifeSaver creates the tasks, sets the reminders, and blocks your calendar — no forms, no friction.</p>
              <div className="ai-mini-demo">
                <div className="demo-row">
                  <span className="demo-in">&quot;buy milk on the way home tonight&quot;</span>
                  <span className="demo-arrow">→</span>
                  <span className="demo-out">📍 Tonight, 6 PM</span>
                </div>
                <div className="demo-row">
                  <span className="demo-in">&quot;finish deck before sarah&apos;s 9am&quot;</span>
                  <span className="demo-arrow">→</span>
                  <span className="demo-out">⚠️ Urgent, 8:30 AM</span>
                </div>
              </div>
            </div>

            <div className="bc s5 reveal">
              <div className="ci te" aria-hidden="true">🎙️</div>
              <h3>Voice-first capture</h3>
              <p>Hands full? Brain moving fast? Speak it into existence. LifeSaver parses voice notes into structured tasks — instantly and accurately.</p>
            </div>

            <div className="bc s4 reveal">
              <div className="ci am" aria-hidden="true">🎯</div>
              <h3>Goals, not just tasks</h3>
              <p>Connect tasks to bigger goals and watch momentum build. Every completed task moves the needle on what matters most.</p>
            </div>

            <div className="bc s4 reveal">
              <div className="ci gr" aria-hidden="true">🔁</div>
              <h3>Habit engine</h3>
              <p>Build streaks. Break patterns. The built-in habit tracker learns what works and keeps you accountable without nagging.</p>
              <div className="habit-rings">
                <div className="hring">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" stroke="#E5E7EB" strokeWidth="3.5" fill="none" />
                    <circle cx="20" cy="20" r="15" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      strokeDasharray="94.2" strokeDashoffset="14" transform="rotate(-90 20 20)" />
                  </svg>
                  <span className="hring-lbl">Exercise</span>
                </div>
                <div className="hring">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" stroke="#E5E7EB" strokeWidth="3.5" fill="none" />
                    <circle cx="20" cy="20" r="15" stroke="#5B6CF0" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      strokeDasharray="94.2" strokeDashoffset="28" transform="rotate(-90 20 20)" />
                  </svg>
                  <span className="hring-lbl">Reading</span>
                </div>
                <div className="hring">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" stroke="#E5E7EB" strokeWidth="3.5" fill="none" />
                    <circle cx="20" cy="20" r="15" stroke="#F59E0B" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      strokeDasharray="94.2" strokeDashoffset="48" transform="rotate(-90 20 20)" />
                  </svg>
                  <span className="hring-lbl">Journal</span>
                </div>
              </div>
            </div>

            <div className="bc s4 reveal">
              <div className="ci co" aria-hidden="true">🎵</div>
              <h3>Focus modes</h3>
              <p>Lo-fi, ambient, or silence — enter deep work mode with one click. Built-in soundscapes and Pomodoro timers keep you in the zone.</p>
              <div className="focus-bars" aria-hidden="true">
                <div className="fbar" style={{ height: '30%' }}></div>
                <div className="fbar" style={{ height: '55%' }}></div>
                <div className="fbar active" style={{ height: '100%' }}></div>
                <div className="fbar" style={{ height: '70%' }}></div>
                <div className="fbar" style={{ height: '45%' }}></div>
                <div className="fbar" style={{ height: '65%' }}></div>
                <div className="fbar" style={{ height: '40%' }}></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ AI SHOWCASE ═══ */}
      <section className="ai-sec reveal">
        <div className="landing-container">
          <div className="ai-wrap">
            <div className="ai-l">
              <div className="ai-pill">✨ Powered by Gemini AI</div>
              <h2>Your procrastination coach, on call 24/7</h2>
              <p>Stuck on something you&apos;ve been avoiding for three days? LifeSaver&apos;s AI coach figures out exactly why — then gives you a concrete first step to break through.</p>
              <ul className="ai-feats">
                <li><span className="ck">✓</span>Natural language parsing — no templates, no forms</li>
                <li><span className="ck">✓</span>Weekly AI audit with personalized performance insights</li>
                <li><span className="ck">✓</span>Procrastination diagnosis and custom action plans</li>
                <li><span className="ck">✓</span>Smart deadline detection from emails and calendar</li>
                <li><span className="ck">✓</span>Future Letter — write messages to your future self</li>
              </ul>
            </div>
            <div className="ai-r">
              <div className="chat-card">
                <div className="chat-hd">
                  <div className="chat-hd-av" aria-hidden="true">⚡</div>
                  <div>
                    <div className="chat-hd-name">LifeSaver AI</div>
                    <div className="chat-hd-status">Online now</div>
                  </div>
                </div>
                <div className="msg u">
                  <div className="msg-av usr" aria-hidden="true">😅</div>
                  <div className="bubble">I&apos;ve been avoiding this report for 3 days. I don&apos;t know why.</div>
                </div>
                <div className="msg a">
                  <div className="msg-av bot" aria-hidden="true">⚡</div>
                  <div className="bubble">Let&apos;s break it down. Is it the blank page, or are you unclear on what &quot;done&quot; looks like here?</div>
                </div>
                <div className="msg u">
                  <div className="msg-av usr" aria-hidden="true">😅</div>
                  <div className="bubble">Honestly… I&apos;m not sure what done even looks like.</div>
                </div>
                <div className="msg a">
                  <div className="msg-av bot" aria-hidden="true">⚡</div>
                  <div className="bubble">Got it — that&apos;s the blocker. I&apos;ve drafted a 5-step outline and set your first checkpoint in 30 minutes. Ready?</div>
                </div>
                <div className="msg a" style={{ marginTop: '4px' }}>
                  <div className="msg-av" style={{ width: '28px' }}></div>
                  <div className="typing">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTEGRATIONS ═══ */}
      <section className="int-sec">
        <div className="sec-lbl reveal">Integrations</div>
        <h2 className="sec-h2 reveal">Works with your whole stack</h2>
        <p className="sec-sub reveal" style={{ marginBottom: '38px' }}>Pull tasks from GitHub issues, Gmail threads, and Google Calendar — everything in one place, nothing copied by hand.</p>
        <div className="int-grid reveal">
          <div className="int-pill"><div className="int-ic">📧</div>Gmail</div>
          <div className="int-pill"><div className="int-ic">📅</div>Google Calendar</div>
          <div className="int-pill"><div className="int-ic">💻</div>GitHub</div>
          <div className="int-pill"><div className="int-ic">🔔</div>Slack</div>
          <div className="int-pill"><div className="int-ic">📝</div>Notion</div>
          <div className="int-pill"><div className="int-ic">📋</div>Linear</div>
          <div className="int-pill"><div className="int-ic">📁</div>Google Drive</div>
          <div className="int-pill"><div className="int-ic">⚡</div>Zapier</div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="test-sec">
        <div className="landing-container">
          <div className="sec-lbl reveal">What people say</div>
          <h2 className="sec-h2 reveal">Real people. Real deadlines. Really met.</h2>
          <p className="sec-sub reveal">From solo founders to engineering leads — LifeSaver is the last productivity app they tried.</p>
          <div className="test-grid">
            <div className="t-card reveal">
              <div className="stars">★★★★★</div>
              <p className="t-txt">&quot;The AI parsing is magic. I texted it &apos;pick up dry cleaning before Sarah&apos;s dinner&apos; and it created a reminder, blocked 20 minutes, and flagged Friday on my calendar. Didn&apos;t lift another finger.&quot;</p>
              <div className="t-auth">
                <div className="t-av" style={{ background: 'linear-gradient(135deg,#5B6CF0,#818CF8)' }}>A</div>
                <div>
                  <div className="t-name">Alex Chen</div>
                  <div className="t-role">Product Lead, Vercel</div>
                </div>
              </div>
            </div>
            <div className="t-card reveal">
              <div className="stars">★★★★★</div>
              <p className="t-txt">&quot;My old system was three apps and a sticky note. LifeSaver replaced all of them. The GitHub sync alone saves me an hour a week — no more copying issue titles into my to-do list.&quot;</p>
              <div className="t-auth">
                <div className="t-av" style={{ background: 'linear-gradient(135deg,#06B6D4,#0EA5E9)' }}>M</div>
                <div>
                  <div className="t-name">Maya Patel</div>
                  <div className="t-role">Senior Engineer, Linear</div>
                </div>
              </div>
            </div>
            <div className="t-card reveal">
              <div className="stars">★★★★★</div>
              <p className="t-txt">&quot;The procrastination coach is unsettling in the best way. Two questions in, it nailed why I&apos;d been avoiding a client proposal for two weeks. I sent it that afternoon.&quot;</p>
              <div className="t-auth">
                <div className="t-av" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>J</div>
                <div>
                  <div className="t-name">James Williams</div>
                  <div className="t-role">Founder, Solo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-sec reveal">
        <div className="landing-container">
          <div className="cta-card">
            <h2>Stop surviving your to-do list.<br />Start owning it.</h2>
            <p>Free forever for solo users. Team plans from $8/month.</p>
            <div className="cta-btns">
              <Link href="/auth" className="btn-p lg">Get started free →</Link>
              <a className="btn-o" href="#">Book a demo</a>
            </div>
            <p className="cta-note">
              <span>No credit card required</span>
              <span>Setup in 2 minutes</span>
              <span>Cancel anytime</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="foot-in">
          <div className="landing-logo">
            <div className="logo-mark" style={{ width: '30px', height: '30px', fontSize: '15px' }} aria-hidden="true">⚡</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>LifeSaver</div>
              <div style={{ fontSize: '12px', color: 'var(--smoke)' }}>AI productivity co-pilot</div>
            </div>
          </div>
          <ul className="foot-links" role="list">
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
          <span className="foot-copy">© 2025 LifeSaver. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
