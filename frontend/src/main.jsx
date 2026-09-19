import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FiHome, FiCompass, FiBell, FiMessageCircle, FiUser, FiSettings, FiSun, FiMoon,
  FiSearch, FiHeart, FiBookmark, FiMoreHorizontal, FiPlus, FiSend, FiLogOut,
  FiShield, FiX, FiEdit3, FiCamera, FiCopy, FiFlag, FiTrash2, FiArrowLeft,
  FiImage, FiEye, FiCheck, FiShare2, FiUsers, FiClock, FiChevronLeft,
  FiCornerUpLeft, FiExternalLink, FiSmile
} from 'react-icons/fi';
import './styles.css';

const VARUN_AVATAR = '/assets/profile-varun.png';
const RAVEN_LOGO = '/assets/raven-logo.svg';
const STORAGE = 'raven-social-v2';
const POST_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000';
const STORY_TTL = 24 * 60 * 60 * 1000;
const EMOJIS = ['😀','😂','😍','🥰','😎','🔥','❤️','👍','👏','🎉','🚀','💯','😊','🤩','😢','😮','🙏','💪','✨','🤣','😘','🥳','❤️‍🔥','🙌'];

function EmojiPicker({onPick}) {
  return <div className="emoji-picker">{EMOJIS.map(e => <button type="button" key={e} onClick={() => onPick(e)}>{e}</button>)}</div>;
}

const makeAvatar = (name) => {
  const initials = name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#e9eaee"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="64" font-weight="700" fill="#444">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const defaultUsers = [
  { id: 1, username: 'varun', name: 'Varun Prasath', bio: 'Frontend Developer • AI & Data Science', avatar: VARUN_AVATAR },
  { id: 2, username: 'arun_dev', name: 'Arun Kumar', bio: 'Code • Coffee • Travel', avatar: makeAvatar('Arun Kumar') },
  { id: 3, username: 'kaviya_21', name: 'Kaviya', bio: 'Dream • Create • Repeat', avatar: makeAvatar('Kaviya') },
  { id: 4, username: 'sanjay_fx', name: 'Sanjay', bio: 'Photography & reels', avatar: makeAvatar('Sanjay') }
];

const defaultPosts = [
  { id: 1, user: 'varun', text: 'New chapter. Building something meaningful with Raven. 🚀', img: POST_IMAGE, likes: 12, likedBy: [], savedBy: [], comments: [] },
  { id: 2, user: 'arun_dev', text: 'Weekend coding session ☕💻', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000', likes: 24, likedBy: [], savedBy: [], comments: [] },
  { id: 3, user: 'sanjay_fx', text: 'Views that make you stop and look.', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000', likes: 31, likedBy: [], savedBy: [], comments: [] }
];

const defaultNotifications = [
  { id: 1, type: 'welcome', title: 'Welcome', text: 'Your Raven account is ready.', time: '1d', read: false }
];

const cleanStories = (stories) => (Array.isArray(stories) ? stories : []).filter(s => s && s.expiresAt > Date.now());

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || 'null'); } catch { return null; }
}

function App({ sessionUser = 'varun', onLogout, adminMode = false }) {
  const saved = useMemo(loadState, []);
  const [page, setPage] = useState(adminMode ? 'admin' : 'home');
  const [dark, setDark] = useState(saved?.dark || false);
  const [users, setUsers] = useState(saved?.users?.length ? saved.users : defaultUsers);
  const [posts, setPosts] = useState(saved?.posts?.length ? saved.posts : defaultPosts);
  const [me, setMe] = useState(sessionUser || saved?.me || 'varun');
  const [viewUser, setViewUser] = useState(saved?.viewUser || 'varun');
  const [follows, setFollows] = useState(saved?.follows || { varun: [] });
  const [notifications, setNotifications] = useState(saved?.notifications || defaultNotifications);
  const [messages, setMessages] = useState(saved?.messages || {});
  const [stories, setStories] = useState(() => cleanStories(saved?.stories || []));
  const [highlights, setHighlights] = useState(saved?.highlights || {});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [postView, setPostView] = useState(null);
  const [storyView, setStoryView] = useState(null);
  const [storyCreateOpen, setStoryCreateOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);

  useEffect(() => { document.body.className = dark ? 'dark' : ''; }, [dark]);
  useEffect(() => {
    const timer = setInterval(() => setStories(prev => cleanStories(prev)), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ page, dark, users, posts, me, viewUser, follows, notifications, messages, stories, highlights }));
  }, [page, dark, users, posts, me, viewUser, follows, notifications, messages, stories, highlights]);

  const current = users.find(u => u.username === me) || users[0];
  const followerCount = username => Object.values(follows).filter(list => list.includes(username)).length;
  const followingCount = username => (follows[username] || []).length;
  const isFollowing = username => (follows[me] || []).includes(username);
  const myNotifications = notifications.filter(n => !n.target || n.target === me);
  const unread = myNotifications.filter(n => !n.read).length;
  const myFollowers = users.filter(u => u.username !== me && (follows[u.username] || []).includes(me));
  const visibleStories = stories.filter(s => {
    if (s.user === me) return true;
    if (s.audience === 'public') return isFollowing(s.user);
    return Array.isArray(s.closeFriends) && s.closeFriends.includes(me);
  });
  const activeStoryGroup = storyView && !storyView.permanent
    ? visibleStories.filter(s => s.user === storyView.user).sort((a, b) => a.createdAt - b.createdAt)
    : [];
  const storyToShow = storyView
    ? (storyView.permanent ? storyView.story : (activeStoryGroup[storyView.index] || activeStoryGroup[activeStoryGroup.length - 1]))
    : null;

  const flash = message => {
    setToast(message);
    clearTimeout(window.__ravenToast);
    window.__ravenToast = setTimeout(() => setToast(''), 1800);
  };
  const notify = (type, title, text, target = me) => setNotifications(ns => [{ id: Date.now() + Math.random(), type, title, text, target, time: 'now', read: false }, ...ns]);
  const markNotificationsRead = () => setNotifications(ns => ns.map(n => (!n.target || n.target === me) ? { ...n, read: true } : n));

  const openProfile = username => {
    if (!users.some(u => u.username === username)) return;
    setViewUser(username); setPage('profile'); setSearch(''); setPostView(null);
  };

  const toggleFollow = username => {
    if (username === me || !users.some(u => u.username === username)) return;
    const wasFollowing = (follows[me] || []).includes(username);
    setFollows(prev => {
      const mine = new Set(prev[me] || []);
      wasFollowing ? mine.delete(username) : mine.add(username);
      return { ...prev, [me]: [...mine] };
    });
    if (!wasFollowing) {
      const target = users.find(u => u.username === username);
      if (target) notify('follow', 'New follower', `${current.name} started following you.`, username);
      flash(`Following @${username}`);
    } else flash(`Unfollowed @${username}`);
  };

  const like = id => setPosts(ps => ps.map(p => {
    if (p.id !== id) return p;
    const already = (p.likedBy || []).includes(me);
    if (already) return p;
    if (p.user !== me) notify('like', 'Post liked', `${current.name} liked your post.`, p.user);
    return { ...p, likedBy: [...(p.likedBy || []), me], likes: (p.likes || 0) + 1 };
  }));
  const unlike = id => setPosts(ps => ps.map(p => p.id === id ? { ...p, likedBy: (p.likedBy || []).filter(x => x !== me), likes: Math.max(0, (p.likes || 0) - 1) } : p));
  const save = id => {
    let savedNow = false;
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const has = (p.savedBy || []).includes(me); savedNow = !has;
      return { ...p, savedBy: has ? p.savedBy.filter(x => x !== me) : [...(p.savedBy || []), me] };
    }));
    flash(savedNow ? 'Post saved' : 'Removed from saved');
  };
  const deletePost = id => { setPosts(ps => ps.filter(p => p.id !== id)); setPostView(null); flash('Post deleted'); };

  const addComment = (id, text, parentId = null) => {
    const value = text.trim(); if (!value) return;
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const comments = Array.isArray(p.comments) ? p.comments : [];
      if (parentId) {
        return { ...p, comments: comments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), { id: Date.now() + Math.random(), user: me, text: value }] } : c) };
      }
      return { ...p, comments: [...comments, { id: Date.now() + Math.random(), user: me, text: value, replies: [] }] };
    }));
    const post = posts.find(p => p.id === id);
    const targetUser = parentId ? (post?.comments || []).find(c => c.id === parentId)?.user : post?.user;
    if (targetUser && targetUser !== me) notify(parentId ? 'comment' : 'comment', parentId ? 'New reply' : 'New comment', `${current.name} ${parentId ? 'replied to your comment.' : 'commented on your post.'}`, targetUser);
    flash(parentId ? 'Reply added' : 'Comment added');
  };

  const createPost = ({ text, imageFile }) => {
    if (!text.trim() && !imageFile) return flash('Write something or choose an image');
    const finish = img => {
      setPosts(ps => [{ id: Date.now(), user: me, text: text.trim(), img: img || '', likes: 0, likedBy: [], savedBy: [], comments: [] }, ...ps]);
      setCreatePostOpen(false); flash('Post published');
    };
    if (imageFile) { const r = new FileReader(); r.onload = () => finish(r.result); r.readAsDataURL(imageFile); } else finish('');
  };

  const updateProfile = (patch, avatarFile) => {
    const apply = avatar => setUsers(us => us.map(u => u.username === me ? { ...u, ...patch, ...(avatar ? { avatar } : {}) } : u));
    if (avatarFile) { const r = new FileReader(); r.onload = () => apply(r.result); r.readAsDataURL(avatarFile); } else apply();
    setEditOpen(false); flash('Profile updated');
  };

  const createAccount = ({ username, name, bio, avatarFile }) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.]/g, '');
    if (!clean || !name.trim()) return flash('Username and name are required');
    if (users.some(u => u.username === clean)) return flash('Username already exists');
    if (!avatarFile) return flash('Please choose a profile image');
    const r = new FileReader();
    r.onload = () => {
      const user = { id: Date.now(), username: clean, name: name.trim(), bio: bio.trim() || 'New Raven member', avatar: r.result };
      setUsers(us => [...us, user]); setFollows(f => ({ ...f, [clean]: [] })); setMe(clean); setViewUser(clean); setPage('profile'); setCreateOpen(false); flash(`@${clean} account created`);
    };
    r.readAsDataURL(avatarFile);
  };

  const switchAccount = username => { setMe(username); setViewUser(username); setPage('home'); flash(`Switched to @${username}`); };
  const sendMessage = (username, text) => {
    if (!text.trim()) return;
    setMessages(m => ({ ...m, [username]: [...(m[username] || []), { id: Date.now(), from: me, text: text.trim() }] }));
  };

  const createStory = ({ text, imageFile, audience, closeFriends }) => {
    if (!text.trim() && !imageFile) return flash('Add a photo or story text');
    const finish = media => {
      const story = { id: Date.now(), user: me, text: text.trim(), img: media || '', audience, closeFriends: audience === 'close' ? closeFriends : [], createdAt: Date.now(), expiresAt: Date.now() + STORY_TTL, likedBy: [], views: [] };
      setStories(s => [story, ...s]);
      setStoryCreateOpen(false); flash(audience === 'close' ? 'Close friends story added' : 'Story added • expires in 24h');
    };
    if (imageFile) { const r = new FileReader(); r.onload = () => finish(r.result); r.readAsDataURL(imageFile); } else finish('');
  };

  const openStory = story => {
    if (!story) return;
    if (story.permanent) {
      setStoryView({ permanent: true, story });
      return;
    }
    const group = visibleStories.filter(s => s.user === story.user).sort((a, b) => a.createdAt - b.createdAt);
    const index = Math.max(0, group.findIndex(s => s.id === story.id));
    if (story.user !== me && !(story.views || []).includes(me)) {
      setStories(ss => ss.map(s => s.id === story.id ? { ...s, views: [...(s.views || []), me] } : s));
      notify('story', 'Story viewed', `${current.name} viewed your story.`, story.user);
    }
    setStoryView({ user: story.user, index });
  };

  const addStoryComment = (storyId, text) => {
    const value = text.trim(); if (!value) return;
    let targetUser = null;
    setStories(ss => ss.map(story => {
      if (story.id !== storyId) return story;
      targetUser = story.user;
      return { ...story, comments: [...(story.comments || []), { id: Date.now() + Math.random(), user: me, text: value, createdAt: Date.now() }] };
    }));
    if (targetUser && targetUser !== me) {
      notify('story_comment', 'Story comment', `${current.name} commented on your story.`, targetUser);
    }
    flash('Story comment added 💬');
  };

  const likeStory = id => setStories(ss => ss.map(s => {
    if (s.id !== id || (s.likedBy || []).includes(me)) return s;
    if (s.user !== me) notify('story_like', 'Story liked', `${current.name} liked your story.`, s.user);
    return { ...s, likedBy: [...(s.likedBy || []), me] };
  }));

  const navigateStory = nextIndex => {
    const next = activeStoryGroup[nextIndex];
    if (!next) return;
    if (next.user !== me && !(next.views || []).includes(me)) {
      setStories(ss => ss.map(s => s.id === next.id ? { ...s, views: [...(s.views || []), me] } : s));
      notify('story', 'Story viewed', `${current.name} viewed your story.`, next.user);
    }
    setStoryView(v => v ? { ...v, index: nextIndex } : v);
  };

  const addHighlight = story => {
    if (!story || story.user !== me) return flash('Only the story owner can add highlights');
    setHighlights(h => ({ ...h, [me]: [...(h[me] || []).filter(x => x.storyId !== story.id), { storyId: story.id, user: me, text: story.text, img: story.img, createdAt: story.createdAt, expiresAt: Number.MAX_SAFE_INTEGER, permanent: true }] }));
    flash('Added to highlights');
  };
  const deleteHighlight = storyId => { setHighlights(h => ({ ...h, [me]: (h[me] || []).filter(x => x.storyId !== storyId) })); flash('Highlight deleted'); };

  const nav = [
    ['home', 'Home', FiHome], ['explore', 'Explore', FiCompass], ['notifications', 'Notifications', FiBell],
    ['messages', 'Messages', FiMessageCircle], ['profile', 'Profile', FiUser], ['settings', 'Settings', FiSettings], ['admin', 'Admin', FiShield]
  ];
  const searchResults = search.trim() ? users.filter(u => { const q = search.toLowerCase().replace(/^@/, ''); return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q); }).slice(0, 6) : [];

  const openPage = key => {
    if (key === 'profile') setViewUser(me);
    if (key === 'notifications') markNotificationsRead();
    setPostView(null); setCommentPost(null); setPage(key);
  };

  return <div className="app">
    <header>
      <div className="brand" onClick={() => setPage('home')}><img src={RAVEN_LOGO} alt="Raven"/><span>RAVEN</span></div>
      <div className="search-wrap">
        <div className="search"><FiSearch/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, IDs..." /></div>
        {searchResults.length > 0 && <div className="search-results">{searchResults.map(u => <button key={u.id} onClick={() => openProfile(u.username)}><img src={u.avatar}/><span><b>{u.name}</b><small>@{u.username}</small></span></button>)}</div>}
      </div>
      <div className="head-actions"><button onClick={() => setDark(!dark)}>{dark ? <FiSun/> : <FiMoon/>}</button><button onClick={() => openProfile(me)}><img src={current.avatar}/></button></div>
    </header>

    <div className="layout">
      <aside>{nav.map(([key, label, Icon]) => <button className={page === key ? 'active' : ''} onClick={() => openPage(key)} key={key}><span className="nav-icon-wrap"><Icon/>{key === 'notifications' && unread > 0 && <i className="badge">{unread}</i>}</span><span>{label}</span></button>)}<button onClick={() => setCreateOpen(true)}><FiPlus/><span>Create account</span></button></aside>
      <main>
        <div className="mobile-search search"><FiSearch/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."/></div>
        {page === 'home' && <Home current={current} users={users} stories={visibleStories} posts={posts} openCreatePost={() => setCreatePostOpen(true)} openStory={openStory} openStoryCreate={() => setStoryCreateOpen(true)} postProps={{ current, users, like, unlike, save, deletePost, toggleFollow, isFollowing, openProfile, setCommentPost, setPostView, setSharePost }}/>} 
        {page === 'explore' && <Explore current={current} users={users} posts={posts} followerCount={followerCount} followingCount={followingCount} isFollowing={isFollowing} toggleFollow={toggleFollow} openProfile={openProfile} search={search} setCommentPost={setCommentPost} setPostView={setPostView} setSharePost={setSharePost} like={like} unlike={unlike} save={save}/>} 
        {page === 'profile' && <Profile user={users.find(u => u.username === viewUser) || current} current={current} posts={posts} followerCount={followerCount} followingCount={followingCount} isFollowing={isFollowing} toggleFollow={toggleFollow} openEdit={() => setEditOpen(true)} save={save} setPostView={setPostView} highlights={highlights} stories={visibleStories} openStory={openStory} deleteHighlight={deleteHighlight}/>} 
        {page === 'notifications' && <Notifications notifications={myNotifications} markAllRead={markNotificationsRead}/>} 
        {page === 'messages' && <Messages users={users} me={me} messages={messages} sendMessage={sendMessage}/>} 
        {page === 'settings' && <Settings dark={dark} setDark={setDark} users={users} me={me} switchAccount={switchAccount} onCreate={() => setCreateOpen(true)} onLogout={onLogout}/>} 
        {page === 'admin' && <Admin users={users} posts={posts} followerCount={followerCount} followingCount={followingCount} adminMode={adminMode}/>} 
      </main>
      <section className="rightbar">
        <div className="card"><div className="card-title">Your profile</div><div className="mini-profile"><img src={current.avatar}/><div><b>{current.name}</b><small>@{current.username}</small></div></div><div className="stats"><span><b>{posts.filter(p => p.user === current.username).length}</b>Posts</span><span><b>{followerCount(current.username)}</b>Followers</span><span><b>{followingCount(current.username)}</b>Following</span></div></div>
        <div className="card"><div className="card-title">Suggested for you</div>{users.filter(u => u.username !== me).slice(0, 6).map(u => <div className="suggest" key={u.id}><img src={u.avatar}/><div><b>{u.name}</b><small>@{u.username}</small></div><button onClick={() => toggleFollow(u.username)}>{isFollowing(u.username) ? 'Following' : 'Follow'}</button></div>)}</div>
      </section>
    </div>

    {editOpen && <EditProfile user={current} onClose={() => setEditOpen(false)} onSave={updateProfile}/>} 
    {createOpen && <CreateAccount onClose={() => setCreateOpen(false)} onCreate={createAccount}/>} 
    {createPostOpen && <CreatePost onClose={() => setCreatePostOpen(false)} onCreate={createPost}/>} 
    {commentPost && <CommentsModal post={posts.find(p => p.id === commentPost)} users={users} me={me} onClose={() => setCommentPost(null)} onComment={addComment}/>} 
    {postView && <PostViewer post={posts.find(p => p.id === postView)} users={users} current={current} like={like} unlike={unlike} save={save} deletePost={deletePost} openProfile={openProfile} openComments={id => { setPostView(null); setCommentPost(id); }} onShare={setSharePost} onClose={() => setPostView(null)}/>} 
    {storyCreateOpen && <CreateStory users={users} followers={myFollowers} onClose={() => setStoryCreateOpen(false)} onCreate={createStory}/>} 
    {storyToShow && <StoryViewer story={storyToShow} stories={storyView?.permanent ? [storyToShow] : activeStoryGroup} index={storyView?.permanent ? 0 : storyView?.index || 0} current={current} users={users} onClose={() => setStoryView(null)} onNavigate={nextIndex => { if (storyView?.permanent) return; navigateStory(nextIndex); }} onLike={likeStory} onStoryComment={addStoryComment} onHighlight={addHighlight} onDelete={s => { if (s.user === me) { setStories(ss => ss.filter(x => x.id !== s.id)); setStoryView(null); flash('Story deleted'); } }}/>} 
    {sharePost && <ShareModal post={posts.find(p => p.id === sharePost)} users={users} current={current} onSendRaven={(username, postId) => { sendMessage(username, `Shared post #${postId} from Raven: ${window.location.href}`); setSharePost(null); flash(`Shared successfully to @${username}`); }} onClose={() => setSharePost(null)} onSuccess={platform => { setSharePost(null); flash(`Shared successfully to ${platform}`); }}/>} 
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Stories({ users, me, stories, onOpen, onAdd }) {
  const ownerStories = stories.filter(s => s.user === me).sort((a, b) => b.createdAt - a.createdAt);
  const people = users.filter(u => u.username !== me && stories.some(s => s.user === u.username));
  const ownerAvatar = users.find(u => u.username === me)?.avatar;
  return <div className="stories card">
    <div className="story story-add">
      <button className="story-main" onClick={() => ownerStories.length ? onOpen(ownerStories[0]) : onAdd()}>
        <div className="story-ring mine"><img src={ownerAvatar}/></div>
        <span>{ownerStories.length ? 'Your story' : 'Add story'}</span>
      </button>
      <button className="story-plus" onClick={onAdd} title="Add another story"><FiPlus/></button>
      {ownerStories.length > 1 && <small className="story-count">{ownerStories.length}</small>}
    </div>
    {people.map(u => {
      const group = stories.filter(s => s.user === u.username).sort((a, b) => b.createdAt - a.createdAt);
      return <button className="story" key={u.id} onClick={() => onOpen(group[0])}>
        <div className="story-ring"><img src={u.avatar}/></div><span>{u.username}</span>{group.length > 1 && <small className="story-count">{group.length}</small>}
      </button>;
    })}
  </div>;
}

function Home({ current, users, stories, posts, openCreatePost, openStory, openStoryCreate, postProps }) {
  return <><div className="welcome"><div><span className="eyebrow">WELCOME BACK</span><h1>Share your world.</h1><p>Connect, create and discover on Raven.</p></div><button className="primary" onClick={openCreatePost}><FiPlus/> Create</button></div><Stories users={users} me={current.username} stories={stories} onOpen={openStory} onAdd={openStoryCreate}/>{posts.map(p => <Post key={p.id} p={p} {...postProps}/>)}</>;
}

function Post({p,current,users,like,unlike,save,deletePost,toggleFollow,isFollowing,openProfile,setCommentPost,setPostView,setSharePost}) {
  const [menu, setMenu] = useState(false);
  const liked = (p.likedBy || []).includes(current.username);
  const saved = (p.savedBy || []).includes(current.username);
  const owner = p.user === current.username;
  const comments = Array.isArray(p.comments) ? p.comments : [];
  const authorUser = users?.find(u => u.username === p.user);
  const author = p.authorName || p.name || authorUser?.name || p.user;
  const authorAvatar = p.avatar || authorUser?.avatar || makeAvatar(author);
  return <article className="post card">
    <div className="post-head"><button className="avatar-btn" onClick={() => openProfile(p.user)}><img src={authorAvatar}/></button><button className="post-user" onClick={() => openProfile(p.user)}><b>{author}</b><small>@{p.user} · 2h</small></button><div className="menu-wrap"><button className="icon" onClick={() => setMenu(!menu)}><FiMoreHorizontal/></button>{menu && <div className="post-menu"><button onClick={() => { navigator.clipboard?.writeText(window.location.href); setMenu(false); flashCopy(setPostView); }}><FiCopy/> Copy link</button><button onClick={() => { save(p.id); setMenu(false); }}><FiBookmark/> {saved ? 'Unsave' : 'Save'}</button><button onClick={() => { setMenu(false); setSharePost(p.id); }}><FiShare2/> Share</button>{owner ? <button onClick={() => { deletePost(p.id); setMenu(false); }}><FiTrash2/> Delete</button> : <button onClick={() => { setMenu(false); alert('Report submitted'); }}><FiFlag/> Report</button>}</div>}</div></div>
    <button className="post-open" onClick={() => setPostView(p.id)}>{p.text && <p>{p.text}</p>}{p.img && <img className="post-img" src={p.img} onError={e => e.currentTarget.style.display='none'}/>}</button>
    <div className="post-actions"><button onClick={() => liked ? unlike(p.id) : like(p.id)} className={liked ? 'liked' : ''}><FiHeart/> {p.likes || 0}</button><button onClick={() => setCommentPost(p.id)}><FiMessageCircle/> {comments.length}</button><button onClick={() => save(p.id)} className={saved ? 'saved' : ''}><FiBookmark/></button><button onClick={() => setSharePost(p.id)}><FiShare2/></button></div>
    {comments.length > 0 && <button className="comment-preview" onClick={() => setCommentPost(p.id)}>View all {comments.length} comments</button>}
    <div className="post-foot">{!owner && <button className="follow-link" onClick={() => toggleFollow(p.user)}>{isFollowing(p.user) ? 'Following' : `Follow @${p.user}`}</button>}</div>
  </article>;
}

function flashCopy(setPostView) { navigator.clipboard?.writeText(window.location.href); }

function Explore({current,users,posts,followerCount,followingCount,isFollowing,toggleFollow,openProfile,search,setCommentPost,setPostView,setSharePost,like,unlike,save}) {
  const q = (search || '').toLowerCase().replace(/^@/, '');
  const found = users.filter(u => !q || u.username.includes(q) || u.name.toLowerCase().includes(q));
  return <><div className="page-title"><span className="eyebrow">DISCOVER</span><h1>Explore</h1><p>Search a name or @ID and open the profile.</p></div><div className="user-grid">{found.map(u => <div className="user-card card" key={u.id}><button className="plain-avatar" onClick={() => openProfile(u.username)}><img src={u.avatar}/></button><h3>{u.name}</h3><span>@{u.username}</span><p>{u.bio}</p><div className="user-stats"><span>{followerCount(u.username)} followers</span><span>{followingCount(u.username)} following</span></div><div><button className="ghost" onClick={() => openProfile(u.username)}>View profile</button>{u.username !== 'varun' && <button className="primary small" onClick={() => toggleFollow(u.username)}>{isFollowing(u.username) ? 'Following' : 'Follow'}</button>}</div></div>)}</div><h2 className="section-heading">Trending posts</h2><div>{posts.map(p => <Post key={p.id} p={p} current={current} users={users} openProfile={openProfile} setCommentPost={setCommentPost} setPostView={setPostView} setSharePost={setSharePost} like={like} unlike={unlike} save={save} deletePost={() => {}} toggleFollow={toggleFollow} isFollowing={isFollowing}/>)}</div></>;
}
function Profile({user,current,posts,followerCount,followingCount,isFollowing,toggleFollow,openEdit,save,setPostView,highlights,stories,openStory,deleteHighlight}) {
  const own = posts.filter(p => p.user === user.username);
  const [tab,setTab] = useState('posts');
  const grid = tab === 'posts' ? own : tab === 'saved' ? posts.filter(p => (p.savedBy || []).includes(current.username)) : [];
  const profileHighlights = highlights[user.username] || [];
  const userStories = stories.filter(s => s.user === user.username);
  const mine = user.username === current.username;
  return <div>
    <div className="profile-hero card"><img className="profile-avatar" src={user.avatar}/><div className="profile-info"><div className="profile-row"><div><h1>{user.name}</h1><span>@{user.username}</span></div>{mine ? <button className="ghost" onClick={openEdit}><FiEdit3/> Edit profile</button> : <button className="primary" onClick={() => toggleFollow(user.username)}>{isFollowing(user.username) ? 'Following' : 'Follow'}</button>}</div><p>{user.bio}</p><div className="profile-stats"><b>{own.length}<small>Posts</small></b><b>{followerCount(user.username)}<small>Followers</small></b><b>{followingCount(user.username)}<small>Following</small></b></div></div></div>
    {profileHighlights.length > 0 && <div className="highlights card"><div className="section-mini-title">Highlights</div><div className="highlight-row">{profileHighlights.map(h => <div className="highlight-item" key={h.storyId}><button onClick={() => openStory(stories.find(s => s.id === h.storyId) || h)}>{h.img ? <img src={h.img}/> : <div className="highlight-text">{h.text || 'Story'}</div>}</button><div><b>Highlight</b>{mine && <button className="delete-mini" onClick={() => deleteHighlight(h.storyId)}><FiTrash2/></button>}</div></div>)}</div></div>}
    <div className="tabs"><button className={tab==='posts'?'active':''} onClick={() => setTab('posts')}>Posts</button><button className={tab==='saved'?'active':''} onClick={() => setTab('saved')}>Saved</button><button className={tab==='tagged'?'active':''} onClick={() => setTab('tagged')}>Tagged</button></div>
    <div className="profile-grid">{grid.map(p => <button className="grid-post" key={p.id} onClick={() => setPostView(p.id)}>{p.img ? <img src={p.img}/> : <div className="grid-text">{p.text}</div>}</button>)}{grid.length===0 && <div className="empty-state">{tab === 'saved' ? 'No saved posts yet.' : 'No posts yet.'}</div>}</div>
  </div>;
}

function Notifications({notifications,markAllRead}) {
  const iconFor = n => n.type === 'like' || n.type === 'story_like' ? <FiHeart/> : n.type === 'comment' || n.type === 'story_comment' ? <FiMessageCircle/> : n.type === 'follow' ? <FiUser/> : n.type === 'story' ? <FiEye/> : <FiBell/>;
  return <><div className="page-title notification-title"><div><span className="eyebrow">ACTIVITY</span><h1>Notifications</h1></div><button className="ghost" onClick={markAllRead}><FiCheck/> Mark all read</button></div><div className="card notification-list">{notifications.length ? notifications.map(n => <div className={'notification '+(!n.read?'unread':'')} key={n.id}><div className="notif-icon">{iconFor(n)}</div><div><b>{n.title}</b><p>{n.text}</p><small>{n.time}</small></div></div>) : <div className="empty-state">No notifications.</div>}</div></>;
}

function Messages({users,me,messages,sendMessage}) {
  const contacts = users.filter(u => u.username !== me);
  const [active,setActive] = useState(null);
  const [text,setText] = useState('');
  const [emojiOpen,setEmojiOpen] = useState(false);
  const person = contacts.find(u => u.username === active);
  const send = () => { if (!person || !text.trim()) return; sendMessage(person.username,text); setText(''); setEmojiOpen(false); };
  const addEmoji = e => setText(t => t + e);
  return <div className="messages card"><div className={'conversation-list '+(person?'has-active':'')}><h2>Messages</h2>{contacts.map(u => <button className={active===u.username?'selected':''} onClick={() => setActive(u.username)} key={u.id}><img src={u.avatar}/><span><b>{u.name}</b><small>{messages[u.username]?.length ? `${messages[u.username].length} messages` : 'Tap to chat'}</small></span></button>)}</div><div className={'chat '+(!person?'chat-empty':'')}>{person ? <><div className="chat-head"><button className="mobile-back" onClick={() => setActive(null)}><FiArrowLeft/></button><img src={person.avatar}/><div><b>{person.name}</b><small>@{person.username}</small></div></div><div className="chat-body"><div className="bubble">Hey! Welcome to Raven 👋</div>{(messages[person.username]||[]).map(m => <div className={'bubble '+(m.from===me?'mine':'')} key={m.id}>{m.text}</div>)}</div><div className="message-composer-wrap"><div className="composer"><button className="emoji-trigger" type="button" onClick={()=>setEmojiOpen(v=>!v)}><FiSmile/></button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Write a message..."/><button onClick={send}><FiSend/></button></div>{emojiOpen&&<EmojiPicker onPick={addEmoji}/>}</div></> : <div className="message-placeholder"><FiMessageCircle/><h3>Your messages</h3><p>Select a person to open the chat.</p></div>}</div></div>;
}
function Settings({dark,setDark,users,me,switchAccount,onCreate,onLogout}) { return <><div className="page-title"><span className="eyebrow">PREFERENCES</span><h1>Settings</h1></div><div className="settings card"><div className="setting"><div><b>Theme</b><small>Switch between dark and light mode</small></div><button className={'switch '+(dark?'on':'')} onClick={()=>setDark(!dark)}><span/></button></div><div className="setting"><div><b>Account</b><small>Switch between your Raven accounts</small></div><button className="ghost" onClick={onCreate}>Create account</button></div><div className="account-list">{users.map(u=><button key={u.id} className={u.username===me?'current-account':''} onClick={()=>switchAccount(u.username)}><img src={u.avatar}/><span><b>{u.name}</b><small>@{u.username}</small></span>{u.username===me&&<em>Current</em>}</button>)}</div><div className="setting"><div><b>Private account</b><small>Demo toggle</small></div><button className="switch"><span/></button></div><div className="setting"><div><b>Two-factor authentication</b><small>Demo toggle</small></div><button className="switch"><span/></button></div><button className="danger" onClick={onLogout}><FiLogOut/> Log out</button></div></>; }

function Admin({users,posts,followerCount,followingCount,adminMode}) { return <><div className="page-title"><span className="eyebrow">CONTROL CENTER</span><h1>Admin</h1><p>Manage the Raven community.</p>{adminMode && <span className="admin-session"><FiShield/> Admin session active</span>}</div><div className="admin-stats"><div className="card"><b>{users.length}</b><span>Total users</span></div><div className="card"><b>{posts.length}</b><span>Total posts</span></div><div className="card"><b>{users.reduce((n,u)=>n+followerCount(u.username),0)}</b><span>Total follows</span></div><div className="card"><b>0</b><span>Reports</span></div></div><div className="card table"><h2>Users</h2>{users.map(u=><div className="table-row" key={u.id}><img src={u.avatar}/><span><b>{u.name}</b><small>@{u.username} · {followerCount(u.username)} followers · {followingCount(u.username)} following</small></span><em>Active</em><button className="ghost">Manage</button></div>)}</div></>; }

function EditProfile({user,onClose,onSave}) { const [name,setName]=useState(user.name); const [bio,setBio]=useState(user.bio); const [file,setFile]=useState(null); return <Modal title="Edit profile" onClose={onClose}><div className="edit-avatar"><img src={file?URL.createObjectURL(file):user.avatar}/><label><FiCamera/> Change photo<input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></label></div><label className="form-label">Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label className="form-label">Bio<textarea value={bio} onChange={e=>setBio(e.target.value)}/></label><div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onSave({name,bio},file)}>Save changes</button></div></Modal>; }

function CreateAccount({onClose,onCreate}) { const [username,setUsername]=useState(''); const [name,setName]=useState(''); const [bio,setBio]=useState(''); const [file,setFile]=useState(null); return <Modal title="Create new Raven account" onClose={onClose}><p className="modal-note">Profile image is required. Choose the image yourself — Raven will not assign a photo automatically.</p><div className="upload-box"><FiCamera/><b>{file?file.name:'Choose profile image'}</b><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><label className="form-label">Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label className="form-label">User ID<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="@username"/></label><label className="form-label">Bio<textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="About you"/></label><div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onCreate({username,name,bio,avatarFile:file})}>Create account</button></div></Modal>; }

function CreatePost({onClose,onCreate}) { const [text,setText]=useState(''); const [file,setFile]=useState(null); return <Modal title="Create post" onClose={onClose}><label className="form-label">Caption<textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="What's happening?"/></label><div className="upload-box"><FiImage/><b>{file?file.name:'Add image (optional)'}</b><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onCreate({text,imageFile:file})}><FiPlus/> Publish</button></div></Modal>; }

function CommentsModal({post,users,me,onClose,onComment}) {
  const [text,setText]=useState(''); const [replyTo,setReplyTo]=useState(null); const [emojiOpen,setEmojiOpen]=useState(false);
  if(!post) return null; const comments=Array.isArray(post.comments)?post.comments:[];
  const addEmoji=e=>setText(t=>t+e);
  const submit=()=>{if(text.trim()){onComment(post.id,text,replyTo);setText('');setReplyTo(null);setEmojiOpen(false)}};
  return <Modal title="Comments" onClose={onClose}><div className="comments-list">{comments.length?comments.map(c=>{const u=users.find(x=>x.username===c.user);return <div className="comment" key={c.id}><img src={u?.avatar||makeAvatar(c.user)}/><div className="comment-main"><b>{u?.name||c.user}</b><p>{c.text}</p><button className="reply-btn" onClick={()=>setReplyTo(c.id)}><FiCornerUpLeft/> Reply</button>{(c.replies||[]).map(r=>{const ru=users.find(x=>x.username===r.user);return <div className="reply" key={r.id}><img src={ru?.avatar||makeAvatar(r.user)}/><div><b>{ru?.name||r.user}</b><p>{r.text}</p></div></div>})}</div></div>}) : <div className="empty-state">No comments yet. Be the first to comment.</div>}</div><div className="reply-target">{replyTo ? <>Replying to comment <button onClick={()=>setReplyTo(null)}><FiX/></button></> : 'Add a comment'}</div><div className="comment-composer-wrap"><div className="composer comment-composer"><button className="emoji-trigger" type="button" onClick={()=>setEmojiOpen(v=>!v)}><FiSmile/></button><input autoFocus value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit()}}} placeholder={replyTo?'Write a reply...':'Write a comment...'}/><button onClick={submit}><FiSend/></button></div>{emojiOpen&&<EmojiPicker onPick={addEmoji}/>}</div></Modal>;
}
function PostViewer({post,users,current,like,unlike,save,deletePost,openProfile,openComments,onShare,onClose}) {
  if(!post) return null; const author=users.find(u=>u.username===post.user); const liked=(post.likedBy||[]).includes(current.username); const saved=(post.savedBy||[]).includes(current.username); const owner=post.user===current.username;
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="post-viewer card"><div className="post-viewer-head"><button className="post-user" onClick={()=>openProfile(post.user)}><img src={author?.avatar}/><span><b>{author?.name||post.user}</b><small>@{post.user}</small></span></button><button className="icon" onClick={onClose}><FiX/></button></div><div className="post-viewer-body">{post.text&&<p>{post.text}</p>}{post.img&&<img src={post.img}/>}</div><div className="post-actions viewer-actions"><button onClick={()=>liked?unlike(post.id):like(post.id)} className={liked?'liked':''}><FiHeart/> {post.likes||0}</button><button onClick={()=>openComments(post.id)}><FiMessageCircle/> {(post.comments||[]).length}</button><button onClick={()=>save(post.id)} className={saved?'saved':''}><FiBookmark/> {saved?'Saved':'Save'}</button><button onClick={()=>onShare(post.id)}><FiShare2/> Share</button>{owner&&<button className="danger-text" onClick={()=>deletePost(post.id)}><FiTrash2/> Delete</button>}</div></div></div>;
}

function CreateStory({users,followers,onClose,onCreate}) {
  const [text,setText]=useState(''); const [file,setFile]=useState(null); const [audience,setAudience]=useState('public'); const [selected,setSelected]=useState([]);
  const toggle=u=>setSelected(s=>s.includes(u.username)?s.filter(x=>x!==u.username):[...s,u.username]);
  return <Modal title="Add story" onClose={onClose}><p className="modal-note"><FiClock/> Stories disappear automatically after 24 hours. Only you can add your story to Highlights.</p><label className="form-label">Story text<textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write something..."/></label><div className="upload-box"><FiImage/><b>{file?file.name:'Choose story image (optional)'}</b><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><div className="audience-title">Who can see this story?</div><div className="audience-options"><button className={audience==='public'?'selected':''} onClick={()=>setAudience('public')}><FiUsers/><span><b>Public</b><small>People you follow</small></span></button><button className={audience==='close'?'selected':''} onClick={()=>setAudience('close')}><FiHeart/><span><b>Close friends</b><small>Only selected followers</small></span></button></div>{audience==='close'&&<div className="close-friends-list">{followers.length?followers.map(u=><label key={u.id}><input type="checkbox" checked={selected.includes(u.username)} onChange={()=>toggle(u)}/><img src={u.avatar}/><span>{u.name}<small>@{u.username}</small></span></label>):<div className="empty-state">No followers yet. Follow/create another account and follow you to add close friends.</div>}</div>}<div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onCreate({text,imageFile:file,audience,closeFriends:selected})}><FiPlus/> Add story</button></div></Modal>;
}

function StoryViewer({story,stories,index,current,users,onClose,onNavigate,onLike,onStoryComment,onHighlight,onDelete}) {
  const [autoKey, setAutoKey] = useState(0); const [comment,setComment]=useState(''); const [emojiOpen,setEmojiOpen]=useState(false);
  useEffect(() => { if (!story || story.permanent || stories.length <= 1) return; const timer = setTimeout(() => { if (index < stories.length - 1) onNavigate(index + 1); else onClose(); }, 5000); return () => clearTimeout(timer); }, [story?.id, index, stories.length, autoKey]);
  if(!story) return null;
  const owner=story.user===current.username; const user=users.find(u=>u.username===story.user)||current; const liked=(story.likedBy||[]).includes(current.username);
  const previous=()=>{ if(index>0) { setAutoKey(k=>k+1); onNavigate(index-1); } }; const next=()=>{ if(index<stories.length-1) { setAutoKey(k=>k+1); onNavigate(index+1); } else onClose(); };
  const submitComment=()=>{if(!comment.trim())return; onStoryComment?.(story.id,comment);setComment('');setEmojiOpen(false)};
  const storyComments=story.comments||[];
  return <div className="story-viewer" onClick={onClose}><div className="story-screen" onClick={e=>e.stopPropagation()}><div className="story-progress">{stories.map((_,i)=><span key={i} className={i<index?'done':i===index?'current':''}/>)}</div><button className="story-close" onClick={onClose}><FiX/></button><div className="story-user"><img src={user.avatar}/><div><b>{owner?'Your story':user.name}</b><small>@{user.username} · {story.permanent ? 'Highlight' : timeLeft(story.expiresAt)}</small></div></div>{stories.length>1&&<><button className="story-nav story-prev" onClick={previous} disabled={index===0}><FiChevronLeft/></button><button className="story-nav story-next" onClick={next}><FiChevronLeft/></button></>}<div className="story-content">{story.img&&<img src={story.img}/>}<div className="story-placeholder">{story.text||(!story.img?'Story':'')}</div>{storyComments.length>0&&<div className="story-comments-preview">{storyComments.slice(-3).map(c=>{const cu=users.find(u=>u.username===c.user);return <div key={c.id}><img src={cu?.avatar||makeAvatar(c.user)}/><span><b>{cu?.name||c.user}</b> {c.text}</span></div>})}</div>}</div><div className="story-bottom"><button onClick={()=>onLike(story.id)} className={liked?'liked':''}><FiHeart/> {story.likedBy?.length||0}</button>{!owner && <div className="story-comment-wrap"><div className="story-comment-input"><button className="emoji-trigger" type="button" onClick={()=>setEmojiOpen(v=>!v)}><FiSmile/></button><input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitComment()} placeholder="Reply to story..."/><button onClick={submitComment}><FiSend/></button></div>{emojiOpen&&<EmojiPicker onPick={e=>setComment(t=>t+e)}/>}</div>}{owner && !story.permanent ? <><button onClick={()=>onHighlight(story)}><FiBookmark/> Add to Highlights</button><button className="danger-story" onClick={()=>onDelete(story)}><FiTrash2/> Delete</button></>:<div className="story-audience">{story.permanent?'Highlight':(story.audience==='close'?'Close friends':'Public')}</div>}</div></div></div>;
}
function timeLeft(exp){ const mins=Math.max(1,Math.ceil((exp-Date.now())/60000)); return mins>=60?`${Math.ceil(mins/60)}h left`:`${mins}m left`; }

function ShareModal({post,users,current,onClose,onSuccess,onSendRaven}) {
  if(!post) return null; const platforms=['Instagram','WhatsApp','Facebook','X','Telegram','Messenger','Snapchat','LinkedIn']; const recipients=(users||[]).filter(u=>u.username!==current?.username);
  return <Modal title="Share post" onClose={onClose}><p className="modal-note">Share this post with a Raven user or choose an online platform.</p><div className="share-section-title">Send to Raven</div><div className="recipient-list">{recipients.map(u=><button key={u.id} onClick={()=>onSendRaven(u.username,post.id)}><img src={u.avatar}/><span><b>{u.name}</b><small>@{u.username}</small></span><FiSend/></button>)}</div><div className="share-section-title">Share to platform</div><div className="share-grid">{platforms.map(p=><button key={p} onClick={()=>onSuccess(p)}><span>{platformIcon(p)}</span><b>{p}</b><FiExternalLink/></button>)}</div><button className="copy-share" onClick={()=>{navigator.clipboard?.writeText(window.location.href);onSuccess('Copy Link')}}><FiCopy/> Copy link</button></Modal>;
}
function platformIcon(p){ return p.slice(0,1); }

function Modal({title,onClose,children}) { return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal card"><div className="modal-head"><h2>{title}</h2><button className="icon" onClick={onClose}><FiX/></button></div>{children}</div></div>; }


function readAccounts() {
  try { return JSON.parse(localStorage.getItem('raven-auth-v1') || 'null') || null; } catch { return null; }
}
function defaultAccounts() {
  return [
    { username:'varun', email:'varun@raven.app', password:'raven123', name:'Varun Prasath' },
    { username:'arun_dev', email:'arun@raven.app', password:'raven123', name:'Arun Kumar' },
    { username:'kaviya_21', email:'kaviya@raven.app', password:'raven123', name:'Kaviya' },
    { username:'sanjay_fx', email:'sanjay@raven.app', password:'raven123', name:'Sanjay' }
  ];
}
function AuthGate() {
  const [mode,setMode]=useState('login');
  const [session,setSession]=useState(() => localStorage.getItem('raven-session-v1') || '');
  const [admin,setAdmin]=useState(() => localStorage.getItem('raven-admin-session-v1') === '1');
  const [toast,setToast]=useState('');
  const flash = m => { setToast(m); clearTimeout(window.__ravenAuthToast); window.__ravenAuthToast=setTimeout(()=>setToast(''),2200); };
  const accounts = () => readAccounts() || defaultAccounts();
  const saveAccounts = a => localStorage.setItem('raven-auth-v1', JSON.stringify(a));
  const login = ({identity,password}) => {
    const value=identity.trim().toLowerCase().replace(/^@/,'');
    const acc=accounts().find(a => a.username===value || a.email===value);
    if(!acc || acc.password!==password) return flash('Invalid Raven ID/email or password');
    localStorage.setItem('raven-session-v1', acc.username); setSession(acc.username); flash('Login successful');
  };
  const signup = ({username,name,email,password}) => {
    const clean=username.trim().toLowerCase().replace(/^@/,'').replace(/[^a-z0-9_.]/g,'');
    if(clean.length<3) return flash('Raven ID must have at least 3 characters');
    if(!name.trim() || !email.trim() || password.length<6) return flash('Fill all fields • password needs 6+ characters');
    const a=accounts(); if(a.some(x=>x.username===clean || x.email.toLowerCase()===email.trim().toLowerCase())) return flash('Raven ID or email already exists');
    saveAccounts([...a,{username:clean,name:name.trim(),email:email.trim().toLowerCase(),password}]);
    try {
      const st=JSON.parse(localStorage.getItem(STORAGE)||'{}');
      const avatar=makeAvatar(name.trim());
      st.users=[...(st.users||defaultUsers),{id:Date.now(),username:clean,name:name.trim(),bio:'New Raven member',avatar}];
      st.follows={...(st.follows||{}),[clean]:[]}; st.me=clean; st.viewUser=clean;
      localStorage.setItem(STORAGE,JSON.stringify(st));
    } catch {}
    localStorage.setItem('raven-session-v1',clean); setSession(clean); flash('Account created successfully');
  };
  const resetPassword = ({identity,newPassword}) => {
    if(newPassword.length<6) return flash('New password needs 6+ characters');
    const a=accounts(); const i=a.findIndex(x=>x.username===identity.trim().toLowerCase().replace(/^@/,'') || x.email===identity.trim().toLowerCase());
    if(i<0) return flash('No Raven account found');
    a[i]={...a[i],password:newPassword}; saveAccounts(a); setMode('login'); flash('Password reset successfully • login now');
  };
  const adminLogin = ({email,password}) => {
    if(email.trim().toLowerCase()==='admin@raven.app' && password==='admin123') {
      localStorage.setItem('raven-admin-session-v1','1'); setAdmin(true); localStorage.setItem('raven-session-v1','varun'); setSession('varun'); flash('Admin login successful');
    } else flash('Invalid admin credentials');
  };
  const logout = () => { localStorage.removeItem('raven-session-v1'); localStorage.removeItem('raven-admin-session-v1'); setSession(''); setAdmin(false); setMode('login'); };
  if(session) return <App key={`${session}-${admin}`} sessionUser={session} adminMode={admin} onLogout={logout}/>;
  return <AuthShell mode={mode} setMode={setMode} onLogin={login} onSignup={signup} onReset={resetPassword} onAdminLogin={adminLogin} toast={toast}/>;
}
function AuthShell({mode,setMode,onLogin,onSignup,onReset,onAdminLogin,toast}) {
  return <div className="auth-page"><div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/><div className="auth-card"><div className="auth-brand"><img src={RAVEN_LOGO} alt="Raven logo"/><div><b>RAVEN</b><span>CONNECT · CREATE · BELONG</span></div></div>{mode==='login'&&<LoginForm onSubmit={onLogin} setMode={setMode}/>} {mode==='signup'&&<SignupForm onSubmit={onSignup} setMode={setMode}/>} {mode==='reset'&&<ResetForm onSubmit={onReset} setMode={setMode}/>} {mode==='admin'&&<AdminLoginForm onSubmit={onAdminLogin} setMode={setMode}/>}<div className="auth-footer">RAVEN • Your space for real connections</div></div>{toast&&<div className="toast auth-toast">{toast}</div>}</div>;
}
function LoginForm({onSubmit,setMode}) { const [identity,setIdentity]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); return <form className="auth-form" onSubmit={e=>{e.preventDefault();onSubmit({identity,password})}}><span className="eyebrow">WELCOME BACK</span><h1>Log in to Raven</h1><p>Continue where you left off.</p><label>Raven ID or Email<input autoFocus value={identity} onChange={e=>setIdentity(e.target.value)} placeholder="@yourid or you@email.com"/></label><label>Password<div className="password-field"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div></label><button className="auth-primary" type="submit">Log in <FiArrowLeft className="rotate-180"/></button><div className="auth-links"><button type="button" onClick={()=>setMode('reset')}>Forgot password?</button><button type="button" onClick={()=>setMode('admin')}>Admin login</button></div><div className="auth-divider"><span>NEW TO RAVEN?</span></div><button type="button" className="auth-secondary" onClick={()=>setMode('signup')}>Create new account <FiPlus/></button><small className="demo-hint">Demo user: <b>varun</b> / <b>raven123</b></small></form>; }
function SignupForm({onSubmit,setMode}) { const [username,setUsername]=useState(''); const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); return <form className="auth-form" onSubmit={e=>{e.preventDefault();onSubmit({username,name,email,password})}}><button type="button" className="back-auth" onClick={()=>setMode('login')}><FiChevronLeft/> Back to login</button><span className="eyebrow">JOIN RAVEN</span><h1>Create your account</h1><p>Pick your Raven ID and start sharing.</p><label>Full name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Raven ID<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="@username"/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></label><label>Password<div className="password-field"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters"/><button type="button" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div></label><button className="auth-primary" type="submit">Create account <FiPlus/></button><small className="demo-hint">By continuing, you agree to use Raven responsibly.</small></form>; }
function ResetForm({onSubmit,setMode}) { const [identity,setIdentity]=useState(''); const [password,setPassword]=useState(''); return <form className="auth-form" onSubmit={e=>{e.preventDefault();onSubmit({identity,newPassword:password})}}><button type="button" className="back-auth" onClick={()=>setMode('login')}><FiChevronLeft/> Back to login</button><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Reset password</h1><p>Enter your Raven ID or email and choose a new password.</p><label>Raven ID or Email<input autoFocus value={identity} onChange={e=>setIdentity(e.target.value)} placeholder="@yourid or email"/></label><label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters"/></label><button className="auth-primary" type="submit">Reset password <FiCheck/></button></form>; }
function AdminLoginForm({onSubmit,setMode}) { const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); return <form className="auth-form" onSubmit={e=>{e.preventDefault();onSubmit({email,password})}}><button type="button" className="back-auth" onClick={()=>setMode('login')}><FiChevronLeft/> Back to login</button><span className="eyebrow">CONTROL CENTER</span><h1>Admin login</h1><p>Authorized administrators only.</p><label>Admin email<input autoFocus type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@raven.app"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password"/></label><button className="auth-primary" type="submit"><FiShield/> Enter admin</button><div className="admin-demo">Demo admin: <b>admin@raven.app</b> · <b>admin123</b></div></form>; }

createRoot(document.getElementById('root')).render(<AuthGate/>);
