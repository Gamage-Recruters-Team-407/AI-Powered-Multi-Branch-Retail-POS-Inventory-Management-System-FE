/** Tailwind class tokens for Stock Transfer module (no separate CSS file). */

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const stPage =
  'flex flex-col gap-6 text-slate-800 animate-[stFadeIn_0.4s_ease-out]';

export const stGlass =
  'rounded-2xl border border-white/55 bg-white/70 shadow-lg backdrop-blur-xl';

export const stGlassHover = cn(
  stGlass,
  'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl',
);

export const stPanel = cn('px-6 py-[22px]', stGlassHover);

export const stIntro = cn(
  'px-[18px] py-3.5 text-sm leading-relaxed text-slate-700',
  stGlass,
);

export const stMetricsGrid =
  'grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]';

export const stMetricCard = cn('flex items-center gap-4 px-5 py-[18px]', stGlassHover);

export const stMetricIconBase =
  'flex size-12 shrink-0 items-center justify-center rounded-xl text-xl';

export const stMetricIcon = {
  blue: cn(stMetricIconBase, 'bg-blue-500/15 text-blue-600'),
  amber: cn(stMetricIconBase, 'bg-amber-500/15 text-amber-600'),
  green: cn(stMetricIconBase, 'bg-emerald-500/15 text-emerald-600'),
  violet: cn(stMetricIconBase, 'bg-violet-500/15 text-violet-600'),
};

export const stMetricLabel =
  'text-xs font-semibold uppercase tracking-wide text-slate-500';

export const stMetricValue = 'mt-0.5 text-[22px] font-extrabold leading-tight text-slate-900';

export const stHero = cn('flex flex-wrap items-start gap-5 px-6 py-[22px]', stGlassHover);

export const stHeroIcon =
  'flex size-[72px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-[32px] text-white shadow-lg shadow-blue-500/35';

export const stHeroTitle = 'mb-2 text-[1.65rem] font-extrabold text-slate-900';

export const stRoleBadge =
  'mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700';

export const stConnection = 'flex flex-wrap items-center gap-2 text-[13px] text-slate-600';

export const stConnectionDot = 'size-2 rounded-full bg-slate-400';

export const stConnectionDotLive =
  'size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]';

export const stChip =
  'rounded-lg border border-black/5 bg-white/65 px-2.5 py-0.5 text-xs';

export const stBtnPrimary = cn(
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-0 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-blue-500/35 transition-[transform,box-shadow] duration-150',
  'bg-gradient-to-br from-blue-500 to-blue-700 hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/45 disabled:cursor-not-allowed disabled:opacity-55',
);

export const stBtnGhost = cn(
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-black/10 bg-white/75 px-[18px] py-2.5 text-[13px] font-semibold text-slate-600 transition-[background,color] duration-150',
  'hover:bg-blue-500/10 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-55',
);

export const stBtnDanger = 'border-red-500/25 text-red-600 hover:bg-red-500/10 hover:text-red-700';

export const stAlertBase = cn(
  'flex items-start gap-3 rounded-xl px-[18px] py-3.5 text-[13px] leading-normal',
  stGlass,
);

export const stAlertWarn =
  'border border-amber-500/25 bg-amber-500/10 text-amber-900';

export const stAlertOk =
  'border border-emerald-500/20 bg-emerald-500/10 text-emerald-800';

export const stWorkflow = cn('overflow-hidden', stGlassHover);

export const stWorkflowHint = cn(
  'flex items-start gap-2.5 border-b border-blue-500/10 px-[18px] py-3.5 text-[13px] text-blue-900',
  'bg-gradient-to-br from-blue-500/10 to-indigo-500/5',
);

export const stWorkflowToggle =
  'flex w-full cursor-pointer items-center justify-between border-0 bg-white/35 px-[18px] py-3 text-[13px] font-semibold text-slate-600';

export const stWorkflowBody =
  'border-t border-black/5 px-5 py-4 text-[13px] text-slate-600';

export const stTabNav = cn('flex flex-wrap gap-2 p-2.5', stGlass);

export const stTabBtn =
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition-all duration-200 hover:bg-white/50 hover:text-slate-900';

export const stTabBtnActive =
  'bg-white/90 text-blue-600 shadow-md shadow-blue-500/15';

export const stTabContent = 'min-h-[300px]';

export const stPanelHeader = 'mb-5';

export const stPanelTitle = 'mb-1.5 text-[1.15rem] font-extrabold text-slate-900';

export const stPanelSubtitle = 'm-0 max-w-[640px] text-[13px] leading-normal text-slate-500';

export const stPipeline =
  'mb-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]';

export const stPipelineCard =
  'rounded-xl border border-white/60 bg-white/45 px-3 py-3.5 text-center';

export const stPipelineCardInner = {
  value: 'block text-2xl font-extrabold text-slate-900',
  label:
    'text-[11px] font-semibold uppercase tracking-wide text-slate-500',
};

export const stPipelinePending = cn(stPipelineCard, 'border-amber-500/35 bg-amber-100/35');
export const stPipelineApproved = cn(stPipelineCard, 'border-blue-500/35 bg-blue-100/35');
export const stPipelineTransit = cn(stPipelineCard, 'border-indigo-500/35 bg-indigo-100/35');
export const stPipelineRejected = cn(stPipelineCard, 'border-red-500/30 bg-red-100/35');

export const stTransferCards = 'flex flex-col gap-4';

export const stTransferCard = cn('rounded-[14px] p-5', stGlassHover);

export const stTransferCardPending = cn(
  stTransferCard,
  'border-amber-500/45 bg-amber-50/75',
);

export const stTransferCardApproved = cn(
  stTransferCard,
  'border-blue-500/45 bg-blue-50/75',
);

export const stStatusBase =
  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide';

export const stStatusTone = {
  pending: cn(stStatusBase, 'bg-amber-500/15 text-amber-700'),
  approved: cn(stStatusBase, 'bg-blue-500/15 text-blue-700'),
  intransit: cn(stStatusBase, 'bg-indigo-500/15 text-indigo-700'),
  completed: cn(stStatusBase, 'bg-emerald-500/15 text-emerald-800'),
  cancelled: cn(stStatusBase, 'bg-red-500/10 text-red-700'),
  rejected: cn(stStatusBase, 'bg-red-500/10 text-red-700'),
};

export function statusKey(status) {
  const key = String(status || '')
    .toLowerCase()
    .replace(/\s/g, '');
  if (key.includes('pending')) return 'pending';
  if (key.includes('approved')) return 'approved';
  if (key.includes('transit')) return 'intransit';
  if (key.includes('completed') || key.includes('received')) return 'completed';
  if (key.includes('cancel')) return 'cancelled';
  if (key.includes('reject')) return 'rejected';
  return 'pending';
}

export function statusBadgeClass(status) {
  return stStatusTone[statusKey(status)] ?? stStatusTone.pending;
}

export const stFilters = cn('mb-4 flex flex-wrap items-end gap-4 px-5 py-[18px]', stGlass);

export const stFieldLabel = 'flex min-w-40 flex-1 flex-col gap-1.5';

export const stFieldFull = 'col-span-full';

export const stFieldInput = cn(
  'rounded-lg border border-black/10 bg-white/75 px-3 py-2.5 text-[13px] text-slate-800',
  'focus:border-transparent focus:outline-2 focus:outline-blue-500',
);

export const stFieldLabelText =
  'text-[11px] font-bold uppercase tracking-wider text-slate-500';

export const stSearchWrap = 'min-w-[220px] flex-[2]';

export const stSearchInputWrap = 'relative w-full';

export const stSearchIcon =
  'pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm opacity-50';

export const stSearchInput = cn(stFieldInput, 'w-full pl-9 pr-9');

export const stSearchClearBtn =
  'absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800';

export const stTableWrap =
  'overflow-hidden rounded-xl border border-white/50 bg-white/40';

export const stTable = 'w-full border-collapse text-[13px]';

export const stTableTh =
  'border-b border-black/10 bg-white/35 px-3.5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500';

export const stTableTd = 'border-b border-black/5 px-3.5 py-3 text-slate-700';

export const stTableRowHover = 'transition-colors hover:bg-white/45';

export const stEmpty = cn(
  'rounded-[14px] border border-dashed border-black/10 bg-white/35 px-6 py-12 text-center',
);

export const stEmptyIcon = 'mb-3 text-5xl';

export const stEmptyTitle = 'mb-2 text-base font-bold text-slate-700';

export const stEmptyDesc =
  'mx-auto mb-5 max-w-[420px] text-[13px] leading-normal text-slate-500';

export const stFormGrid = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

export const stChartPanel = cn('mb-4 p-5', stGlassHover);

export const stChartTitle = 'mb-3 text-[15px] font-bold text-slate-900';

export const stChartArea =
  'h-[280px] rounded-xl border border-black/5 bg-white/40 p-2';

export const stReportsGrid =
  'grid gap-4 max-[900px]:grid-cols-1 [grid-template-columns:1.2fr_1fr]';

export const stStepper = 'flex flex-wrap justify-center gap-1 px-0 py-3';

export const stStep = 'relative min-w-[4.5rem] flex-1 text-center';

export const stStepDot =
  'mx-auto mb-1.5 grid size-8 place-items-center rounded-full bg-slate-400/35 text-xs font-bold text-slate-500';

export const stStepDotDone = cn(stStepDot, 'bg-emerald-500 text-white');

export const stStepDotCurrent = cn(
  stStepDot,
  'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]',
);

export const stStepLabel = 'text-[10px] font-semibold text-slate-500';

export const stCardActions =
  'mt-3.5 flex flex-wrap justify-end gap-2 border-t border-black/5 pt-3.5';

export const stRoutePill =
  'mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600';

export const stTransferId = 'font-mono text-[13px] font-bold text-blue-600';

export const stMetaText = 'text-[0.78rem] text-slate-500';

export const stProductMeta = 'mt-1 text-[0.82rem] text-slate-500';
