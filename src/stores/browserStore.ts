import { create } from 'zustand';
import { ActivityLogItem } from '@/types/api';
import { PROCTORING_CONFIG } from '@/config/proctoring.config';
import { useProctorStore } from '@/stores/proctorStore';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: 'AI_TOOL' | 'SEARCH' | 'OTHER';
  timeOpened: number;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
}

interface BrowserState {
  tabs: BrowserTab[];
  activeTabId: string; // 'test' or tab id
  isActivityTrackerOpen: boolean;
  activityLog: ActivityLogItem[];
  aiPolicy: 'RESTRICTED_AND_LOGGED' | 'BLOCKED' | 'FLAG_VIOLATION';

  openNewTab: (url?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  navigateTab: (tabId: string, inputUrl: string) => void;
  searchInTab: (tabId: string, query: string) => void;
  toggleActivityTracker: () => void;
  returnToTest: () => void;
}

const getDomain = (url: string) => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getCategory = (domain: string): 'AI_TOOL' | 'SEARCH' | 'OTHER' => {
  if (PROCTORING_CONFIG.restrictedDomains.some((d) => domain.includes(d))) {
    return 'AI_TOOL';
  }
  if (domain.includes('google') || domain.includes('bing') || domain.includes('duckduckgo')) {
    return 'SEARCH';
  }
  return 'OTHER';
};

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [],
  activeTabId: 'test',
  isActivityTrackerOpen: false,
  activityLog: [
    {
      id: 'act_init',
      timestamp: Date.now() - 60000,
      formattedTime: new Date(Date.now() - 60000).toTimeString().split(' ')[0],
      action: 'NAVIGATED',
      domain: 'exam.trinetra.local',
      title: 'Assessment Engine Started',
      category: 'OTHER',
    },
  ],
  aiPolicy: 'RESTRICTED_AND_LOGGED',

  openNewTab: (initialUrl = 'https://en.wikipedia.org') => {
    const domain = getDomain(initialUrl);
    const category = getCategory(domain);
    const id = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newTab: BrowserTab = {
      id,
      title: domain.includes('wikipedia') ? 'Wikipedia - The Free Encyclopedia' : domain,
      url: initialUrl,
      domain,
      category,
      timeOpened: Date.now(),
      isLoading: false,
      history: [initialUrl],
      historyIndex: 0,
    };

    const formattedTime = new Date().toTimeString().split(' ')[0];
    const logItem: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      formattedTime,
      action: 'OPENED_TAB',
      domain,
      title: newTab.title,
      category,
    };

    // If AI tool opened, alert the proctor system!
    if (category === 'AI_TOOL') {
      useProctorStore
        .getState()
        .reportViolation(
          'AI_TOOL_ACCESSED',
          `Accessed prohibited AI Assistant domain "${domain}". Telemetry and search queries logged.`,
          true
        );
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
      activityLog: [logItem, ...state.activityLog],
    }));
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId, activityLog } = get();
    const tabToClose = tabs.find((t) => t.id === tabId);
    const durationSec = tabToClose ? Math.round((Date.now() - tabToClose.timeOpened) / 1000) : 0;

    const remainingTabs = tabs.filter((t) => t.id !== tabId);
    let nextActive = activeTabId;
    if (activeTabId === tabId) {
      nextActive = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : 'test';
    }

    const formattedTime = new Date().toTimeString().split(' ')[0];
    const logItem: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      formattedTime,
      action: 'CLOSED_TAB',
      domain: tabToClose?.domain || 'tab',
      durationSec,
      category: tabToClose?.category || 'OTHER',
    };

    set({
      tabs: remainingTabs,
      activeTabId: nextActive,
      activityLog: [logItem, ...activityLog],
    });
  },

  setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

  navigateTab: (tabId: string, inputUrl: string) => {
    const cleanUrl = inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
      ? inputUrl
      : `https://${inputUrl}`;
    const domain = getDomain(cleanUrl);
    const category = getCategory(domain);

    const formattedTime = new Date().toTimeString().split(' ')[0];
    const logItem: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      formattedTime,
      action: 'NAVIGATED',
      domain,
      title: domain,
      category,
    };

    if (category === 'AI_TOOL') {
      useProctorStore
        .getState()
        .reportViolation(
          'AI_TOOL_ACCESSED',
          `Restricted AI query attempted on "${domain}". Logged to integrity ledger.`,
          true
        );
    }

    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id !== tabId) return t;
        const nextHistory = [...t.history.slice(0, t.historyIndex + 1), cleanUrl];
        return {
          ...t,
          url: cleanUrl,
          domain,
          title: domain,
          category,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        };
      }),
      activityLog: [logItem, ...state.activityLog],
    }));
  },

  searchInTab: (tabId: string, query: string) => {
    const encoded = encodeURIComponent(query);
    const searchUrl = `https://www.google.com/search?q=${encoded}`;
    const domain = 'google.com';

    const formattedTime = new Date().toTimeString().split(' ')[0];
    const logItem: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      formattedTime,
      action: 'SEARCHED',
      domain,
      query,
      category: 'SEARCH',
    };

    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id !== tabId) return t;
        return {
          ...t,
          url: searchUrl,
          domain,
          title: `Search: ${query}`,
          category: 'SEARCH',
        };
      }),
      activityLog: [logItem, ...state.activityLog],
    }));
  },

  toggleActivityTracker: () =>
    set((state) => ({ isActivityTrackerOpen: !state.isActivityTrackerOpen })),

  returnToTest: () => set({ activeTabId: 'test' }),
}));

