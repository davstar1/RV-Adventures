import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  UserRound,
  Lightbulb,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  PenLine,
  Play,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  addContentItem,
  clearAdminContent,
  deleteContentItem,
  slugify,
  updateContentItem,
  useContent,
  youtubeIdFromUrl,
} from './contentStore';
import { categories } from './data';
import {
  getAdminSession,
  isSupabaseConfigured,
  onAdminAuthChange,
  signInAdmin,
  signOutAdmin,
} from './supabaseApi';
import './Admin.css';

const tabs = [
  { id: 'stories', label: 'Stories', icon: PenLine, store: 'posts' },
  { id: 'about', label: 'About Us', icon: UserRound, store: 'about' },
  { id: 'reviews', label: 'Reviews', icon: Star, store: 'posts', category: 'Reviews' },
  { id: 'tips', label: 'Tips & Tricks', icon: Lightbulb, store: 'posts', category: 'Tips & Tricks' },
  { id: 'gear-mods', label: 'Gear & Mods', icon: Wrench, store: 'posts', category: 'Gear & Mods' },
  { id: 'videos', label: 'Videos', icon: Play, store: 'videos' },
  { id: 'destinations', label: 'Destinations', icon: MapPin, store: 'destinations' },
  { id: 'gear', label: 'Gear', icon: Package, store: 'gear' },
  { id: 'community', label: 'Community', icon: MessageCircle, store: 'comments' },
];

function tabFromHash() {
  const requested = window.location.hash.replace('#admin/', '');
  return tabs.some(tab => tab.id === requested) ? requested : 'stories';
}

const storyFormDefaults = {
  title: '',
  category: 'Destinations',
  tag: '',
  excerpt: '',
  image: '',
  author: '',
  readTime: '',
};

const emptyForms = {
  stories: storyFormDefaults,
  reviews: { ...storyFormDefaults, category: 'Reviews' },
  tips: { ...storyFormDefaults, category: 'Tips & Tricks' },
  'gear-mods': { ...storyFormDefaults, category: 'Gear & Mods' },
  about: {
    title: '',
    body: '',
    image: '',
    gallery: [],
    media: [],
  },
  videos: {
    title: '',
    youtubeUrl: '',
    thumb: '',
    duration: '',
    views: '',
    channel: 'Open Road RV',
  },
  destinations: {
    name: '',
    image: '',
    description: '',
    gallery: [],
    count: '1',
  },
  gear: {
    name: '',
    category: '',
    price: '',
    image: '',
    rating: '4.8',
    reviews: '1',
    desc: '',
    badge: 'Road Tested',
    link: '',
    emoji: '★',
  },
  community: {
    name: '',
    text: '',
  },
};

function activeTabFor(id) {
  return tabs.find(tab => tab.id === id) || tabs[0];
}

function isPostTab(active) {
  return activeTabFor(active).store === 'posts';
}

function categoryForActive(active, form) {
  return activeTabFor(active).category || form.category;
}

function entriesForTab(stored, tab) {
  const entries = stored[tab.store] || [];
  return tab.category ? entries.filter(entry => entry.category === tab.category) : entries;
}

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const readMediaFile = readPhoto;

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PhotoField({ label, value, onChange }) {
  return (
    <div className="admin-photo-field">
      <Field label={label}>
        <input
          type="url"
          value={value}
          placeholder="Paste an image URL or upload a photo"
          onChange={e => onChange(e.target.value)}
        />
      </Field>
      <label className="admin-upload">
        <Camera size={16} />
        Upload Photo
        <input
          type="file"
          accept="image/*"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (file) onChange(await readPhoto(file));
          }}
        />
      </label>
    </div>
  );
}

function PhotoGalleryField({ value = [], onChange }) {
  const photos = Array.isArray(value) ? value : [];
  const addPhotos = nextPhotos => onChange([...photos, ...nextPhotos.filter(Boolean)]);
  const removePhoto = index => onChange(photos.filter((_, photoIndex) => photoIndex !== index));

  return (
    <div className="admin-gallery-field">
      <Field label="Destination gallery photo URLs">
        <textarea
          value={photos.join('\n')}
          rows={4}
          placeholder="Paste one image URL per line"
          onChange={e => onChange(e.target.value.split('\n').map(url => url.trim()).filter(Boolean))}
        />
      </Field>
      <label className="admin-upload admin-gallery-upload">
        <Camera size={16} />
        Upload Multiple Photos
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async e => {
            const files = Array.from(e.target.files || []);
            if (files.length) addPhotos(await Promise.all(files.map(readPhoto)));
          }}
        />
      </label>
      {photos.length > 0 && (
        <div className="admin-gallery-preview">
          {photos.map((photo, index) => (
            <div className="admin-gallery-preview-item" key={`${photo}-${index}`}>
              <img src={photo} alt="" />
              <button type="button" onClick={() => removePhoto(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AboutMediaField({ value = [], onChange }) {
  const media = Array.isArray(value) ? value : [];
  const addItem = item => onChange([...media, item]);
  const updateItem = (index, patch) => onChange(media.map((item, itemIndex) => (
    itemIndex === index ? { ...item, ...patch } : item
  )));
  const removeItem = index => onChange(media.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="admin-gallery-field admin-about-media-field">
      <div className="admin-media-add-row">
        <button
          type="button"
          className="admin-upload"
          onClick={() => addItem({ type: 'image', src: '', description: '' })}
        >
          <Camera size={16} /> Add Photo URL
        </button>
        <button
          type="button"
          className="admin-upload"
          onClick={() => addItem({ type: 'video', src: '', description: '' })}
        >
          <Play size={16} /> Add Video URL
        </button>
        <label className="admin-upload">
          <Camera size={16} />
          Upload Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async e => {
              const files = Array.from(e.target.files || []);
              if (files.length) {
                const uploaded = await Promise.all(files.map(async file => ({
                  type: 'image',
                  src: await readMediaFile(file),
                  description: '',
                })));
                onChange([...media, ...uploaded]);
              }
            }}
          />
        </label>
        <label className="admin-upload">
          <Play size={16} />
          Upload Videos
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={async e => {
              const files = Array.from(e.target.files || []);
              if (files.length) {
                const uploaded = await Promise.all(files.map(async file => ({
                  type: 'video',
                  src: await readMediaFile(file),
                  description: '',
                })));
                onChange([...media, ...uploaded]);
              }
            }}
          />
        </label>
      </div>

      {media.length === 0 ? (
        <p className="admin-empty">Add About photos or videos here.</p>
      ) : (
        <div className="admin-about-media-list">
          {media.map((item, index) => (
            <div className="admin-about-media-item" key={`${item.src}-${index}`}>
              <Field label={`Media ${index + 1} type`}>
                <select value={item.type || 'image'} onChange={e => updateItem(index, { type: e.target.value })}>
                  <option value="image">Photo</option>
                  <option value="video">Video</option>
                </select>
              </Field>
              <Field label="Media URL">
                <input
                  value={item.src || ''}
                  placeholder={item.type === 'video' ? 'Paste a video URL' : 'Paste a photo URL'}
                  onChange={e => updateItem(index, { src: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={item.description || ''}
                  rows={3}
                  placeholder="Write the caption or story for this photo/video."
                  onChange={e => updateItem(index, { description: e.target.value })}
                />
              </Field>
              <div className="admin-about-media-preview">
                {item.type === 'video' && item.src ? (
                  <video src={item.src} controls />
                ) : item.src ? (
                  <img src={item.src} alt="" />
                ) : (
                  <div className="admin-entry-thumb admin-entry-thumb--empty">{item.type === 'video' ? 'V' : 'P'}</div>
                )}
                <button type="button" onClick={() => removeItem(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminForm({ active, form, setForm, onSave, isEditing }) {
  const patch = values => setForm(current => ({ ...current, ...values }));
  const actionLabel = label => isEditing ? `Update ${label}` : `Add ${label}`;
  const fixedPostCategory = activeTabFor(active).category;

  if (isPostTab(active)) {
    const postLabel = fixedPostCategory || 'Story';

    return (
      <div className="admin-form-grid">
        <Field label={`${postLabel} title`}>
          <input value={form.title} onChange={e => patch({ title: e.target.value })} />
        </Field>
        {fixedPostCategory ? (
          <Field label="Category">
            <input value={fixedPostCategory} readOnly />
          </Field>
        ) : (
          <Field label="Category">
            <select value={form.category} onChange={e => patch({ category: e.target.value })}>
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        )}
        <Field label="Tag">
          <input value={form.tag} placeholder="Featured, Popular, Sponsored" onChange={e => patch({ tag: e.target.value })} />
        </Field>
        <Field label="Author">
          <input value={form.author} onChange={e => patch({ author: e.target.value })} />
        </Field>
        <Field label="Read time">
          <input value={form.readTime} placeholder="8 min" onChange={e => patch({ readTime: e.target.value })} />
        </Field>
        <PhotoField label="Story photo" value={form.image} onChange={image => patch({ image })} />
        <Field label="Excerpt">
          <textarea value={form.excerpt} rows={5} onChange={e => patch({ excerpt: e.target.value })} />
        </Field>
        <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel(postLabel)}</button>
      </div>
    );
  }

  if (active === 'videos') {
    return (
      <div className="admin-form-grid">
        <Field label="Video title">
          <input value={form.title} onChange={e => patch({ title: e.target.value })} />
        </Field>
        <Field label="YouTube URL">
          <input value={form.youtubeUrl} placeholder="https://www.youtube.com/watch?v=..." onChange={e => patch({ youtubeUrl: e.target.value })} />
        </Field>
        <Field label="Duration">
          <input value={form.duration} placeholder="12:34" onChange={e => patch({ duration: e.target.value })} />
        </Field>
        <Field label="Views">
          <input value={form.views} placeholder="1.2K" onChange={e => patch({ views: e.target.value })} />
        </Field>
        <Field label="Channel">
          <input value={form.channel} onChange={e => patch({ channel: e.target.value })} />
        </Field>
        <PhotoField label="Thumbnail override" value={form.thumb} onChange={thumb => patch({ thumb })} />
        <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel('Video')}</button>
      </div>
    );
  }

  if (active === 'about') {
    return (
      <div className="admin-form-grid">
        <Field label="About section title">
          <input value={form.title} placeholder="Meet the Open Road crew" onChange={e => patch({ title: e.target.value })} />
        </Field>
        <PhotoField label="Main about photo" value={form.image} onChange={image => patch({ image })} />
        <Field label="About us story">
          <textarea value={form.body} rows={7} placeholder="Write your story, why you travel, and what visitors can expect from the site." onChange={e => patch({ body: e.target.value })} />
        </Field>
        <AboutMediaField value={form.media} onChange={media => patch({ media })} />
        <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel('About Section')}</button>
      </div>
    );
  }

  if (active === 'destinations') {
    return (
      <div className="admin-form-grid">
        <Field label="Destination name">
          <input value={form.name} placeholder="Sedona, Arizona" onChange={e => patch({ name: e.target.value })} />
        </Field>
        <Field label="Number of guides">
          <input type="number" min="1" value={form.count} onChange={e => patch({ count: e.target.value })} />
        </Field>
        <PhotoField label="Destination photo" value={form.image} onChange={image => patch({ image })} />
        <Field label="Destination description">
          <textarea value={form.description} rows={5} onChange={e => patch({ description: e.target.value })} />
        </Field>
        <PhotoGalleryField value={form.gallery} onChange={gallery => patch({ gallery })} />
        <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel('Destination')}</button>
      </div>
    );
  }

  if (active === 'gear') {
    return (
      <div className="admin-form-grid">
        <Field label="Gear name">
          <input value={form.name} onChange={e => patch({ name: e.target.value })} />
        </Field>
        <Field label="Category">
          <input value={form.category} placeholder="Recovery, Storage, Power" onChange={e => patch({ category: e.target.value })} />
        </Field>
        <Field label="Price">
          <input value={form.price} placeholder="$129" onChange={e => patch({ price: e.target.value })} />
        </Field>
        <Field label="Gear photo URL">
          <input value={form.image} placeholder="https://example.com/gear-photo.jpg" onChange={e => patch({ image: e.target.value })} />
        </Field>
        <Field label="Rating">
          <input type="number" min="1" max="5" step=".1" value={form.rating} onChange={e => patch({ rating: e.target.value })} />
        </Field>
        <Field label="Reviews">
          <input type="number" min="0" value={form.reviews} onChange={e => patch({ reviews: e.target.value })} />
        </Field>
        <Field label="Badge">
          <input value={form.badge} onChange={e => patch({ badge: e.target.value })} />
        </Field>
        <Field label="Shop button link">
          <input value={form.link} placeholder="https://example.com/product" onChange={e => patch({ link: e.target.value })} />
        </Field>
        <Field label="Icon">
          <input value={form.emoji} maxLength={2} onChange={e => patch({ emoji: e.target.value })} />
        </Field>
        <Field label="Review summary">
          <textarea value={form.desc} rows={4} onChange={e => patch({ desc: e.target.value })} />
        </Field>
        <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel('Gear Review')}</button>
      </div>
    );
  }

  return (
    <div className="admin-form-grid">
      <Field label="Name">
        <input value={form.name} onChange={e => patch({ name: e.target.value })} />
      </Field>
      <Field label="Community post">
        <textarea value={form.text} rows={5} onChange={e => patch({ text: e.target.value })} />
      </Field>
      <button className="admin-save" onClick={onSave}><Plus size={16} /> {actionLabel('Community Entry')}</button>
    </div>
  );
}

function titleForEntry(entry) {
  return entry.title || entry.name || entry.text || 'Untitled entry';
}

function metaForEntry(active, entry) {
  if (isPostTab(active)) return `${entry.category || 'Story'} · ${entry.date || 'Draft'}`;
  if (active === 'videos') return `${entry.channel || 'Video'} · ${entry.duration || 'New'}`;
  if (active === 'destinations') return `${entry.count || 0} guides`;
  if (active === 'gear') return `${entry.category || 'Gear'} · ${entry.price || 'See price'}`;
  return entry.time || 'Just now';
}

function normalizeProductLink(value, fallback) {
  const link = value.trim();
  if (!link) return fallback;
  if (link.startsWith('#') || link.startsWith('/') || /^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

function mediaFromAboutEntry(entry) {
  if (Array.isArray(entry.media)) {
    return entry.media.map(item => (
      typeof item === 'string'
        ? { type: 'image', src: item, description: '' }
        : { type: item.type || 'image', src: item.src || item.url || '', description: item.description || '' }
    )).filter(item => item.src);
  }

  return Array.from(new Set([
    entry.image,
    ...(Array.isArray(entry.gallery) ? entry.gallery : []),
  ].filter(Boolean))).map(src => ({ type: 'image', src, description: '' }));
}

function cleanAboutMediaItem(item) {
  return {
    type: item.type === 'video' ? 'video' : 'image',
    src: String(item.src || '').trim(),
    description: item.description || '',
  };
}

function formFromEntry(active, entry) {
  if (isPostTab(active)) {
    return {
      title: entry.title || '',
      category: activeTabFor(active).category || entry.category || 'Destinations',
      tag: entry.tag || '',
      excerpt: entry.excerpt || '',
      image: entry.image || '',
      author: entry.author || '',
      readTime: entry.readTime || '',
    };
  }

  if (active === 'videos') {
    return {
      title: entry.title || '',
      youtubeUrl: entry.youtubeUrl || '',
      thumb: entry.thumb || '',
      duration: entry.duration || '',
      views: entry.views || '',
      channel: entry.channel || 'Open Road RV',
    };
  }

  if (active === 'about') {
    return {
      title: entry.title || '',
      body: entry.body || '',
      image: '',
      gallery: [],
      media: mediaFromAboutEntry(entry),
    };
  }

  if (active === 'destinations') {
    return {
      name: entry.name || '',
      image: entry.image || '',
      description: entry.description || '',
      gallery: Array.isArray(entry.gallery) ? entry.gallery : [],
      count: String(entry.count || '1'),
    };
  }

  if (active === 'gear') {
    return {
      name: entry.name || '',
      category: entry.category || '',
      price: entry.price || '',
      image: entry.image || '',
      rating: String(entry.rating || '4.8'),
      reviews: String(entry.reviews || '1'),
      desc: entry.desc || '',
      badge: entry.badge || 'Road Tested',
      link: entry.link || '',
      emoji: entry.emoji || '★',
    };
  }

  return {
    name: entry.name || '',
    text: entry.text || '',
  };
}

function buildPayload(active, form) {
  if (isPostTab(active)) {
    if (!form.title || !form.excerpt) return { error: 'Add a title and excerpt first.' };
    return {
      payload: {
        slug: slugify(form.title),
        category: categoryForActive(active, form),
        tag: form.tag || null,
        title: form.title,
        excerpt: form.excerpt,
        image: form.image || '',
        author: form.author || 'Open Road RV',
        authorAvatar: '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: form.readTime || '5 min',
        likes: 0,
        comments: 0,
        sponsored: form.tag?.toLowerCase() === 'sponsored',
      },
    };
  }

  if (active === 'videos') {
    if (!form.title || !form.youtubeUrl) return { error: 'Add a title and YouTube URL first.' };
    const youtubeId = youtubeIdFromUrl(form.youtubeUrl);
    return {
      payload: {
        title: form.title,
        youtubeUrl: form.youtubeUrl,
        youtubeId,
        thumb: form.thumb || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''),
        duration: form.duration || 'New',
        views: form.views || '0',
        channel: form.channel || 'Open Road RV',
      },
    };
  }

  if (active === 'about') {
    const media = (form.media || [])
      .map(cleanAboutMediaItem)
      .filter(item => item.src);
    const fallbackPhoto = String(form.image || '').trim();
    const mergedMedia = media.length > 0
      ? media
      : (fallbackPhoto ? [{ type: 'image', src: fallbackPhoto, description: '' }] : []);
    const title = form.title.trim() || 'A note from the road';
    const body = form.body.trim();

    if (!body && mergedMedia.length === 0) {
      return { error: 'Add an About story, photo URL, or video URL first.' };
    }

    return {
      payload: {
        title,
        body,
        image: form.image || mergedMedia.find(item => item.type === 'image')?.src || '',
        gallery: mergedMedia.filter(item => item.type === 'image').map(item => item.src),
        media: mergedMedia,
      },
    };
  }

  if (active === 'destinations') {
    if (!form.name) return { error: 'Add a destination name first.' };
    const gallery = Array.from(new Set([form.image, ...(form.gallery || [])].filter(Boolean)));

    return {
      payload: {
        name: form.name,
        image: form.image || gallery[0] || '',
        description: form.description || '',
        gallery,
        count: Number(form.count) || 1,
      },
    };
  }

  if (active === 'gear') {
    if (!form.name || !form.desc) return { error: 'Add a gear name and review summary first.' };
    return {
      payload: {
        name: form.name,
        category: form.category || 'Gear',
        price: form.price || 'See price',
        image: form.image || '',
        rating: Number(form.rating) || 4.8,
        reviews: Number(form.reviews) || 0,
        desc: form.desc,
        badge: form.badge || 'Road Tested',
        link: normalizeProductLink(form.link, `#gear-${slugify(form.name)}`),
        emoji: form.emoji || '★',
      },
    };
  }

  if (!form.name || !form.text) return { error: 'Add a name and community post first.' };
  return {
    payload: {
        name: form.name,
        avatar: '',
        text: form.text,
      time: 'Just now',
      likes: 0,
    },
  };
}

function EntryList({ active, entries, onEdit, onDelete }) {
  const isCommunity = active === 'community';
  const tabLabel = tabs.find(tab => tab.id === active)?.label;
  const entryLabel = isCommunity ? 'visitor comments' : 'admin entries';

  return (
    <div className="admin-entry-list">
      <div className="admin-entry-list-head">
        <h3>{isCommunity ? 'Community Comments' : `Saved ${tabLabel}`}</h3>
        <span>{entries.length} {entryLabel}</span>
      </div>

      {entries.length === 0 ? (
        <p className="admin-empty">{isCommunity ? 'No community comments yet.' : 'No admin-created entries yet.'}</p>
      ) : (
        <div className="admin-entry-items">
          {entries.map(entry => (
            <article key={entry.id} className="admin-entry-item">
              {'image' in entry || 'thumb' in entry ? (
                <img src={entry.image || entry.thumb} alt="" className="admin-entry-thumb" />
              ) : (
                <div className="admin-entry-thumb admin-entry-thumb--empty">{String(titleForEntry(entry)).slice(0, 1)}</div>
              )}
              <div className="admin-entry-copy">
                <h4>{titleForEntry(entry)}</h4>
                <span>{metaForEntry(active, entry)}</span>
                {entry.excerpt && <p>{entry.excerpt}</p>}
                {entry.desc && <p>{entry.desc}</p>}
                {active === 'community' && <p>{entry.text}</p>}
              </div>
              <div className="admin-entry-actions">
                <button type="button" className="admin-edit" onClick={() => onEdit(entry)} aria-label={`Edit ${titleForEntry(entry)}`}>
                  <PenLine size={15} /> Edit
                </button>
                <button type="button" className="admin-delete" onClick={() => onDelete(entry.id)} aria-label={`Delete ${titleForEntry(entry)}`}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function BackToSiteButton({ floating = false }) {
  return (
    <button
      type="button"
      className={floating ? 'admin-back admin-back--floating' : 'admin-back'}
      onClick={() => { window.location.hash = '#home'; }}
    >
      <ArrowLeft size={16} /> Back to site
    </button>
  );
}

function AdminSetup() {
  return (
    <main id="admin" className="admin-page">
      <div className="section-wrap admin-wrap">
        <BackToSiteButton />
        <div className="admin-auth-card">
          <span className="eyebrow">Setup Required</span>
          <h1>Connect Supabase</h1>
          <p>Add your Supabase URL and publishable key to a local `.env` file, then restart the site preview.</p>
          <pre>{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`}</pre>
        </div>
      </div>
      <BackToSiteButton floating />
    </main>
  );
}

function AdminSignIn({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await signInAdmin(email, password);
      onSignedIn(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="admin" className="admin-page">
      <div className="section-wrap admin-wrap">
        <form className="admin-auth-card admin-auth-card--login" onSubmit={submit}>
          <span className="eyebrow">Admin Login</span>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          {error && <span className="admin-error">{error}</span>}
          <button className="admin-save" type="submit" disabled={loading}>
            <Lock size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      <BackToSiteButton floating />
    </main>
  );
}

export default function Admin() {
  const [active, setActive] = useState(tabFromHash);
  const [forms, setForms] = useState(emptyForms);
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [session, setSession] = useState(getAdminSession);
  const content = useContent();

  useEffect(() => {
    const updateActiveTab = () => setActive(tabFromHash());
    window.addEventListener('hashchange', updateActiveTab);
    return () => window.removeEventListener('hashchange', updateActiveTab);
  }, []);

  useEffect(() => onAdminAuthChange(setSession), []);

  const counts = useMemo(() => tabs.reduce((next, tab) => ({
    ...next,
    [tab.id]: entriesForTab(content.stored, tab).length,
  }), {}), [content.stored]);

  const form = forms[active];
  const activeTab = activeTabFor(active);
  const activeEntries = entriesForTab(content.stored, activeTab);
  const setForm = update => setForms(current => ({
    ...current,
    [active]: typeof update === 'function' ? update(current[active]) : update,
  }));

  const removeEntry = async id => {
    const confirmed = window.confirm('Delete this entry from the site?');
    if (!confirmed) return;

    try {
      await deleteContentItem(activeTab.store, id);
      if (editingId === id) {
        setEditingId(null);
        setForms(current => ({ ...current, [active]: emptyForms[active] }));
      }
      setNotice('Entry deleted.');
    } catch (err) {
      setNotice(err.message);
    }
  };

  const editEntry = entry => {
    setEditingId(entry.id);
    setForms(current => ({ ...current, [active]: formFromEntry(active, entry) }));
    setNotice('Editing entry. Make changes, then update it.');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForms(current => ({ ...current, [active]: emptyForms[active] }));
    setNotice('');
  };

  const save = async () => {
    try {
      const { payload, error } = buildPayload(active, form);
      if (error) return setNotice(error);

      if (editingId) {
        await updateContentItem(activeTab.store, editingId, payload);
      } else {
        await addContentItem(activeTab.store, payload);
      }

      setForms(current => ({ ...current, [active]: emptyForms[active] }));
      setEditingId(null);
      setNotice(editingId ? 'Entry updated.' : 'Saved. You can view it on the public page now.');
    } catch (err) {
      setNotice(err.message);
    }
  };

  if (!isSupabaseConfigured) {
    return <AdminSetup />;
  }

  if (!session) {
    return <AdminSignIn onSignedIn={setSession} />;
  }

  return (
    <main id="admin" className="admin-page">
      <div className="section-wrap admin-wrap">
        <div className="admin-topbar">
          <button className="admin-reset" onClick={async () => { await signOutAdmin(); setSession(null); }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>

        <header className="admin-header">
          <span className="eyebrow">Site Manager</span>
          <p>Add YouTube videos, upload photos, publish stories, add destination cards, write gear reviews, and seed community posts.</p>
        </header>

        {content.storageMode === 'local' && (
          <button className="admin-reset admin-local-reset" onClick={() => { clearAdminContent(); setNotice('Admin entries cleared.'); }}>
            <RotateCcw size={15} /> Clear local entries
          </button>
        )}

        <div className="admin-layout">
          <aside className="admin-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`admin-tab ${active === tab.id ? 'admin-tab--active' : ''}`}
                  onClick={() => {
                    window.location.hash = `#admin/${tab.id}`;
                    setActive(tab.id);
                    setEditingId(null);
                    setNotice('');
                  }}
                >
                  <Icon size={17} />
                  <span>{tab.label}</span>
                  <em>{counts[tab.id]}</em>
                </button>
              );
            })}
          </aside>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>{tabs.find(tab => tab.id === active)?.label}</h2>
              <div className="admin-panel-status">
                {editingId && <button className="admin-cancel-edit" onClick={cancelEdit}>Cancel Edit</button>}
                {notice && <span className="admin-notice">{notice}</span>}
              </div>
            </div>
            <AdminForm active={active} form={form} setForm={setForm} onSave={save} isEditing={Boolean(editingId)} />
            <EntryList active={active} entries={activeEntries} onEdit={editEntry} onDelete={removeEntry} />
          </section>
        </div>
      </div>
      <BackToSiteButton floating />
    </main>
  );
}
