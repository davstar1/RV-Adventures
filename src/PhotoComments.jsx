import { useEffect, useState } from 'react';
import { ChevronDown, MessageCircle, Send } from 'lucide-react';
import { addPhotoComment, fetchPhotoComments, isSupabaseConfigured } from './supabaseApi';
import './PhotoComments.css';

function formatCommentDate(value) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PhotoComments({
  photoId,
  title = 'Comments',
  collapsible = false,
  defaultOpen = true,
  onOpenChange,
}) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(collapsible ? defaultOpen : true);
  const id = String(photoId || '').trim();
  const latestComment = comments.at(-1);

  useEffect(() => {
    if (!id || !isSupabaseConfigured) return undefined;

    let cancelled = false;

    fetchPhotoComments(id)
      .then(rows => {
        if (!cancelled) setComments(rows);
      })
      .catch(() => {
        if (!cancelled) setStatus('Comments could not be loaded.');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (collapsible) onOpenChange?.(isOpen);
  }, [collapsible, isOpen, onOpenChange]);

  if (!id) return null;

  const submitComment = async event => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const nextComment = await addPhotoComment({
        photoId: id,
        name: form.name,
        email: form.email,
        comment: form.comment,
      });
      setComments(current => [...current, nextComment]);
      setForm(current => ({ ...current, comment: '' }));
      setStatus('Comment added.');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`photo-comments${collapsible ? ' photo-comments--collapsible' : ''}${isOpen ? ' is-open' : ''}`} aria-label={title}>
      {collapsible ? (
        <button
          type="button"
          className="photo-comments-toggle"
          onClick={() => setIsOpen(current => !current)}
          aria-expanded={isOpen}
        >
          <span className="photo-comments-toggle-copy">
            <strong><MessageCircle size={15} /> {isOpen ? 'Hide comments' : title}</strong>
            <small>
              {latestComment
                ? `${latestComment.name}: ${latestComment.comment}`
                : 'Add a comment or read what visitors shared.'}
            </small>
          </span>
          <em>{comments.length}</em>
          <ChevronDown size={16} />
        </button>
      ) : (
        <div className="photo-comments-head">
          <span><MessageCircle size={15} /> {title}</span>
          <em>{comments.length}</em>
        </div>
      )}

      {(isOpen || collapsible) && (
        <div
          className="photo-comments-body"
          aria-hidden={collapsible && !isOpen}
          inert={collapsible && !isOpen ? '' : undefined}
        >
          {!isSupabaseConfigured ? (
            <p className="photo-comments-status">Comments need Supabase connected before they can be saved.</p>
          ) : (
            <>
              <form className="photo-comments-form" onSubmit={submitComment}>
                <div className="photo-comments-fields">
                  <input
                    value={form.name}
                    placeholder="Name"
                    maxLength={80}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    required
                  />
                  <input
                    type="email"
                    value={form.email}
                    placeholder="Email"
                    maxLength={160}
                    onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <textarea
                  value={form.comment}
                  placeholder="Write a comment..."
                  rows={3}
                  maxLength={600}
                  onChange={event => setForm(current => ({ ...current, comment: event.target.value }))}
                  required
                />
                <button type="submit" disabled={loading}>
                  <Send size={14} /> {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {status && <p className="photo-comments-status">{status}</p>}

              <div className="photo-comments-list">
                {comments.map(comment => (
                  <article key={comment.id} className="photo-comment">
                    <strong>{comment.name}</strong>
                    <span>{formatCommentDate(comment.created_at)}</span>
                    <p>{comment.comment}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
