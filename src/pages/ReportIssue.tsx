import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AiResultCard from '../components/AiResultCard';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { IconArrow, IconCheck, IconSparkle, IconTrash, IconUpload } from '../components/icons';
import { analyzeComplaint } from '../lib/ai';
import { useAuth } from '../lib/auth';
import { readImageFile } from '../lib/format';
import { useComplaints } from '../lib/store';
import { CATEGORIES } from '../lib/types';
import type { AiAnalysis, Category, Complaint } from '../lib/types';

interface FormState {
  title: string;
  description: string;
  category: Category | '';
  location: string;
}

const EMPTY_FORM: FormState = { title: '', description: '', category: '', location: '' };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ReportIssue() {
  const { addComplaint } = useComplaints();
  const { displayName, email } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Complaint | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const update =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: '' }));
    };

  const validate = (fields: string[] = ['title', 'description', 'location']) => {
    const next: Record<string, string> = {};
    if (fields.includes('title')) {
      if (!form.title.trim()) next.title = 'Give the issue a short title.';
      else if (form.title.trim().length < 6) next.title = 'Add a little more detail (at least 6 characters).';
    }
    if (fields.includes('description')) {
      if (!form.description.trim()) next.description = 'Describe what is happening.';
      else if (form.description.trim().length < 20)
        next.description = 'A few more words (20+ characters) help the AI route this correctly.';
    }
    if (fields.includes('location') && !form.location.trim()) {
      next.location = 'Where is this? A street, block or landmark helps the crew.';
    }
    return next;
  };

  const runAnalysis = async () => {
    const next = validate(['title', 'description']);
    setErrors((current) => ({ ...current, ...next }));
    if (Object.keys(next).length > 0) return;

    setAnalysing(true);
    await delay(750);
    const result = analyzeComplaint(form);
    setAnalysis(result);
    setAnalysing(false);
    if (window.innerWidth < 1000) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      setImage(dataUrl);
      setImageName(file.name);
      setErrors((current) => ({ ...current, image: '' }));
    } catch (error) {
      setErrors((current) => ({ ...current, image: (error as Error).message }));
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const finalAnalysis = analysis ?? analyzeComplaint(form);
    setSubmitting(true);
    setSubmitError('');
    try {
      const complaint = await addComplaint({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || finalAnalysis.category,
        location: form.location.trim(),
        image,
        priority: finalAnalysis.priority,
        analysis: finalAnalysis
      });

      setSubmitted(complaint);
      setForm(EMPTY_FORM);
      setAnalysis(null);
      setImage(null);
      setImageName('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError((error as Error).message || 'The complaint could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="section section--cream report-page">
        <div className="container report-page__narrow">
          <div className="success-card">
            <span className="success-card__icon" aria-hidden="true">
              <IconCheck width={26} height={26} />
            </span>
            <span className="eyebrow">
              <span className="eyebrow__dot" />
              Complaint received
            </span>
            <h1 className="display display--sm">Thank you — it is on the record.</h1>
            <p className="success-card__lede">
              Your complaint ID is <strong className="mono">{submitted.id}</strong>. Save it: it is the only thing you
              need to follow this issue from report to repair.
            </p>

            <dl className="success-card__facts">
              <div>
                <dt>Category</dt>
                <dd>{submitted.category}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <PriorityBadge priority={submitted.priority} />
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={submitted.status} />
                </dd>
              </div>
            </dl>

            <div className="success-card__actions">
              <Link to={`/track/${submitted.id}`} className="btn btn--coral">
                Track this complaint <IconArrow width={18} height={18} />
              </Link>
              <button type="button" className="btn btn--outline" onClick={() => setSubmitted(null)}>
                Report another issue
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--cream report-page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            Report an issue
          </span>
          <h1 className="display display--lg">
            Tell us what <em>needs fixing.</em>
          </h1>
          <p className="page-head__lede">
            Write it the way you would tell a neighbour. The AI reads the report, suggests a category and priority, and
            you stay in control of what gets submitted.
          </p>
        </header>

        <div className="report-layout">
          <form className="panel report-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="field">
              <div className="field__head">
                <label htmlFor="title">Complaint title</label>
                <span className="field__count">{form.title.length}/90</span>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                maxLength={90}
                placeholder="e.g. Deep pothole outside the school gate"
                value={form.title}
                onChange={update('title')}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p className="field__error" id="title-error">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="field">
              <div className="field__head">
                <label htmlFor="description">Description</label>
                <span className="field__count">{form.description.length}/600</span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={6}
                maxLength={600}
                placeholder="What is wrong, how long has it been like this, and who does it affect?"
                value={form.description}
                onChange={update('description')}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p className="field__error" id="description-error">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="category">Category</label>
                <div className="select-wrap">
                  <select id="category" name="category" value={form.category} onChange={update('category')}>
                    <option value="">Let the AI decide</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="field__hint">Optional — the AI suggestion can fill this in.</p>
              </div>

              <div className="field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Street, block or landmark"
                  value={form.location}
                  onChange={update('location')}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
                {errors.location && (
                  <p className="field__error" id="location-error">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="photo">Photo evidence</label>
              <div
                className={`upload${dragging ? ' is-dragging' : ''}${image ? ' has-image' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {image ? (
                  <div className="upload__preview">
                    <img src={image} alt="Preview of the selected complaint photo" />
                    <div className="upload__meta">
                      <strong>{imageName || 'Attached photo'}</strong>
                      <button
                        type="button"
                        className="upload__remove"
                        onClick={() => {
                          setImage(null);
                          setImageName('');
                          if (fileRef.current) fileRef.current.value = '';
                        }}
                      >
                        <IconTrash width={16} height={16} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="upload__button" onClick={() => document.getElementById('photo')?.click()}>
                    <span className="upload__icon" aria-hidden="true">
                      <IconUpload width={20} height={20} />
                    </span>
                    <strong>Add a photo</strong>
                    <small>Drag and drop, or click to browse · JPG, PNG, WebP</small>
                  </button>
                )}
                <input
                  ref={fileRef}
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </div>
              {errors.image && <p className="field__error">{errors.image}</p>}
            </div>

            <div className="report-form__actions">
              <button type="button" className="btn btn--outline" onClick={() => void runAnalysis()} disabled={analysing}>
                <IconSparkle width={17} height={17} />
                {analysing ? 'Analysing…' : 'Analyse with AI'}
              </button>
              <button type="submit" className="btn btn--coral" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit complaint'} <IconArrow width={18} height={18} />
              </button>
            </div>
            {submitError && (
              <p className="field__error" role="alert">
                {submitError}
              </p>
            )}
            <p className="report-form__note">
              {displayName || email
                ? `Saved to your CivicLens account${email ? ` as ${email}` : ''}. Only you can open it.`
                : 'Saved to your CivicLens account. Only you can open it.'}
            </p>
          </form>

          <aside className="report-aside">
            <div ref={resultRef} aria-live="polite" className="report-aside__live">
              {analysing && (
                <div className="ai-card ai-card--loading" aria-label="Analysing complaint">
                  <span className="skeleton skeleton--title" />
                  <span className="skeleton skeleton--line" />
                  <span className="skeleton skeleton--line skeleton--short" />
                  <span className="skeleton skeleton--line" />
                </div>
              )}
              {!analysing && analysis && (
                <AiResultCard
                  analysis={analysis}
                  onApplyCategory={() => setForm((current) => ({ ...current, category: analysis.category }))}
                />
              )}
              {!analysing && !analysis && (
                <div className="ai-empty">
                  <span className="ai-empty__icon" aria-hidden="true">
                    <IconSparkle width={22} height={22} />
                  </span>
                  <h3>AI analysis appears here</h3>
                  <p>
                    Fill in the title and description, then run the analysis to see the predicted category, suggested
                    priority and the reasoning behind both.
                  </p>
                  <ul className="ai-empty__list">
                    <li>Reads the complaint like a triage officer would</li>
                    <li>Explains which words shaped the decision</li>
                    <li>Never submits anything on your behalf</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="tips-card">
              <h3>What makes a strong report</h3>
              <ul>
                <li>Say what is broken, not just where.</li>
                <li>Mention who is affected — children, patients, commuters.</li>
                <li>Add a photo; it saves the crew a site visit.</li>
                <li>One issue per complaint keeps tracking clean.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
