import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { addLocalContentItem, useContent } from './contentStore';
import './Community.css';

export default function Community() {
  const { comments } = useContent();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!name.trim() || !text.trim()) return;

    addLocalContentItem('comments', {
      name: name.trim(),
      avatar: `https://i.pravatar.cc/40?u=${name}`,
      text: text.trim(),
      time: 'Just now',
      likes: 0,
    });

    setName('');
    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="community" className="community-section">
      <div className="section-wrap community-wrap">
        <div className="community-copy">
          <span className="eyebrow">Community Notes</span>
          <h2 className="community-heading">Road-tested advice from readers</h2>
          <p className="community-lead">
            Share a campground tip, ask a route question, or tell us what you learned on your last trip.
          </p>
          <div className="community-stat">
            <MessageCircle size={18} />
            <span>Recent road notes from the Open Road crew</span>
          </div>
        </div>

        <div className="community-panel">
          <div className="comment-form">
            <input
              className="comment-input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
            />
            <textarea
              className="comment-textarea"
              placeholder="Share your thoughts, questions, or road trip tips..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="comment-form-foot">
              {submitted && <span className="comment-thanks">Thanks for commenting!</span>}
              <button className="comment-submit btn-primary" onClick={submit}>
                <Send size={14} /> Post Comment
              </button>
            </div>
          </div>

          <div className="comment-list">
            {comments.map(c => (
              <div key={c.id} className="comment">
                <img src={c.avatar} alt={c.name} className="comment-avatar" />
                <div className="comment-body">
                  <div className="comment-head">
                    <span className="comment-name">{c.name}</span>
                    <span className="comment-time">{c.time}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
