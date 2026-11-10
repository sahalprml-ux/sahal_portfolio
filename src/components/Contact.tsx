import { useRef, useState, type FormEvent } from 'react';
import { mailto, site } from '../data/site';
import { ArrowRight, DownloadIcon, GitHubIcon, LinkedInIcon } from './Icons';
import { Eyebrow } from './Eyebrow';
import { SplitText } from './SplitText';

type Field = 'name' | 'email' | 'message';
const EMPTY = { name: '', email: '', message: '' };

function validate(form: typeof EMPTY) {
  const errors: Partial<Record<Field, string>> = {};
  if (!form.name.trim()) errors.name = 'Please add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Please enter a valid email.';
  if (form.message.trim().length < 10) errors.message = 'A sentence or two helps me reply properly.';
  return errors;
}

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: Field) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  // No backend: the form composes an email in the visitor's mail client.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name.trim()}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\n${form.name.trim()} — ${form.email.trim()}`);
    window.location.href = `${mailto}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const fieldProps = (field: Field) => ({
    id: `contact-${field}`,
    name: field,
    value: form[field],
    onChange: update(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <section id="contact" className="section section-contact" aria-labelledby="contact-title">
      <div className="contact-card">
        <div className="contact-glow" aria-hidden="true" />
        <div className="contact-grid">
          <div className="contact-copy">
            <Eyebrow num="07" label="Contact" />
            <SplitText id="contact-title" className="contact-title">
              Have an idea <em>worth building?</em>
            </SplitText>
            <p className="contact-lede" data-reveal="80">
              I'm open to AI and machine learning engineering roles and collaborations. Tell me about the problem
              you're working on.
            </p>
            <div className="contact-ctas" data-reveal="120">
              <a href={mailto} className="btn btn-primary">
                Let's Talk
              </a>
              {site.resume && (
                <a href={site.resume} className="btn btn-glass" download>
                  <DownloadIcon />
                  CV
                </a>
              )}
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-glass">
                <LinkedInIcon />
                LinkedIn
              </a>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-glass">
                <GitHubIcon size={16} />
                GitHub
              </a>
            </div>
          </div>

          <div className="contact-form-wrap" data-reveal="120">
            {sent ? (
              <div className="sent" role="status">
                <span className="sent-kicker">Message ready</span>
                <span className="sent-title">Thanks, {form.name.trim()}.</span>
                <span className="sent-text">
                  Your email client should open with the message filled in. If it didn't, write directly to{' '}
                  <a href={mailto}>{site.email}</a>.
                </span>
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={() => {
                    setSent(false);
                    setForm(EMPTY);
                  }}
                >
                  Write another
                </button>
              </div>
            ) : (
              <form ref={formRef} className="contact-form" onSubmit={submit} noValidate>
                <div className="field">
                  <label className="field-label" htmlFor="contact-name">
                    Name
                  </label>
                  <input className="input" type="text" autoComplete="name" placeholder="Your name" {...fieldProps('name')} />
                  {errors.name && (
                    <span id="contact-name-error" className="field-error">
                      {errors.name}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...fieldProps('email')}
                  />
                  {errors.email && (
                    <span id="contact-email-error" className="field-error">
                      {errors.email}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    className="input textarea"
                    rows={5}
                    placeholder="Tell me about the problem you're solving"
                    {...fieldProps('message')}
                  />
                  {errors.message && (
                    <span id="contact-message-error" className="field-error">
                      {errors.message}
                    </span>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Start a Conversation
                  <ArrowRight />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
