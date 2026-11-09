import { useState, useEffect } from 'react';
import { Clock, ToggleRight, X, Plus, Trash2, Loader2 } from 'lucide-react';
import {
    fetchScheduledReports,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from '../../services/reportService';

const TYPE_COLORS = {
    Sales: 'bg-blue-100 text-blue-700',
    Inventory: 'bg-amber-100 text-amber-700',
    'Branch Performance': 'bg-violet-100 text-violet-700',
    'Business Summary': 'bg-emerald-100 text-emerald-700',
};

const REPORT_TYPES = ['Sales', 'Inventory', 'Branch Performance', 'Business Summary'];

const FREQUENCY_OPTIONS = [
    'Every day at 8:00 AM',
    'Every day at 8:00 PM',
    'Every Monday at 9:00 AM',
    'Every Friday at 6:00 PM',
    'First day of every month',
    'Every 3 months',
];

const EMPTY_FORM = { title: '', type: 'Sales', frequency: FREQUENCY_OPTIONS[0], active: true };

function ScheduledReports() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // ── Load from DB on mount ──────────────────────────────────
    useEffect(() => {
        loadSchedules();
    }, []);

    async function loadSchedules() {
        setLoading(true);
        const { data, source: src } = await fetchScheduledReports();
        setSchedules(Array.isArray(data) ? data : []);
        setSource(src);
        setLoading(false);
    }

    // ── Toggle active/inactive ─────────────────────────────────
    const handleToggle = async (item) => {
        const id = item._id || item.id;
        const isDbItem = !!item._id; // only DB items have _id

        // Optimistic UI update
        setSchedules((prev) =>
            prev.map((s) => ((s._id || s.id) === id ? { ...s, active: !s.active } : s))
        );

        if (isDbItem) {
            setTogglingId(id);
            const { error } = await updateSchedule(id, { active: !item.active });
            if (error) {
                // Revert on failure
                setSchedules((prev) =>
                    prev.map((s) => (s._id === id ? { ...s, active: item.active } : s))
                );
                console.error('Toggle failed:', error);
            }
            setTogglingId(null);
        }
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async (item) => {
        const id = item._id || item.id;
        const isDbItem = !!item._id;

        setSchedules((prev) => prev.filter((s) => (s._id || s.id) !== id));

        if (isDbItem) {
            setDeletingId(id);
            const { error } = await deleteSchedule(id);
            if (error) {
                // Revert — reload from backend
                loadSchedules();
                console.error('Delete failed:', error);
            }
            setDeletingId(null);
        }
    };

    // ── Add new schedule ───────────────────────────────────────
    const handleOpenModal = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setShowModal(true);
    };

    const handleCloseModal = () => !saving && setShowModal(false);

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (formError) setFormError('');
    };

    const handleSaveSchedule = async () => {
        if (!form.title.trim()) {
            setFormError('Schedule title is required.');
            return;
        }

        setSaving(true);
        const { data, error } = await createSchedule({
            title: form.title.trim(),
            type: form.type,
            frequency: form.frequency,
            active: form.active,
        });

        if (error) {
            // Fallback: add locally if backend is unavailable
            const localEntry = {
                id: `local-${Date.now()}`,
                title: form.title.trim(),
                type: form.type,
                frequency: form.frequency,
                nextRun: 'Scheduled',
                active: form.active,
            };
            setSchedules((prev) => [localEntry, ...prev]);
        } else {
            // Add the real DB document to the list
            setSchedules((prev) => [data, ...prev]);
        }

        setSaving(false);
        setShowModal(false);
    };

    // ── Helpers ────────────────────────────────────────────────
    const formatNextRun = (item) => {
        if (item.nextRun) return item.nextRun;
        return 'Scheduled';
    };

    return (
        <>
            <section
                className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                aria-label="Scheduled Reports"
            >
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                    <Clock size={16} className="text-blue-600" />
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-slate-800">Scheduled Reports</h2>
                        <p className="text-xs text-slate-500">Automated report generation schedule</p>
                    </div>
                    {source === 'database' && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
                            Live DB
                        </span>
                    )}
                    {source === 'api-sample' && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 ring-1 ring-amber-100">
                            Sample
                        </span>
                    )}
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-8 text-slate-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-xs">Loading schedules...</span>
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="px-5 py-8 text-center text-xs text-slate-400">
                            No schedules found. Click "+ Add New Schedule" to create one.
                        </div>
                    ) : (
                        schedules.map((item) => {
                            const id = item._id || item.id;
                            return (
                                <div
                                    key={id}
                                    className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/60"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {item.type}
                                            </span>
                                            {!item.active && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                    Paused
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">{item.frequency}</p>
                                        <p className="mt-0.5 text-xs font-medium text-blue-600">
                                            Next: {formatNextRun(item)}
                                        </p>
                                        {item.lastRun && (
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Last run: {new Date(item.lastRun).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Toggle */}
                                        <button
                                            title={item.active ? 'Pause schedule' : 'Enable schedule'}
                                            onClick={() => handleToggle(item)}
                                            disabled={togglingId === id}
                                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                                                item.active
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            } disabled:opacity-50`}
                                        >
                                            {togglingId === id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <ToggleRight size={13} />
                                            )}
                                            {item.active ? 'Active' : 'Paused'}
                                        </button>
                                        {/* Delete */}
                                        {item._id && (
                                            <button
                                                title="Delete schedule"
                                                onClick={() => handleDelete(item)}
                                                disabled={deletingId === id}
                                                className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition active:scale-95 disabled:opacity-50"
                                            >
                                                {deletingId === id ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={13} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-5 py-3">
                    <button
                        id="btn-add-schedule"
                        onClick={handleOpenModal}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform"
                    >
                        <Plus size={13} />
                        Add New Schedule
                    </button>
                </div>
            </section>

            {/* Add New Schedule Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="schedule-modal-title"
                >
                    <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-blue-600" />
                                <h3 id="schedule-modal-title" className="text-sm font-semibold text-slate-800">
                                    Add New Schedule
                                </h3>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Schedule Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="schedule-title-input"
                                    type="text"
                                    placeholder="e.g. Weekly Sales Summary"
                                    value={form.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                />
                                {formError && <p className="mt-1 text-xs text-red-500">{formError}</p>}
                            </div>

                            {/* Report Type */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Report Type
                                </label>
                                <select
                                    id="schedule-type-select"
                                    value={form.type}
                                    onChange={(e) => handleFormChange('type', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                                >
                                    {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Frequency */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Frequency
                                </label>
                                <select
                                    id="schedule-frequency-select"
                                    value={form.frequency}
                                    onChange={(e) => handleFormChange('frequency', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                                >
                                    {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Enable immediately toggle */}
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-700">Enable immediately</p>
                                    <p className="text-xs text-slate-400">Schedule will start running after saving</p>
                                </div>
                                <button
                                    id="schedule-active-toggle"
                                    onClick={() => handleFormChange('active', !form.active)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        form.active ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                                    aria-checked={form.active}
                                    role="switch"
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                            form.active ? 'translate-x-4' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* DB info note */}
                            <p className="text-xs text-slate-400 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                💾 This schedule will be saved to the database and a cron job will run it automatically.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button
                                id="schedule-cancel-btn"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                id="schedule-save-btn"
                                onClick={handleSaveSchedule}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition active:scale-95 shadow-sm disabled:opacity-60"
                            >
                                {saving ? (
                                    <><Loader2 size={12} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><Plus size={13} /> Save Schedule</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ScheduledReports;
