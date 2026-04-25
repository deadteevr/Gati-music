import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, User, Share2, MessageCircle, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const BLOG_POSTS = {
  "best-music-distribution-india": {
    title: "Best Music Distribution in India: A Comprehensive Guide for 2026",
    metaTitle: "Best Music Distribution in India 2026 | Gati Music Distribution",
    metaDescription: "Looking for the best music distribution in India? Learn why Gati is the top choice for independent artists with fast delivery, 80% royalties, and WhatsApp support.",
    date: "April 20, 2026",
    author: "Gati Editorial",
    readTime: "8 min read",
    keywords: "best music distribution in india, music distribution service india, release music india",
    content: `
      <p>Independent artists in India are currently witnessing a golden era. With the rise of streaming platforms like Spotify, JioSaavn, and Apple Music, the need for a reliable <strong>music distribution service in India</strong> has never been higher. For many, finding a parter that understands the local market is the difference between a successful release and a stalled career.</p>
      
      <h2>What is the Best Music Distribution in India?</h2>
      <p>When searching for the <strong>best music distribution in India</strong>, artists typically look for three things: speed, support, and fair royalties. Gati Music Distribution has emerged as a top contender by offering 48-hour delivery and direct WhatsApp support, catering specifically to the fast-paced needs of the modern Indian creator.</p>
      
      <p>Most global distributors treat Indian artists as an afterthought, leading to payment delays and lack of regional platform support. Gati focuses purely on empowering the Indian independent music scene. Check our <a href="/pricing">transparent pricing plans</a> to see how we compare.</p>
      
      <h3>Why Gati Music Distribution?</h3>
      <ul>
        <li><strong>Lightning-Fast Delivery:</strong> While others take 2-3 weeks, we deliver in 2-3 days. This speed is essential for maintaining momentum in today's digital climate.</li>
        <li><strong>Human Support:</strong> Skip the email tickets; talk to us on WhatsApp. Our team is local and understands your specific challenges.</li>
        <li><strong>High Royalties:</strong> Keep 80% of what you earn. We don't believe in hidden fees or complicated royalty tiers.</li>
      </ul>
      
      <h2>The Importance of YouTube Content ID</h2>
      <p>For Indian artists, YouTube is a massive revenue stream. One feature that makes a service the <strong>best music distributor in India</strong> is robust Content ID management. Gati ensures that whenever your music is used in a video—anywhere in the world—you get paid. This is included in our basic distribution package.</p>
      
      <p>Choosing the right partner is crucial for your career. Ensure your distributor handles <strong>YouTube Content ID</strong> and provides transparent reports regularly. If you have questions about how Content ID works, feel free to <a href="/contact">contact our support team</a> directly.</p>
    `
  },
  "how-to-release-song-on-spotify-india": {
    title: "How to Release a Song on Spotify in India (Step-by-Step)",
    metaTitle: "How to Release a Song on Spotify in India | Step-by-Step Guide",
    metaDescription: "Master how to release a song on Spotify in India. Our step-by-step guide covers everything from audio quality to choosing the right distributor for your music.",
    date: "April 22, 2026",
    author: "Gati Team",
    readTime: "6 min read",
    keywords: "how to release song on spotify in india, upload music to spotify india, spotify artist india",
    content: `
      <p>Learning <strong>how to release a song on Spotify in India</strong> can seem daunting, but with the right distributor, it's a seamless process. In this guide, we break down the exact steps to get your music live, indexed, and earning royalties.</p>
      
      <h2>Steps to Upload Music to Spotify India</h2>
      <ol>
        <li><strong>Prepare Your Audio:</strong> Ensure your track is in high-quality WAV format (44.1kHz, 16-bit or better). MP3s are not industry standard for distribution.</li>
        <li><strong>Create Your Artwork:</strong> Your cover art should be 3000x3000px, square, and error-free. Avoid excessive text or brand logos that might trigger store rejections.</li>
        <li><strong>Choose Gati Music Distribution:</strong> Sign up and select a <a href="/pricing">monthly or single-release plan</a> that fits your budget.</li>
        <li><strong>Submit Metadata:</strong> Fill in your title, artist name, and contributors accurately. Proper metadata is the secret to getting onto Spotify editorial playlists.</li>
        <li><strong>Final Review:</strong> Our team performs a manual check within 8 hours to ensure everything is perfect.</li>
      </ol>
      
      <h2>Post-Release Strategies</h2>
      <p>Once you know <strong>how to release music on Spotify</strong>, the work doesn't stop. You should immediately claim your 'Spotify for Artists' profile. At Gati, we help our artists get verified and set up their artist pages faster than any other service. This allows you to track real-time analytics and promote your release effectively.</p>
      
      <p>Once you submit, our manual review team ensures everything is perfect. We then deliver your song to <strong>Spotify India</strong> and 250+ other stores! Still confused? Our <a href="/faq">FAQ section</a> covers common technical hurdles creators face.</p>
    `
  },
  "gati-vs-others": {
    title: "Gati Music Distribution vs Other Distributors: Which is Best for You?",
    metaTitle: "Gati vs Other Music Distributors | Which is Best for Indian Artists?",
    metaDescription: "Comparing Gati Music Distribution vs other distributors. See why Indian artists prefer Gati for localized support, faster delivery, and easy royalty payouts.",
    date: "April 24, 2026",
    author: "Industry Analysis",
    readTime: "10 min read",
    keywords: "gati music distribution vs other distributors, best music distributor india review, gati review",
    content: `
      <p>In this <strong>Gati Music Distribution vs other distributors</strong> comparison, we look at why thousands of Indian artists are switching to Gati for their music releases. The market is crowded, but localized needs often go unmet by Western-centric companies.</p>
      
      <h2>Gati vs Global Distributors</h2>
      <p>Global giants like TuneCore or DistroKid often lack localized support for the Indian market. While they offer standard tools, they often fail at providing <strong>WhatsApp support</strong> and 2-day delivery cycles which are essential for active creators in our region. Furthermore, their payment gateways can be complex for Indian accounts.</p>
      
      <h3>Key Differentiators</h3>
      <ul>
        <li><strong>Localized Payment Methods:</strong> We offer easy UPI and direct Bank Transfers. No need for complex PayPal setups or international transaction fees.</li>
        <li><strong>Manual Review:</strong> We catch common metadata errors (like capitalization issues or unauthorized cover art text) that lead to silent rejections elsewhere.</li>
        <li><strong>Regional Expertise:</strong> We understand the Indian music landscape, from Hip-Hop to Regional Folk, and its specific needs on platforms like JioSaavn and Wynk.</li>
        <li><strong>Proximity:</strong> We are built in India, for India. You aren't just another number in a database; you're part of a growing community.</li>
      </ul>
      
      <h2>The Cost Comparison</h2>
      <p>When comparing <strong>Gati vs competitors</strong>, look at the long-term cost. Many services lure you with low upfront fees but charge extra for YouTube Content ID or per-store delivery. Gati keeps it simple. See our <a href="/pricing">all-inclusive pricing</a> for more details.</p>
      
      <p>If you're an independent artist looking for <strong>affordable music distribution in India</strong> with premium features, Gati is designed exactly for you. If you need a custom package for a label, please <a href="/contact">reach out to us</a>.</p>
    `
  },
  "music-marketing-india-2026": {
    title: "Independent Music Marketing in India: 2026 Strategy",
    metaTitle: "Independent Music Marketing Guide India 2026 | Build Your Fanbase",
    metaDescription: "Effective music marketing strategies for Indian independent artists in 2026. Learn how to use Reels, YouTube Shorts, and influencers to grow your streams.",
    date: "April 26, 2026",
    author: "Marketing Expert",
    readTime: "7 min read",
    keywords: "music marketing india, promote music india, independent artist marketing",
    content: `
      <p>In 2026, <strong>music marketing in India</strong> is no longer just about billboard ads or TV spots. It's about community, short-form content, and consistency. For an independent artist, your phone is your biggest marketing tool.</p>
      
      <h2>The Power of Vertical Video</h2>
      <p>Instagram Reels and YouTube Shorts are currently the primary drivers for music discovery in India. If you aren't posting daily, you're missing out on millions of potential local listeners. Create "behind-the-scenes" content or acoustic versions of your tracks to engage your audience.</p>
      
      <h3>Influencer Collaborations</h3>
      <p>Partnering with micro-influencers (10k-50k followers) can often yield better results than one expensive macro-influencer. Find creators whose vibe matches your music. Give them early access to your tracks and let them use your audio in their content. This is how songs go viral on the <strong>best music distribution platforms in India</strong>.</p>
      
      <p>Ready to start your journey? Check our <a href="/pricing">affordable plans</a> designed for growing artists.</p>
    `
  },
  "jiosaavn-vs-wynk-music": {
    title: "JioSaavn vs Wynk Music: Best for Regional Indian Music?",
    metaTitle: "JioSaavn vs Wynk Music | Comparison for Indian Musicians",
    metaDescription: "Comparing JioSaavn and Wynk Music. Which platform is better for regional Indian music distribution and reaching rural audiences?",
    date: "April 28, 2026",
    author: "Regional Analyst",
    readTime: "5 min read",
    keywords: "jiosaavn vs wynk, regional music india, distribution comparison",
    content: `
      <p>While global platforms steal the headlines, <strong>JioSaavn and Wynk Music</strong> remain powerhouses in India, especially for regional languages like Bhojpuri, Haryanvi, and Malayalam. But which one should you focus on?</p>
      
      <h2>JioSaavn: The Urban Favorite</h2>
      <p>JioSaavn has a highly polished UI and a strong preference among urban dwellers. Their curation for Indie and Hip-Hop is exceptional. Distribution to JioSaavn is automated when you use <a href="/">Gati Music</a>.</p>
      
      <h2>Wynk Music: The Rural Giant</h2>
      <p>Wynk, powered by Airtel, has a massive reach in Tier 2 and Tier 3 cities. If your music caters to a traditional or folk-loving audience, Wynk might be your primary source of streams. We ensure your music reaches every corner of the country through these platforms.</p>
      
      <p>Need more technical details on stores? Visit our <a href="/faq">FAQ</a>.</p>
    `
  },
  "understanding-royalties-india": {
    title: "Understanding Music Royalties in India: A Clear Guide",
    metaTitle: "Music Royalties Guide for Indian Artists | Digital & Performance",
    metaDescription: "Confused about how you get paid? Learn about digital, mechanical, and performance royalties for Indian independent musicians.",
    date: "April 30, 2026",
    author: "Financial Specialist",
    readTime: "9 min read",
    keywords: "music royalties india, get paid from music, digital royalties india",
    content: `
      <p>How do you actually make money? <strong>Music royalties in India</strong> can be complex, involving multiple organizations like IPRS and your digital distributor.</p>
      
      <h2>Types of Royalties</h2>
      <ul>
        <li><strong>Digital Royalties:</strong> These come from streams on Spotify, Gaana, etc. Gati pays 80% of these to you.</li>
        <li><strong>Mechanical Royalties:</strong> Earned when your music is reproduced digitally or physically.</li>
        <li><strong>Performance Royalties:</strong> Earned when your music is played on TV, Radio, or in public places.</li>
      </ul>
      
      <p>At Gati, we focus on maximizing your Digital Royalties and providing transparent dashboard reporting. See our <a href="/pricing">pricing</a> to start earning today.</p>
    `
  },
  "spotify-editorial-tips-india": {
    title: "How to Get Playlisted on Spotify India Editorial",
    metaTitle: "Spotify India Editorial Playlist Pitching Tips | Get Featured",
    metaDescription: "Master the art of pitching to Spotify India editors. Increase your chances of landing on New Music Friday or Indie India.",
    date: "May 2, 2026",
    author: "Curation Expert",
    readTime: "6 min read",
    keywords: "spotify editorial playlist india, pitch to spotify, indie india playlist",
    content: `
      <p>Getting on an editorial playlist can change your life. But <strong>Spotify India editors</strong> get thousands of pitches every week. How do you stand out?</p>
      
      <h2>The 3-Week Rule</h2>
      <p>You must submit your music to your distributor at least 3 weeks before the release date. This gives you time to pitch via <strong>Spotify for Artists</strong>. Gati makes this easy by delivering your track within 48 hours of approval.</p>
      
      <p>Focus on your story. Why did you write this song? What genre is it exactly? Be specific. If you need help with metadata, <a href="/contact">contact us</a>.</p>
    `
  },
  "haryanvi-punjabi-music-boom": {
    title: "The Rise of Haryanvi and Punjabi Music: Chart Domination",
    metaTitle: "Haryanvi & Punjabi Music Growth 2026 | Industry Trends India",
    metaDescription: "Why regional music from Haryana and Punjab is dominating the Indian streaming charts and how you can ride the wave.",
    date: "May 4, 2026",
    author: "Trend Analyst",
    readTime: "8 min read",
    keywords: "punjabi music boom, haryanvi music dominance, regional trends india",
    content: `
      <p>From local villages to global nightclubs, <strong>Haryanvi and Punjabi music</strong> is everywhere. This surge is driven by authentic storytelling and high-energy production.</p>
      
      <h2>Vibe Over Lyrics</h2>
      <p>Many listeners now appreciate the 'vibe' of regional songs even if they don't fully understand the language. This has opened doors for artists using <a href="/">Gati Music Distribution</a> to reach global Punjabi and Haryanvi diasporas.</p>
      
      <p>Interested in releasing regional music? We offer specialized support for all Indian languages. <a href="/pricing">View our plans</a>.</p>
    `
  },
  "copyright-laws-for-indian-artists": {
    title: "Music Copyright Laws in India: What Every Artist Must Know",
    metaTitle: "Music Copyright Laws India | Protect Your Songs as an Artist",
    metaDescription: "Protect your intellectual property. A simplified guide to Indian copyright laws for independent music creators.",
    date: "May 6, 2026",
    author: "Legal Consultant",
    readTime: "11 min read",
    keywords: "music copyright india, protect music rights, legal guide artists",
    content: `
      <p>Your music is your asset. Understanding <strong>music copyright in India</strong> ensures you own your work and can monetize it legally.</p>
      
      <h2>Automatic Protection</h2>
      <p>In India, copyright exists as soon as an original work is created and "fixed" in a medium. However, registration with IPRS can provide additional legal layers. Your <strong>music distributor in India</strong> usually handles the protection of your master recordings through Content ID.</p>
      
      <p>Don't let others profit from your hard work. Ensure you have clear contracts with your producers. For more info, reach out to our <a href="/contact">support team</a>.</p>
    `
  },
  "music-video-on-a-budget-india": {
    title: "How to Shoot a Music Video on a Budget in India",
    metaTitle: "Budget Music Video Tips India | High Quality on Low Spend",
    metaDescription: "Don't break the bank. Learn how to create stunning music videos for your releases using just your smartphone and clever locations.",
    date: "May 8, 2026",
    author: "Cinematographer",
    readTime: "7 min read",
    keywords: "music video budget india, smartphone music video, creative locations",
    content: `
      <p>A great song deserves a great visual. But you don't need a Bollywood budget to <strong>shoot a music video in India</strong>.</p>
      
      <h2>Location is Everything</h2>
      <p>India is full of stunning, free locations. From old street markets to lush parks, your surroundings can add immense value. Use natural light—the 'Golden Hour' is your best friend. A well-produced video increases your <strong>Spotify streams</strong> significantly.</p>
      
      <p>Combine a great video with the <a href="/">best music distribution in India</a> to maximize your reach. Check our <a href="/blog">other guides</a> for more tips.</p>
    `
  },
  "artist-collaboration-strategies": {
    title: "Collaboration Strategies: Grow Your Audience via Features",
    metaTitle: "Artist Collaboration Guide India | Grow Your Music Subscriptions",
    metaDescription: "How to find and work with other Indian artists to swap audiences and climb the streaming charts together.",
    date: "May 10, 2026",
    author: "Artist Relations",
    readTime: "6 min read",
    keywords: "artist collaboration, music features india, growing audience",
    content: `
      <p>One plus one equals three in the music industry. <strong>Collaborating with other artists</strong> in India is the fastest way to gain new fans.</p>
      
      <h2>Finding the Right Match</h2>
      <p>Don't just look for famous artists. Look for artists whose fans would genuinely enjoy your music. Cross-promotion on social media after a release can double your initial numbers. When you release a collab via Gati, we ensure both artists get credited correctly on <strong>Spotify and Apple Music</strong>.</p>
      
      <p>Ready to release a collab? See how we handle multi-artist tracks in our <a href="/pricing">pricing section</a>.</p>
    `
  },
  "social-media-musicians-2026": {
    title: "Social Media Strategy for Musicians 2026: The New Rules",
    metaTitle: "Social Media Strategy for Indian Artists 2026 | Reels & Shorts",
    metaDescription: "Social media is changing. Learn the 2026 rules for musicians on Instagram, TikTok, and YouTube in the Indian market.",
    date: "May 12, 2026",
    author: "Social Strategist",
    readTime: "8 min read",
    keywords: "social media musicians, reels for artists, shorts strategy music",
    content: `
      <p>In 2026, the algorithm favors authenticity over perfection. Your <strong>social media strategy</strong> as a musician should reflect who you are as a person, not just a performer.</p>
      
      <h2>Reels Aren't Just for Dancing</h2>
      <p>Use Reels to showcase the 'making of' your song. Shared vulnerability builds deep connections with fans. Also, use interactive stickers on Stories to let fans choose your next cover or single artwork. This engagement tells platforms that your music is worth recommending.</p>
      
      <p>Stay ahead of the curve. Read more on the <a href="/blog">Gati Blog</a> or start your release <a href="/login">here</a>.</p>
    `
  },
  "personal-branding-for-artists": {
    title: "The Importance of Personal Branding for Artists in 2026",
    metaTitle: "Personal Branding Guide for Indian Musicians | Beyond the Music",
    metaDescription: "Why having a brand is just as important as having a good voice. A guide for Indian independent artists on building a unique identity.",
    date: "May 14, 2026",
    author: "Brand Consultant",
    readTime: "10 min read",
    keywords: "personal branding artists, musician identity india, artist marketing",
    content: `
      <p>Music is a product, but you are the brand. <strong>Personal branding for artists</strong> is what separates a one-hit-wonder from a career-long icon.</p>
      
      <h2>Define Your Aesthetic</h2>
      <p>What color represents your music? What is your speaking style? Consistency in these elements across your artwork, social media, and live shows creates a 'world' for your fans to live in. This is why artists choose the <strong>best music distribution India</strong> offers—to ensure their brand is professionally represented on all stores.</p>
      
      <p>Your brand starts with a professional release. <a href="/pricing">Choose a plan</a> that reflects your ambition. For custom brand advice, <a href="/contact">contact our team</a>.</p>
    `
  }
};

export default function BlogPage() {
  const { slug } = useParams();
  const post = slug ? BLOG_POSTS[slug as keyof typeof BLOG_POSTS] : null;

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO: Dynamic Document Title and Description
    if (post) {
      document.title = (post as any).metaTitle || post.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', (post as any).metaDescription || "");
      }
    } else {
      document.title = "Our Blog | Gati Music Distribution";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', "Read the latest guides and articles about music distribution in India, releasing songs on Spotify, and growing your independent music career.");
      }
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, post]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-40 px-6 text-center">
        {/* Canonical URL for SEO */}
        <link rel="canonical" href="https://www.gatimusic.in/blog" />
        
        <h1 className="text-4xl font-display uppercase mb-8">Our Blog</h1>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(BLOG_POSTS).map(([s, p]) => (
            <Link key={s} to={`/blog/${s}`} className="bg-[#111] p-6 rounded-3xl border border-[#222] hover:border-[#B6FF00] transition-all text-left group">
              <h2 className="text-xl font-display uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{p.title}</h2>
              <div className="text-gray-500 text-xs uppercase tracking-widest">{p.date}</div>
            </Link>
          ))}
        </div>

        <div className="mt-20 max-w-2xl mx-auto p-12 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#050505] border border-[#222]">
           <h2 className="text-3xl font-display uppercase mb-6">Need help with your release?</h2>
           <p className="text-gray-400 mb-8">Check our detailed <a href="/faq" className="text-[#B6FF00] hover:underline">FAQ section</a> or <a href="/contact" className="text-[#B6FF00] hover:underline">contact us</a> for customized distribution support.</p>
           <Link to="/pricing" className="inline-block px-10 py-4 rounded-full bg-[#B6FF00] text-black font-display uppercase tracking-widest font-black hover:bg-white transition-all">
             View Pricing
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans">
      {/* Canonical URL for SEO */}
      <link rel="canonical" href={`https://www.gatimusic.in/blog/${slug}`} />
      
      <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-display uppercase tracking-widest text-xs font-bold font-sans">Back to Blog</span>
        </Link>
        <Link to="/" className="font-display font-black tracking-tighter flex items-center gap-1 group">
          <span className="text-[#B6FF00] text-2xl">gati</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-2 group-hover:bg-white transition-colors"></span>
        </Link>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tighter text-white mb-6 leading-none">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-6 mb-12 border-y border-[#1a1a1a] py-6">
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest">
              <User size={14} className="text-[#B6FF00]" /> {post.author}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest">
              <Clock size={14} className="text-[#B6FF00]" /> {post.readTime}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest">
              <span className="text-[#B6FF00]">Date:</span> {post.date}
            </div>
          </div>

          <article 
            className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:font-display prose-h2:uppercase prose-h2:tracking-tight prose-h2:text-[#B6FF00] prose-h2:mt-12 prose-li:text-gray-400 prose-a:text-[#B6FF00] prose-a:no-underline hover:prose-a:underline max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-20 p-8 rounded-3xl bg-[#111] border border-[#222] text-center">
             <h3 className="text-2xl font-display uppercase mb-4">Start your release today</h3>
             <p className="text-gray-400 mb-8 max-w-md mx-auto">Join thousands of Indian artists releasing music worldwide with Gati. It takes less than 5 minutes to set up your profile.</p>
             <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/login" className="inline-block bg-[#B6FF00] text-black px-12 py-5 rounded-full font-display uppercase tracking-widest font-black text-lg hover:bg-white transition-all shadow-[0_0_40px_rgba(182,255,0,0.2)]">
                  Register Now
                </Link>
                <Link to="/pricing" className="inline-block bg-transparent border border-[#222] text-white px-12 py-5 rounded-full font-display uppercase tracking-widest font-black text-lg hover:border-[#B6FF00] transition-all">
                  Plans & Pricing
                </Link>
             </div>
          </div>
          
          <div className="mt-12 text-center text-gray-500 text-xs uppercase tracking-[0.3em] font-bold">
             Search <span className="text-[#B6FF00]">Gati Music Distribution</span> on Google
          </div>
        </motion.div>
      </main>

      {/* Back to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-[#B6FF00] text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(182,255,0,0.4)] hover:bg-white transition-colors group"
          >
            <ArrowUp className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
