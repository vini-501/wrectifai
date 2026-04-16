'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { SessionGuard } from '@/components/auth/session-guard';
import { UserSidebar, UserSidebarMobile } from '@/components/dashboard/user-sidebar';
import { UserTopLogoHeader } from '@/components/dashboard/user-top-logo-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  type IssueRequestListItem,
  type UserQuotesBookingsContent,
  type UserSidebarContent,
  fetchIssueRequests,
  raiseIssueToGarage,
} from '@/lib/api';

type Props = {
  sidebar: UserSidebarContent;
  content: UserQuotesBookingsContent;
};

type ViewMode = 'grid' | 'list';
type SortOption = 'date_desc' | 'date_asc' | 'quotes_desc' | 'quotes_asc' | 'issue_asc' | 'issue_desc';
type PathFilter = 'all' | 'diy' | 'garage';

function formatIssueDate(value: string | Date | undefined, index: number) {
  const fallback = new Date(Date.now() - index * 24 * 60 * 60 * 1000);
  const parsed = value ? new Date(value) : fallback;
  return parsed.toLocaleDateString('en-US');
}

function inferSeverity(issue: IssueRequestListItem, index: number): 'high' | 'medium' | 'low' {
  const raw = (issue.severity ?? '').toLowerCase();
  if (raw.includes('not_starting') || raw.includes('critical') || raw.includes('high')) return 'high';
  if (raw.includes('risky') || raw.includes('medium')) return 'medium';
  if (raw.includes('can_drive') || raw.includes('low')) return 'low';

  if (issue.summary.toLowerCase().includes('brake') || issue.summary.toLowerCase().includes('engine')) return 'high';
  if (issue.summary.toLowerCase().includes('noise') || issue.summary.toLowerCase().includes('knock')) return 'medium';
  return index % 3 === 0 ? 'high' : index % 3 === 1 ? 'low' : 'medium';
}

function inferSource(issue: IssueRequestListItem, index: number): 'diagnosis' | 'direct' {
  if (issue.source === 'diagnosis' || issue.source === 'direct') return issue.source;
  return index % 2 === 0 ? 'diagnosis' : 'direct';
}

function normalizeStatus(issue: IssueRequestListItem) {
  if (issue.status?.toLowerCase() === 'quote_accepted') return 'QUOTE ACCEPTED';
  if ((issue.quoteCount ?? 0) > 0) return 'QUOTED';
  if (!issue.status) return 'OPEN';
  return issue.status.replace(/_/g, ' ').toUpperCase();
}

function severityClass(severity: 'high' | 'medium' | 'low') {
  if (severity === 'high') return 'border-red-200 bg-red-50 text-red-600';
  if (severity === 'low') return 'border-emerald-200 bg-emerald-50 text-emerald-600';
  return 'border-amber-200 bg-amber-50 text-amber-600';
}

function resolveVehicleLabel(issue: IssueRequestListItem) {
  const trimmed = issue.vehicleLabel?.trim();
  if (trimmed) return trimmed;
  return 'Vehicle details unavailable';
}

function issueTimestamp(issue: IssueRequestListItem) {
  const ts = issue.createdAt ? new Date(issue.createdAt).getTime() : NaN;
  if (!Number.isNaN(ts)) return ts;
  return 0;
}

export function QuotesBookingsClient({ sidebar, content: _initialContent }: Props) {
  void _initialContent;
  const router = useRouter();
  const [requests, setRequests] = useState<IssueRequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingIssueId, setMovingIssueId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedPath, setSelectedPath] = useState<PathFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const issues = await fetchIssueRequests();
        setRequests(issues);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load quotes');
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  const totalQuotes = useMemo(
    () => requests.reduce((acc, req) => acc + (req.quoteCount ?? 0), 0),
    [requests]
  );

  const pendingAiVerification = useMemo(
    () =>
      requests.filter((issue, index) => inferSource(issue, index) === 'diagnosis' && normalizeStatus(issue) === 'OPEN')
        .length,
    [requests]
  );

  const savingsToDate = useMemo(() => 0, []);

  const vehicleOptions = useMemo(() => {
    const uniqueVehicles = new Set<string>();
    requests.forEach((req) => {
      uniqueVehicles.add(resolveVehicleLabel(req));
    });
    return Array.from(uniqueVehicles).sort((a, b) => a.localeCompare(b));
  }, [requests]);

  const searchedRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((req) => {
      const vehicleMatch = resolveVehicleLabel(req).toLowerCase().includes(term);
      return req.summary.toLowerCase().includes(term) || vehicleMatch;
    });
  }, [requests, search]);

  const filteredRequests = useMemo(() => {
    const pathFiltered =
      selectedPath === 'all'
        ? searchedRequests
        : searchedRequests.filter((req) => classifyPath(req) === selectedPath);

    const vehicleFiltered =
      selectedVehicle === 'all'
        ? pathFiltered
        : pathFiltered.filter((req) => resolveVehicleLabel(req) === selectedVehicle);

    const sorted = [...vehicleFiltered];
    if (sortOption === 'date_desc') {
      sorted.sort((a, b) => issueTimestamp(b) - issueTimestamp(a));
    } else if (sortOption === 'date_asc') {
      sorted.sort((a, b) => issueTimestamp(a) - issueTimestamp(b));
    } else if (sortOption === 'quotes_desc') {
      sorted.sort((a, b) => (b.quoteCount ?? 0) - (a.quoteCount ?? 0));
    } else if (sortOption === 'quotes_asc') {
      sorted.sort((a, b) => (a.quoteCount ?? 0) - (b.quoteCount ?? 0));
    } else if (sortOption === 'issue_asc') {
      sorted.sort((a, b) => a.summary.localeCompare(b.summary));
    } else {
      sorted.sort((a, b) => b.summary.localeCompare(a.summary));
    }
    return sorted;
  }, [searchedRequests, selectedPath, selectedVehicle, sortOption]);

  function classifyPath(issue: IssueRequestListItem): 'diy' | 'garage' {
    const status = (issue.status ?? '').toLowerCase();
    if (status === 'quotes_pending' || status === 'quote_accepted') return 'garage';
    if ((issue.quoteCount ?? 0) > 0) return 'garage';
    if (issue.source === 'direct') return 'garage';
    return 'diy';
  }

  async function handleMoveToQuotes(issueId: string) {
    try {
      setMovingIssueId(issueId);
      setError(null);
      await raiseIssueToGarage(issueId);
      setRequests((prev) =>
        prev.map((item) => (item.id === issueId ? { ...item, status: 'quotes_pending' } : item))
      );
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Failed to move issue to quotes');
    } finally {
      setMovingIssueId(null);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SessionGuard requiredRole="user" />
      <UserSidebarMobile activeItem="quotes-bookings" content={sidebar} />
      <div className="hidden lg:block">
        <UserSidebar activeItem="quotes-bookings" content={sidebar} />
      </div>

      <section className="flex-1 overflow-y-auto bg-[#f1f3f8]">
        <div className="mx-auto max-w-5xl p-6 md:p-8">
          <UserTopLogoHeader sidebar={sidebar} />

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-slate-900">Service Quotes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and compare garage offers for your vehicle repairs.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-[#d9e2ef] bg-white shadow-none">
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8599b8]">Active Requests</p>
                <p className="mt-2 text-2xl sm:text-3xl leading-none font-bold text-[#2456f5]">{requests.length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-[#d9e2ef] bg-white shadow-none">
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8599b8]">Total Quotes</p>
                <p className="mt-2 text-2xl sm:text-3xl leading-none font-bold text-[#039167]">{totalQuotes}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-[#d9e2ef] bg-white shadow-none">
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8599b8]">Pending AI Verification</p>
                <p className="mt-2 text-2xl sm:text-3xl leading-none font-bold text-[#cb7a00]">{pendingAiVerification}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-[#d9e2ef] bg-white shadow-none">
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8599b8]">Savings To Date</p>
                <p className="mt-2 text-2xl sm:text-3xl leading-none font-bold text-[#0f2547]">${savingsToDate}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#d9e2ef] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-transparent px-3 py-2">
              <Search className="h-5 w-5 text-[#b7c3d6]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-[#2b4368] outline-none placeholder:text-[#bcc7d8]"
                placeholder="Search by issue or vehicle..."
              />
            </label>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl bg-[#f4f7fc] px-3 text-sm font-semibold text-[#2c4468] hover:bg-[#ecf1f8] sm:h-11 sm:px-4"
                onClick={() => {
                  setIsFilterOpen((prev) => !prev);
                  setIsSortOpen(false);
                }}
              >
                <TriangleAlert className="mr-1.5 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl bg-[#f4f7fc] px-3 text-sm font-semibold text-[#2c4468] hover:bg-[#ecf1f8] sm:h-11 sm:px-4"
                onClick={() => {
                  setIsSortOpen((prev) => !prev);
                  setIsFilterOpen(false);
                }}
              >
                <SlidersHorizontal className="mr-1.5 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort</span>
              </Button>

              <div className="mx-1 h-8 w-px bg-[#dce3ef] hidden sm:block" />

              <div className="flex rounded-2xl bg-[#f4f7fc] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl px-2.5 py-2 ${viewMode === 'grid' ? 'bg-white text-[#2456f5] shadow-sm' : 'text-[#8ca0bb]'}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl px-2.5 py-2 ${viewMode === 'list' ? 'bg-white text-[#2456f5] shadow-sm' : 'text-[#8ca0bb]'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {isFilterOpen ? (
            <div className="mt-3 rounded-2xl border border-[#d9e2ef] bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-[#2c4468]">Filter by Type</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: 'All', value: 'all' as PathFilter },
                  { label: 'DIY', value: 'diy' as PathFilter },
                  { label: 'Garage', value: 'garage' as PathFilter },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedPath(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      selectedPath === option.value
                        ? 'border-[#2456f5] bg-[#edf3ff] text-[#2456f5]'
                        : 'border-[#d9e2ef] bg-white text-[#2c4468]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-sm font-semibold text-[#2c4468]">Filter by Vehicle</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVehicle('all')}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    selectedVehicle === 'all'
                      ? 'border-[#2456f5] bg-[#edf3ff] text-[#2456f5]'
                      : 'border-[#d9e2ef] bg-white text-[#2c4468]'
                  }`}
                >
                  All Vehicles
                </button>
                {vehicleOptions.map((vehicleName) => (
                  <button
                    key={vehicleName}
                    type="button"
                    onClick={() => setSelectedVehicle(vehicleName)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      selectedVehicle === vehicleName
                        ? 'border-[#2456f5] bg-[#edf3ff] text-[#2456f5]'
                        : 'border-[#d9e2ef] bg-white text-[#2c4468]'
                    }`}
                  >
                    {vehicleName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isSortOpen ? (
            <div className="mt-3 rounded-2xl border border-[#d9e2ef] bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-[#2c4468]">Sort Issues</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {[
                  { label: 'Newest First', value: 'date_desc' as SortOption },
                  { label: 'Oldest First', value: 'date_asc' as SortOption },
                  { label: 'Most Quotes', value: 'quotes_desc' as SortOption },
                  { label: 'Least Quotes', value: 'quotes_asc' as SortOption },
                  { label: 'Issue A-Z', value: 'issue_asc' as SortOption },
                  { label: 'Issue Z-A', value: 'issue_desc' as SortOption },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortOption(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      sortOption === option.value
                        ? 'border-[#2456f5] bg-[#edf3ff] text-[#2456f5]'
                        : 'border-[#d9e2ef] bg-white text-[#2c4468]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-5 text-sm font-medium text-destructive">{error}</p> : null}

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center">
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#cfd8e8] border-t-[#2456f5]" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#d9e2ef] bg-white p-6 sm:p-8 text-center text-[#6c809e]">
              No quote requests found.
            </div>
          ) : (
            <div
              className={`mt-6 ${
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-2'
                  : 'flex flex-col gap-4'
              }`}
            >
              {filteredRequests.map((issue, index) => {
                const severity = inferSeverity(issue, index);
                const source = inferSource(issue, index);
                const vehicleLabel = resolveVehicleLabel(issue);
                const status = normalizeStatus(issue);
                const pathType = classifyPath(issue);
                const isDiy = pathType === 'diy';

                return (
                  <Card
                    key={issue.id}
                    className="cursor-pointer rounded-2xl border-[#d9e2ef] bg-white shadow-none transition-all duration-200 hover:shadow-[0_8px_22px_rgba(33,61,105,0.08)]"
                    onClick={() => router.push(`/user/quotes-bookings/${issue.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        router.push(`/user/quotes-bookings/${issue.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open quotes for ${issue.summary}`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none sm:px-3 sm:py-1 sm:text-xs ${severityClass(severity)}`}>
                            <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {severity.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe0ff] bg-[#edf3ff] px-2 py-0.5 text-[10px] font-semibold leading-none text-[#2456f5] sm:px-3 sm:py-1 sm:text-xs">
                            {source === 'diagnosis' ? <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                            <span className="hidden sm:inline">{source === 'diagnosis' ? 'AI Diagnosis' : 'Direct Request'}</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none sm:px-3 sm:py-1 sm:text-xs ${
                              isDiy
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-[#bad5fb] bg-[#f4f8ff] text-[#0f62d6]'
                            }`}
                          >
                            {isDiy ? 'DIY' : 'Garage'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#9aacc7] sm:text-sm">{formatIssueDate(issue.createdAt, index)}</p>
                      </div>

                      <h3 className="mt-4 line-clamp-2 text-base font-bold text-slate-900 sm:mt-5 sm:text-xl">
                        {issue.summary}
                      </h3>
                      <p className="mt-1.5 text-sm text-[#47688f] sm:mt-2 sm:text-base">{vehicleLabel}</p>

                      <div className="my-4 h-px bg-[#e6ebf3] sm:my-5" />

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#95a8c2] sm:text-[11px]">Quotes</p>
                            <p className="text-base font-bold text-[#2456f5] sm:text-lg">{issue.quoteCount} Received</p>
                          </div>
                          <div className="h-8 w-px bg-[#e2e8f3] sm:h-10" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#95a8c2] sm:text-[11px]">Status</p>
                            <p className="text-base font-bold text-[#1f3659] sm:text-lg">{status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDiy ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-lg border-[#bad5fb] px-3 text-xs text-[#0f62d6] hover:bg-[#f4f8ff] sm:h-9 sm:px-4 sm:text-sm"
                              disabled={movingIssueId === issue.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveToQuotes(issue.id);
                              }}
                            >
                              {movingIssueId === issue.id ? 'Moving...' : 'Move to Quotes'}
                            </Button>
                          ) : null}
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6fb] text-[#8da0ba] transition-colors hover:bg-[#edf2fa] sm:h-10 sm:w-10"
                            aria-hidden="true"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
