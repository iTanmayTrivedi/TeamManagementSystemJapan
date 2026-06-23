import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, ListOrdered, Activity, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import ReactMarkdown from 'react-markdown';

type InsightType = 'summary' | 'priority' | 'activity';

const MOCK_INSIGHTS: Record<InsightType, string> = {
  summary: `### Task Overview\n\nYou have **7 tasks** across the team:\n- ✅ 2 completed\n- 🔄 2 in progress\n- ⏳ 3 pending\n\nOverall completion rate is **29%**. The team is making steady progress with focus on high-priority items.`,
  priority: `### Priority Recommendations\n\n1. **Design new landing page** — Due tomorrow, currently in progress. Ensure Jane has what she needs.\n2. **Quarterly report** — High priority, due tomorrow. Check in with Mike.\n3. **Setup CI/CD pipeline** — High priority, unassigned. Consider assigning this soon.\n4. **Write API documentation** — Medium priority, good timeline.`,
  activity: `### Recent Activity Summary\n\n- Admin created the CI/CD pipeline task\n- John completed the login bug fix ✅\n- Sarah assigned the landing page redesign to Jane\n- Strong activity from the Engineering team this week`,
};

export function AiInsights() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<InsightType>('summary');
  const [insights, setInsights] = useState<Record<InsightType, string>>({ summary: '', priority: '', activity: '' });
  const [loading, setLoading] = useState<Record<InsightType, boolean>>({ summary: false, priority: false, activity: false });

  const fetchInsight = async (type: InsightType) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    // Simulate AI delay
    await new Promise(r => setTimeout(r, 800));
    setInsights(prev => ({ ...prev, [type]: MOCK_INSIGHTS[type] }));
    setLoading(prev => ({ ...prev, [type]: false }));
  };

  const tabs = [
    { key: 'summary' as InsightType, icon: Sparkles, label: t('aiSummary') },
    { key: 'priority' as InsightType, icon: ListOrdered, label: t('aiPriority') },
    { key: 'activity' as InsightType, icon: Activity, label: t('aiActivity') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          {t('aiInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as InsightType)}>
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-1.5 text-xs">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="mt-4 space-y-3">
              {!insights[tab.key] && !loading[tab.key] && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <tab.icon className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t('aiClickGenerate')}</p>
                  <Button onClick={() => fetchInsight(tab.key)} size="sm" variant="outline">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {t('aiGenerate')}
                  </Button>
                </div>
              )}
              {loading[tab.key] && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">{t('aiGenerating')}</span>
                </div>
              )}
              {insights[tab.key] && !loading[tab.key] && (
                <div className="space-y-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{insights[tab.key]}</ReactMarkdown>
                  </div>
                  <Button onClick={() => fetchInsight(tab.key)} size="sm" variant="ghost" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('aiRefresh')}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
