import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function BlogPage({ lang, setView }) {
  const isFr = lang === 'fr'
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    const q = searchQuery.toLowerCase()
    return posts.filter(p => {
      const title = (isFr ? p.title_fr : p.title_en).toLowerCase()
      const excerpt = (isFr ? p.excerpt_fr : p.excerpt_en).toLowerCase()
      const author = (isFr ? p.author_fr : p.author_en).toLowerCase()
      return title.includes(q) || excerpt.includes(q) || author.includes(q)
    })
  }, [searchQuery, isFr, posts])

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0]
  const otherPosts = filteredPosts.filter(p => p.id !== featuredPost?.id)

  const s = {
    page: { minHeight: '100vh', background: '#FDFBF7', fontFamily: 'DM Sans, sans-serif' },
    container: { maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' },
    header: { marginBottom: 48 },
    tag: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#52B5D9', background: '#D4E8F4', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, display: 'inline-block', padding: '4px 14px', marginBottom: 12 },
    h1: { fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px,4vw,48px)', color: '#1A1710', letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.1 },
    searchContainer: { marginBottom: 40 },
    searchInput: { width: '100%', padding: '12px 16px', fontSize: 15, border: '1px solid rgba(0,0,0,.1)', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' },
    mainContent: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginBottom: 48 },
    featuredCard: { background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,.06)' },
    featuredImage: { height: 300, background: featuredPost?.imageColor || '#52B5D9' },
    featuredBody: { padding: 28 },
    featuredTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1A1710', marginBottom: 12, lineHeight: 1.2 },
    featuredMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#8A8070', marginBottom: 16 },
    featuredExcerpt: { fontSize: 15, color: '#8A8070', lineHeight: 1.6, marginBottom: 16 },
    readMore: { display: 'inline-block', color: '#52B5D9', fontWeight: 600, textDecoration: 'none', fontSize: 14 },
    sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
    sidebarTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#1A1710', marginBottom: 8 },
    recentPost: { background: '#fff', padding: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,.06)', cursor: 'pointer', transition: 'all 0.2s ease' },
    recentPostTitle: { fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 8, lineHeight: 1.4 },
    recentPostMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8070' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, marginBottom: 48 },
    postCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,.06)', transition: 'all 0.2s ease', cursor: 'pointer' },
    postImage: { height: 180, background: '#52B5D9' },
    postBody: { padding: 20 },
    postTitle: { fontSize: 16, fontWeight: 600, color: '#1A1710', marginBottom: 8, lineHeight: 1.4 },
    postExcerpt: { fontSize: 13, color: '#8A8070', lineHeight: 1.6, marginBottom: 12 },
    postMeta: { fontSize: 12, color: '#8A8070' },
    noResults: { textAlign: 'center', padding: '48px 24px', fontSize: 14, color: '#8A8070' },
  }

  return (
    <div style={s.page}>
      <style>{`
        @media(max-width:768px) {
          .blog-container { padding: 32px 16px 60px !important; }
          .blog-main { grid-template-columns: 1fr !important; gap: 24px !important; }
          .blog-featured-image { height: 200px !important; }
          .blog-grid { grid-template-columns: 1fr !important; }
          .blog-sidebar { order: -1; }
        }
      `}</style>

      <div className="blog-container" style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.tag}>{isFr ? 'Blog' : 'Blog'}</div>
          <h1 style={s.h1}>{isFr ? 'Actualités et conseils' : 'News & Tips'}</h1>
          <p style={{ fontSize: 14, color: '#8A8070', margin: 0, marginTop: 8 }}>
            {isFr ? 'Les dernières histoires et conseils de la communauté Yobbu' : 'Latest stories and tips from the Yobbu community'}
          </p>
        </div>

        {/* Search */}
        <div style={s.searchContainer}>
          <input
            type="text"
            placeholder={isFr ? 'Rechercher des articles...' : 'Search articles...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={s.searchInput}
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#8A8070' }}>
            {isFr ? 'Chargement...' : 'Loading...'}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={s.noResults}>
            {isFr ? 'Aucun article publié pour le moment.' : 'No posts published yet.'}
          </div>
        ) : null}

        {/* Featured + Recent */}
        {filteredPosts.length > 0 ? (
          <div className="blog-main" style={s.mainContent}>
            {/* Featured Post */}
            {featuredPost && (
              <div style={s.featuredCard}>
                <div className="blog-featured-image" style={{ ...s.featuredImage, background: featuredPost.image_color || '#52B5D9' }} />
                <div style={s.featuredBody}>
                  <h2 style={s.featuredTitle}>{isFr ? featuredPost.title_fr : featuredPost.title_en}</h2>
                  <div style={s.featuredMeta}>
                    <span>{isFr ? featuredPost.author_fr : featuredPost.author_en}</span>
                    <span>{new Date(featuredPost.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p style={s.featuredExcerpt}>{isFr ? featuredPost.excerpt_fr : featuredPost.excerpt_en}</p>
                  <a href="#" style={s.readMore}>{isFr ? 'Lire la suite →' : 'Read more →'}</a>
                </div>
              </div>
            )}

            {/* Sidebar - Recent Posts */}
            <div className="blog-sidebar" style={s.sidebar}>
              <h3 style={s.sidebarTitle}>{isFr ? 'Récent' : 'Recent'}</h3>
              {otherPosts.slice(0, 5).map(post => (
                <div
                  key={post.id}
                  style={s.recentPost}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,.06)'}
                >
                  <div style={s.recentPostTitle}>{isFr ? post.title_fr : post.title_en}</div>
                  <div style={s.recentPostMeta}>
                    <span>{isFr ? post.author_fr : post.author_en}</span>
                    <span>{new Date(post.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Grid of Other Posts */}
        {otherPosts.length > 0 ? (
          <div className="blog-grid" style={s.grid}>
            {otherPosts.map(post => (
              <div
                key={post.id}
                style={s.postCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ ...s.postImage, background: post.image_color || '#52B5D9' }} />
                <div style={s.postBody}>
                  <h3 style={s.postTitle}>{isFr ? post.title_fr : post.title_en}</h3>
                  <p style={s.postExcerpt}>{isFr ? post.excerpt_fr : post.excerpt_en}</p>
                  <div style={s.postMeta}>
                    {isFr ? post.author_fr : post.author_en} • {new Date(post.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div style={s.noResults}>
            {isFr ? 'Aucun article trouvé. Essayez une autre recherche.' : 'No posts found. Try a different search.'}
          </div>
        )}
      </div>
    </div>
  )
}
