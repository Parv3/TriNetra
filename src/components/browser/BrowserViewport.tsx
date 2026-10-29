import { logIntegrityEvent } from '@/services/api/realApi';
import { useProctorStore } from '@/stores/proctorStore';
import { useAuthStore } from '@/stores/authStore';
import React, { useState } from 'react';
import { BrowserTab, useBrowserStore } from '@/stores/browserStore';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Search,
  ExternalLink,
  ShieldAlert,
  Globe,
  CornerDownLeft,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Props {
  tab: BrowserTab;
}

export const BrowserViewport: React.FC<Props> = ({ tab }) => {
  const { navigateTab, searchInTab, returnToTest } = useBrowserStore();
  const { reportViolation } = useProctorStore();
  const { session } = useAuthStore();
  const [urlInput, setUrlInput] = useState(tab.url);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateTab(tab.id, urlInput.trim());
      if (isAiTool) {
        reportViolation('AI_TOOL_ACCESSED', `Opened prohibited AI domain: ${tab.domain}`, false);
      }
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchInTab(tab.id, searchQuery.trim());
      const sId = session?.sessionId || localStorage.getItem('spb_session_id') || 'active_session';
      logIntegrityEvent(sId, 'EXTERNAL_QUERY_SUBMITTED', { query: searchQuery.trim(), domain: tab.domain });
      setUrlInput(`https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isAiTool = tab.category === 'AI_TOOL';

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden select-text">
      {/* Browser Navigation Toolbar */}
      <div className="h-12 bg-card border-b border-border px-4 flex items-center gap-3 shrink-0">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground disabled:opacity-40"
            disabled={tab.historyIndex <= 0}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground disabled:opacity-40"
            disabled={tab.historyIndex >= tab.history.length - 1}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground"
            onClick={() => navigateTab(tab.id, tab.url)}
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address & Search Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center max-w-3xl">
          <div className="relative w-full flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              {isAiTool ? (
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter web address..."
              className="w-full pl-9 pr-24 py-1.5 bg-muted/60 border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
              {isAiTool ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30">
                  AI TOOL FLAGGED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  SECURE
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Return to Test Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={returnToTest}
          className="gap-1.5 bg-gradient-trinetra text-white border-0 font-semibold shadow-xs"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          Back to Test [Esc]
        </Button>
      </div>

      {/* Bookmarks & Quick Navigation Strip */}
      <div className="h-8 bg-muted/30 border-b border-border/60 px-4 flex items-center gap-4 text-[11px] overflow-x-auto shrink-0">
        <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
          Permitted Reference:
        </span>
        <button
          onClick={() => {
            setUrlInput('https://en.wikipedia.org');
            navigateTab(tab.id, 'https://en.wikipedia.org');
          }}
          className="hover:text-primary font-medium transition-colors flex items-center gap-1"
        >
          <Globe className="w-3 h-3 text-cyan-500" /> Wikipedia
        </button>
        <button
          onClick={() => {
            setUrlInput('https://developer.mozilla.org');
            navigateTab(tab.id, 'https://developer.mozilla.org');
          }}
          className="hover:text-primary font-medium transition-colors"
        >
          MDN Web Docs
        </button>
        <button
          onClick={() => {
            setUrlInput('https://stackoverflow.com');
            navigateTab(tab.id, 'https://stackoverflow.com');
          }}
          className="hover:text-primary font-medium transition-colors"
        >
          Stack Overflow
        </button>

        <span className="text-border">|</span>

        {/* Demo AI tool buttons to test proctor detection */}
        <span className="text-rose-500 font-semibold text-[10px] uppercase tracking-wider">
          Prohibited Tools (Audited):
        </span>
        <button
          onClick={() => {
            setUrlInput('https://chatgpt.com');
            navigateTab(tab.id, 'https://chatgpt.com');
          }}
          className="text-rose-500 hover:underline font-semibold flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" /> ChatGPT
        </button>
        <button
          onClick={() => {
            setUrlInput('https://claude.ai');
            navigateTab(tab.id, 'https://claude.ai');
          }}
          className="text-rose-500 hover:underline font-semibold flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" /> Claude.ai
        </button>
      </div>

      {/* Persistent Security Audit Notification Banner */}
      <div
        className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
          isAiTool
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-800 dark:text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {isAiTool ? (
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
          )}
          <span className="font-medium">
            {isAiTool
              ? 'VIOLATION ALERT: AI tool domain detected. Search queries and active window focus are logged to the examiner panel.'
              : 'Trinetra In-App Smart Browser Active. Every opened domain, dwell duration, and search parameter is recorded transparently.'}
          </span>
        </div>

        <span className="text-[11px] font-mono opacity-80">Telemetry ID: #AUDIT-{(tab.id || '').slice(-6)}</span>
      </div>

      {/* Simulated Webpage Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
        {isAiTool ? (
          /* Warning Screen for AI Tools */
          <div className="p-8 rounded-2xl bg-rose-500/5 border-2 border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading text-rose-600 dark:text-rose-400">
              Restricted AI Model Domain: {tab.domain}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trinetra proctoring policy strictly forbids solving examination questions with generative AI agents. Your visit to this domain has been added to the continuous audit ledger.
            </p>
            <div className="p-3 bg-card border border-border rounded-xl text-left text-xs font-mono space-y-1">
              <div className="text-muted-foreground">Domain: <span className="text-foreground">{tab.domain}</span></div>
              <div className="text-muted-foreground">Status: <span className="text-rose-500 font-bold">FLAGGED_VIOLATION</span></div>
              <div className="text-muted-foreground">Action: <span className="text-foreground">Incident logged with proctor</span></div>
            </div>
            <Button variant="primary" onClick={returnToTest} className="gap-2 bg-gradient-trinetra border-0">
              <CornerDownLeft className="w-4 h-4" /> Return to Examination Window
            </Button>
          </div>
        ) : (
          /* Normal Web Reference Content Simulation */
          <div className="space-y-6">
            {/* Search query box on page */}
            <form onSubmit={handleQuickSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${tab.domain} or web documentation...`}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" variant="secondary" size="md">Search</Button>
            </form>

            {/* Document Header */}
            <div className="pb-4 border-b border-border space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Reference Material
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                {tab.title}
              </h1>
              <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                {tab.url}
              </p>
            </div>

            {/* Article Content Simulation */}
            <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-sans">
              <p>
                In computational complexity theory, time complexity represents the amount of computer time it takes to run an algorithm. Time complexity is commonly estimated by counting the number of elementary operations performed by the algorithm.
              </p>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <h3 className="font-semibold text-foreground text-sm">Key Algorithmic Complexities</h3>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  <li><strong>O(1)</strong> — Constant time (e.g. Hash Table average lookup).</li>
                  <li><strong>O(log N)</strong> — Logarithmic time (e.g. Binary search on sorted arrays).</li>
                  <li><strong>O(N)</strong> — Linear time (e.g. Single pass array traversal).</li>
                  <li><strong>O(N log N)</strong> — Linearithmic time (e.g. Merge Sort, Heap Sort).</li>
                  <li><strong>O(N²)</strong> — Quadratic time (e.g. Traditional full self-attention matrix computation in Transformers).</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                (Note: This interactive browser view allows students to research definitions freely during the test while preventing automated LLM proxy solving).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

