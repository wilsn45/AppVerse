import {useEffect, useMemo, useState} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileJson,
  FileText,
  LogOut,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import {auth, googleProvider} from './firebase/firebase';
import {
  deleteContent,
  importContent,
  listContent,
  updateContent,
  type AdminContentItem,
} from './services/contentService';

import {
  createInterest,
  listInterests,
  updateInterest,
  type AdminInterest,
} from './services/interestService';
import './App.css';

type Section = 'content' | 'interests' | 'analytics';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [error, setError] = useState('');

  const [section, setSection] = useState<Section>('content');

  const [search, setSearch] = useState('');
  const [interest, setInterest] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonMode, setJsonMode] = useState<'import' | 'edit'>('import');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [jsonSaving, setJsonSaving] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      void loadItems();
    }
  }, [user]);

  useEffect(() => {
    if (jsonOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [jsonOpen]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      setItems(await listContent());
    } catch (loadError) {
      console.error(loadError);
      setError(String(loadError));
    } finally {
      setLoading(false);
    }
  };

  const interests = useMemo(
    () =>
      [...new Set(
        items
          .map(item => item.interestTitle)
          .filter((value): value is string => Boolean(value)),
      )].sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();

    const filtered = items.filter(item => {
      const matchesSearch =
        !query ||
        String(item.id).toLowerCase().includes(query) ||
        String(item.hook ?? '').toLowerCase().includes(query);

      const matchesInterest = interest === 'all' || item.interestTitle === interest;

      let matchesDate = true;

      if (dateFilter !== 'all' && item.createdAt) {
        const created = new Date(item.createdAt).getTime();
        const age = now - created;

        if (dateFilter === 'today') {
          matchesDate = age <= 24 * 60 * 60 * 1000;
        }

        if (dateFilter === '7days') {
          matchesDate = age <= 7 * 24 * 60 * 60 * 1000;
        }

        if (dateFilter === '30days') {
          matchesDate = age <= 30 * 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesInterest && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.createdAt ?? 0).getTime();
      const bDate = new Date(b.createdAt ?? 0).getTime();

      return sort === 'oldest' ? aDate - bDate : bDate - aDate;
    });
  }, [items, search, interest, dateFilter, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, interest, dateFilter, sort, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / pageSize),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openImport = () => {
    setEditingContentId(null);
    setJsonMode('import');
    setJsonText('');
    setJsonError('');
    setParsedCount(null);
    setJsonOpen(true);
  };

  const openEditor = (item: AdminContentItem) => {
    setEditingContentId(item.id);
    setJsonMode('edit');

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...editable
    } = item;

    setJsonText(JSON.stringify(editable, null, 2));
    setJsonError('');
    setParsedCount(1);
    setJsonOpen(true);
  };

  const validateJson = () => {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      const values = Array.isArray(parsed) ? parsed : [parsed];

      if (values.length === 0) {
        throw new Error('JSON array cannot be empty.');
      }

      for (const value of values) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('Every content item must be a JSON object.');
        }

        if (!('hook' in value)) {
          throw new Error('Every content item requires "hook".');
        }

        if (!('interestTitle' in value)) {
          throw new Error('Every content item requires "interestTitle".');
        }

        if (!('format' in value)) {
          throw new Error('Every content item requires "format".');
        }
      }

      setJsonError('');
      setParsedCount(values.length);
    } catch (parseError) {
      setParsedCount(null);
      setJsonError(
        parseError instanceof Error ? parseError.message : 'Invalid JSON.',
      );
    }
  };

  const handleJsonSubmit = async () => {
    try {
      setJsonSaving(true);
      setJsonError('');

      const parsed: unknown = JSON.parse(jsonText);

      if (jsonMode === 'import') {
        const values = Array.isArray(parsed) ? parsed : [parsed];

        if (values.length === 0) {
          throw new Error('JSON array cannot be empty.');
        }

        const content = values.map(value => {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error('Every content item must be a JSON object.');
          }

          return value as Record<string, unknown>;
        });

        await importContent(content);
      } else {
        if (!editingContentId) {
          throw new Error('Unable to determine which content item is being edited.');
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Edited content must be a single JSON object.');
        }

        await updateContent(
          editingContentId,
          parsed as Record<string, unknown>,
        );
      }

      setJsonOpen(false);
      setEditingContentId(null);
      setJsonText('');
      setParsedCount(null);

      await loadItems();
    } catch (saveError) {
      console.error(saveError);
      setJsonError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save content.',
      );
    } finally {
      setJsonSaving(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    const confirmed = window.confirm(
      'Delete this content item? This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await deleteContent(id);
      await loadItems();
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete content.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      await signInWithPopup(auth, googleProvider);
    } catch (signInError) {
      setError(String(signInError));
    }
  };

  if (authLoading) {
    return <div className="center-screen">Loading Curio Admin…</div>;
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-mark large">
            <Brain size={34} />
          </div>
          <h1>Curio</h1>
          <p>Content Administration</p>

          <button
            className="primary-button login-button"
            onClick={handleSignIn}>
            Sign in with Google
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Brain size={27} />
          </div>

          <div>
            <div className="brand-name">Curio.</div>
            <div className="brand-subtitle">Admin</div>
          </div>
        </div>

        <nav className="nav">
          <NavButton
            active={section === 'content'}
            icon={<FileText size={21} />}
            label="Content"
            onClick={() => setSection('content')}
          />

          <NavButton
            active={section === 'interests'}
            icon={<Tag size={21} />}
            label="Interests"
            onClick={() => setSection('interests')}
          />

          <NavButton
            active={section === 'analytics'}
            icon={<BarChart3 size={21} />}
            label="Analytics"
            onClick={() => setSection('analytics')}
          />
        </nav>

        <div className="sidebar-bottom">
          <button
            className="signout-button"
            onClick={() => void signOut(auth)}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div />

          <div className="account">
            <div className="avatar">
              {(user.email?.[0] ?? 'C').toUpperCase()}
            </div>

            <span>{user.email}</span>
            <ChevronDown size={16} />
          </div>
        </header>

        {section === 'content' && (
          <ContentPage
            items={paginatedItems}
            totalItems={filteredItems.length}
            interests={interests}
            loading={loading}
            error={error}
            search={search}
            interest={interest}
            dateFilter={dateFilter}
            sort={sort}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            setSearch={setSearch}
            setInterest={setInterest}
            setDateFilter={setDateFilter}
            setSort={setSort}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
            onImport={openImport}
            onEdit={openEditor}
            onDelete={handleDeleteContent}
            onReload={loadItems}
          />
        )}

        {section === 'interests' && <InterestsPage />}

        {section === 'analytics' && <AnalyticsPage />}
      </main>

      {jsonOpen && (
        <JsonModal
          mode={jsonMode}
          jsonText={jsonText}
          jsonError={jsonError}
          parsedCount={parsedCount}
          setJsonText={value => {
            setJsonText(value);
            setJsonError('');
            setParsedCount(null);
          }}
          onValidate={validateJson}
          onSubmit={handleJsonSubmit}
          saving={jsonSaving}
          onClose={() => {
            if (!jsonSaving) {
              setJsonOpen(false);
              setEditingContentId(null);
            }
          }}
        />
      )}
    </div>
  );
}

interface ContentPageProps {
  items: AdminContentItem[];
  totalItems: number;
  interests: string[];
  loading: boolean;
  error: string;
  search: string;
  interest: string;
  dateFilter: string;
  sort: string;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  setSearch: (value: string) => void;
  setInterest: (value: string) => void;
  setDateFilter: (value: string) => void;
  setSort: (value: string) => void;
  setPageSize: (value: number) => void;
  setCurrentPage: (value: number) => void;
  onImport: () => void;
  onEdit: (item: AdminContentItem) => void;
  onDelete: (id: string) => void;
  onReload: () => Promise<void>;
}

function ContentPage({
  items,
  totalItems,
  interests,
  loading,
  error,
  search,
  interest,
  dateFilter,
  sort,
  pageSize,
  currentPage,
  totalPages,
  setSearch,
  setInterest,
  setDateFilter,
  setSort,
  setPageSize,
  setCurrentPage,
  onImport,
  onEdit,
  onDelete,
  onReload,
}: ContentPageProps) {
  return (
    <div className="page">
      <div className="page-heading simple-heading">
        <div>
          <h1>Content</h1>
          <p>Manage the content shown in the Curio feed.</p>
        </div>

        <button className="primary-button" onClick={onImport}>
          <Upload size={19} />
          Import Content from JSON
        </button>
      </div>

      <section className="filters content-filters">
        <div className="search-box">
          <Search size={19} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search content ID or text..."
          />
        </div>

        <select
          value={interest}
          onChange={event => setInterest(event.target.value)}>
          <option value="all">All Interests</option>
          {interests.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <div className="select-with-icon">
          <CalendarDays size={17} />
          <select
            value={dateFilter}
            onChange={event => setDateFilter(event.target.value)}>
            <option value="all">Any Date</option>
            <option value="today">Added Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        <select
          value={sort}
          onChange={event => setSort(event.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </section>

      <section className="content-panel list-panel">
        {loading ? (
          <div className="empty-state">
            <h2>Loading content…</h2>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>Couldn't load content</h2>
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={() => void onReload()}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="content-table-wrap">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Content ID</th>
                  <th>Text</th>
                  <th>Status</th>
                  <th>Image Link</th>
                  <th className="actions-heading">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        No content found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <code className="id-code">{item.id}</code>
                      </td>

                      <td className="hook-cell">
                        {item.hook ?? '—'}
                      </td>

                      <td>
                        <span className={`status-pill ${item.status ?? ''}`}>
                          {item.status ?? 'unknown'}
                        </span>
                      </td>

                      <td>
                        {getImageUrl(item) ? (
                          <a
                            className="image-link"
                            href={getImageUrl(item)}
                            target="_blank"
                            rel="noreferrer">
                            View image
                          </a>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button edit"
                            title="Edit content"
                            onClick={() => onEdit(item)}>
                            <Pencil size={17} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete content"
                            onClick={() => onDelete(item.id)}>
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="pagination-bar">
        <div className="pagination-summary">
          <span>Rows per page</span>

          <select
            value={pageSize}
            onChange={event => setPageSize(Number(event.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <span className="result-count">
            {totalItems === 0
              ? '0 items'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  totalItems,
                )} of ${totalItems}`}
          </span>
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>

          {Array.from(
            {length: totalPages},
            (_, index) => index + 1,
          )
            .filter(page => {
              if (totalPages <= 5) {
                return true;
              }

              if (currentPage <= 3) {
                return page <= 5;
              }

              if (currentPage >= totalPages - 2) {
                return page >= totalPages - 4;
              }

              return Math.abs(page - currentPage) <= 2;
            })
            .map(page => (
              <button
                key={page}
                className={`pagination-button page-number ${
                  page === currentPage ? 'active' : ''
                }`}
                onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}

          <button
            className="pagination-button"
            disabled={currentPage === totalPages || totalItems === 0}
            onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function InterestsPage() {
  const [interests, setInterests] = useState<AdminInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestError, setInterestError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] =
    useState<AdminInterest | null>(null);
  const [title, setTitle] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInterests = async () => {
    try {
      setLoading(true);
      setInterestError('');
      setInterests(await listInterests());
    } catch (loadError) {
      console.error(loadError);
      setInterestError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load interests.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInterests();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [modalOpen]);

  const openAddInterest = () => {
    setEditingInterest(null);
    setTitle('');
    setIconUrl('');
    setInterestError('');
    setModalOpen(true);
  };

  const openEditInterest = (interest: AdminInterest) => {
    setEditingInterest(interest);
    setTitle(interest.title ?? '');
    setIconUrl(interest.iconUrl ?? '');
    setInterestError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingInterest(null);
    setInterestError('');
  };

  const handleSaveInterest = async () => {
    const cleanTitle = title.trim();
    const cleanIconUrl = iconUrl.trim();

    if (!cleanTitle) {
      setInterestError('Title is required.');
      return;
    }

    try {
      setSaving(true);
      setInterestError('');

      if (editingInterest) {
        await updateInterest(
          editingInterest.id,
          cleanTitle,
          cleanIconUrl || undefined,
        );
      } else {
        await createInterest(
          cleanTitle,
          cleanIconUrl || undefined,
        );
      }

      setModalOpen(false);
      setEditingInterest(null);
      await loadInterests();
    } catch (saveError) {
      console.error(saveError);
      setInterestError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save interest.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading simple-heading">
        <div>
          <h1>Interests</h1>
          <p>Manage the interests available to Curio content.</p>
        </div>

        <button
          className="primary-button"
          onClick={openAddInterest}>
          <Plus size={19} />
          Add Interest
        </button>
      </div>

      {interestError && !modalOpen && (
        <div className="error-box">{interestError}</div>
      )}

      <section className="content-panel list-panel">
        <div className="content-table-wrap">
          <table className="content-table">
            <thead>
              <tr>
                <th>Interest ID</th>
                <th>Title</th>
                <th>Icon Link</th>
                <th className="actions-heading">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      Loading interests…
                    </div>
                  </td>
                </tr>
              ) : interests.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      No interests yet. Add your first Curio interest.
                    </div>
                  </td>
                </tr>
              ) : (
                interests.map(interest => (
                  <tr key={interest.id}>
                    <td>
                      <span className="content-id">
                        {interest.id}
                      </span>
                    </td>

                    <td>
                      <strong>{interest.title}</strong>
                    </td>

                    <td>
                      {interest.iconUrl ? (
                        <a
                          href={interest.iconUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="image-link">
                          View icon
                        </a>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Edit interest"
                          onClick={() =>
                            openEditInterest(interest)
                          }>
                          <Pencil size={17} />
                        </button>

                        <button
                          className="icon-button delete"
                          title="Interest deletion is disabled"
                          disabled>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="danger-note">
        <Trash2 size={18} />
        Interest deletion is disabled to prevent existing content references
        from becoming invalid.
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal topic-modal">
            <button
              className="modal-close"
              onClick={closeModal}
              disabled={saving}>
              <X size={20} />
            </button>

            <div className="modal-icon">
              <Tag size={25} />
            </div>

            <h2>
              {editingInterest ? 'Edit Interest' : 'Add Interest'}
            </h2>

            <p>
              {editingInterest
                ? 'Update this Curio interest.'
                : 'Create an interest that can be assigned to Curio content.'}
            </p>

            <div className="topic-form">
              <label>
                Title
                <input
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  placeholder="e.g. Space"
                  autoFocus
                />
              </label>

              <label>
                Icon Link{' '}
                <span className="optional-label">(optional)</span>
                <input
                  value={iconUrl}
                  onChange={event => setIconUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>

            {interestError && (
              <div className="json-error">
                {interestError}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={closeModal}
                disabled={saving}>
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={() => void handleSaveInterest()}
                disabled={saving || !title.trim()}>
                {saving
                  ? 'Saving…'
                  : editingInterest
                    ? 'Save Changes'
                    : 'Add Interest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="page">
      <div className="page-heading simple-heading">
        <div>
          <h1>Analytics</h1>
          <p>Curio content performance will live here later.</p>
        </div>
      </div>

      <section className="content-panel">
        <div className="empty-state">
          <BarChart3 size={40} />
          <h2>Analytics coming later</h2>
          <p>
            We'll keep this section empty until the feed analytics model is
            ready.
          </p>
        </div>
      </section>
    </div>
  );
}

interface JsonModalProps {
  mode: 'import' | 'edit';
  jsonText: string;
  jsonError: string;
  parsedCount: number | null;
  setJsonText: (value: string) => void;
  onValidate: () => void;
  onSubmit: () => void;
  saving: boolean;
  onClose: () => void;
}

function JsonModal({
  mode,
  jsonText,
  jsonError,
  parsedCount,
  setJsonText,
  onValidate,
  onSubmit,
  saving,
  onClose,
}: JsonModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal json-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-icon">
          <FileJson size={25} />
        </div>

        <h2>{mode === 'edit' ? 'Edit Content' : 'Import Content'}</h2>

        <p>
          {mode === 'edit'
            ? 'Edit the JSON representation of this content item.'
            : 'Paste one content object or an array of Curio content objects.'}
        </p>

        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={event => setJsonText(event.target.value)}
          placeholder={`[
  {
    "interestTitle": "Space",
    "format": "microFact",
    "origin": "evergreen",
    "hook": "A day on Venus is longer than its year.",
    "status": "published",
    "qualityScore": 90
  }
]`}
        />

        {jsonError && (
          <div className="json-error">
            {jsonError}
          </div>
        )}

        {parsedCount !== null && (
          <div className="json-success">
            <CheckCircle2 size={18} />
            Valid JSON
          </div>
        )}

        <div className="modal-actions">
          <button className="secondary-button" onClick={onValidate}>
            Validate JSON
          </button>

          <button
            className="primary-button"
            disabled={parsedCount === null || saving}
            onClick={onSubmit}>
            {saving
              ? mode === 'edit'
                ? 'Saving…'
                : 'Importing…'
              : mode === 'edit'
                ? 'Save Changes'
                : 'Import Content'}
          </button>
        </div>

      </div>
    </div>
  );
}

function getImageUrl(item: AdminContentItem): string | undefined {
  const visual = item.visual;

  if (
    typeof visual === 'object' &&
    visual !== null &&
    'url' in visual &&
    typeof visual.url === 'string'
  ) {
    return visual.url;
  }

  return undefined;
}

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: NavButtonProps) {
  return (
    <button
      className={`nav-button ${active ? 'active' : ''}`}
      onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

export default App;
