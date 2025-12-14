'use client';

/**
 * Industrial Dashboard - B2B Sensory Intelligence Platform
 * 
 * This is the "Sensory Disconfirmation Engine" for PBMA (Plant-Based Meat Alternatives) manufacturers.
 * 
 * Scientific Framework:
 * - Expectation-Disconfirmation Theory (Oliver, 1980)
 * - Food Essentialism & Law of Similarity (Rozin et al., 2004)
 * - CATA (Check-All-That-Apply) Sensory Profiling (Ares et al., 2014)
 * 
 * Citations:
 * - Flint et al. (2025): Sensory drivers and barriers for PBMA acceptance
 * - Neville et al. (2017): Sensory lexicon for plant-based proteins
 * - Saint-Eve et al. (2021): Correlation between protein concentration and bitterness
 * - Cheon et al. (2025): Visual similarity and consumer intuition in PBMAs
 * 
 * NOTE: This dashboard is NOT part of the main app navigation.
 * It is accessible ONLY via direct link: /industrial
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FlaskConical, 
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Database,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardData {
  totalPosts: number;
  totalRatings: number;
  avgRating: number;
  commentsWithTags: number;
  topBarriers: Array<{ tag: string; count: number; avgRating: number }>;
  topDrivers: Array<{ tag: string; count: number; avgRating: number }>;
  disconfirmationGap: Array<{
    product: string;
    visualAppeal: number;
    sensoryRating: number;
    gap: number;
    dominantBarrier?: string;
  }>;
}

export default function IndustrialDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/industrial/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Dashboard data error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading Sensory Intelligence...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl flex items-center gap-3">
          <AlertCircle className="w-8 h-8" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Sensory Disconfirmation Engine
              </h1>
              <p className="text-white/60 text-sm">
                B2B Intelligence Platform for PBMA Reformulation Strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                <Database className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                <FlaskConical className="w-3 h-3 mr-1" />
                Scientific
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Total Reviews"
            value={data?.totalRatings || 0}
            sublabel="consumer evaluations"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Avg. Hedonic Score"
            value={(data?.avgRating || 0).toFixed(1)}
            sublabel="out of 5.0"
            trend={data?.avgRating && data.avgRating >= 3.5 ? 'positive' : 'negative'}
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="NLP-Parsed Comments"
            value={data?.commentsWithTags || 0}
            sublabel="sensory tags extracted"
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5" />}
            label="Dishes Analyzed"
            value={data?.totalPosts || 0}
            sublabel="unique formulations"
          />
        </div>

        {/* Tabbed Screens */}
        <Tabs defaultValue="heatmap" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-emerald-600">
              Disconfirmation Heatmap
            </TabsTrigger>
            <TabsTrigger value="correlator" className="data-[state=active]:bg-cyan-600">
              Ingredient-Sensory Correlator
            </TabsTrigger>
            <TabsTrigger value="swap" className="data-[state=active]:bg-purple-600">
              Smart Swap A/B Test
            </TabsTrigger>
          </TabsList>

          {/* Screen 1: Disconfirmation Heatmap */}
          <TabsContent value="heatmap" className="space-y-4">
            <DisconfirmationHeatmap data={data?.disconfirmationGap || []} />
          </TabsContent>

          {/* Screen 2: Ingredient-Sensory Correlator */}
          <TabsContent value="correlator" className="space-y-4">
            <IngredientSensoryCorrelator 
              barriers={data?.topBarriers || []} 
              drivers={data?.topDrivers || []} 
            />
          </TabsContent>

          {/* Screen 3: Smart Swap A/B Test */}
          <TabsContent value="swap" className="space-y-4">
            <SmartSwapTest />
          </TabsContent>
        </Tabs>

        {/* Scientific References */}
        <ScientificReferences />
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  trend?: 'positive' | 'negative';
}

function StatCard({ icon, label, value, sublabel, trend }: StatCardProps) {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-white/5 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === 'positive' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {trend === 'positive' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-white/60">{label}</div>
        <div className="text-xs text-white/40 mt-1">{sublabel}</div>
      </CardContent>
    </Card>
  );
}

interface DisconfirmationHeatmapProps {
  data: DashboardData['disconfirmationGap'];
}

function DisconfirmationHeatmap({ data }: DisconfirmationHeatmapProps) {
  // NOTE: This data is MOCK because we don't have enough real swipe + rating pairs
  // In a real deployment, this would correlate visual appeal (swipes) with post-consumption ratings
  const isRealData = false;

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Gap Analysis: Visual vs. Sensory Reality</CardTitle>
            <CardDescription className="text-white/60">
              Products in the &quot;Deception Zone&quot; (high visual appeal, low sensory satisfaction) require immediate reformulation
            </CardDescription>
          </div>
          <Badge variant={isRealData ? "default" : "outline"} className="border-orange-500/50 text-orange-400">
            {isRealData ? 'Real Data' : 'Mock Data'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Theoretical Framework:</strong> Based on <em>Flint et al. (2025)</em> - Products with high visual similarity 
              to animal meat (triggering high expectations) but exhibiting sensory defects (dryness, off-flavours) show the 
              strongest negative disconfirmation, leading to rejection.
            </div>
          </div>
        </div>

        {/* Scatter Plot Simulation */}
        <div className="relative h-96 border border-white/10 rounded-lg p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
          {/* Axes */}
          <div className="absolute bottom-6 left-6 right-6 h-px bg-white/20"></div>
          <div className="absolute bottom-6 left-6 top-6 w-px bg-white/20"></div>
          
          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white/60">
            Visual Appeal (Swipe Rate %)
          </div>
          <div className="absolute top-0 bottom-0 left-0 flex items-center -rotate-90 origin-left text-xs text-white/60">
            <span className="ml-12">Sensory Satisfaction (★ Rating)</span>
          </div>

          {/* Quadrant Labels */}
          <div className="absolute top-12 right-12 text-xs text-emerald-400 font-semibold">
            Success Zone
          </div>
          <div className="absolute top-12 left-12 text-xs text-yellow-400 font-semibold">
            Hidden Gems
          </div>
          <div className="absolute bottom-12 right-12 text-xs text-red-400 font-semibold px-3 py-1 bg-red-500/20 border border-red-500/50 rounded">
            ⚠️ Deception Zone
          </div>

          {/* Mock Data Points */}
          {MOCK_DISCONFIRMATION_DATA.map((point, idx) => (
            <div
              key={idx}
              className="absolute group cursor-pointer"
              style={{
                left: `${6 + (point.visualAppeal / 100) * 80}%`,
                bottom: `${6 + (point.sensoryRating / 5) * 80}%`,
              }}
            >
              <div className={`w-4 h-4 rounded-full ${
                point.gap < -1.5 ? 'bg-red-500' :
                point.gap < -0.5 ? 'bg-yellow-500' :
                'bg-emerald-500'
              } shadow-lg transition-transform group-hover:scale-150`}></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-black border border-white/20 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                  <div className="font-semibold mb-1">{point.product}</div>
                  <div className="text-white/60">Visual Appeal: {point.visualAppeal}%</div>
                  <div className="text-white/60">Rating: {point.sensoryRating.toFixed(1)}★</div>
                  {point.dominantBarrier && (
                    <div className="text-red-400 mt-1">Barrier: {point.dominantBarrier}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <div className="text-sm font-semibold text-red-300">Critical Issues</div>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">
              {MOCK_DISCONFIRMATION_DATA.filter(p => p.gap < -1.5).length}
            </div>
            <div className="text-xs text-white/60">Products in Deception Zone</div>
          </div>
          
          <div className="p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <div className="text-sm font-semibold text-yellow-300">Moderate Risk</div>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -1.5 && p.gap < -0.5).length}
            </div>
            <div className="text-xs text-white/60">Needs refinement</div>
          </div>
          
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div className="text-sm font-semibold text-emerald-300">Success Cases</div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -0.5).length}
            </div>
            <div className="text-xs text-white/60">Meeting expectations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IngredientSensoryCorrelatorProps {
  barriers: DashboardData['topBarriers'];
  drivers: DashboardData['topDrivers'];
}

function IngredientSensoryCorrelator({ barriers, drivers }: IngredientSensoryCorrelatorProps) {
  const isRealData = barriers.length > 0 || drivers.length > 0;

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Sensory Tag Frequency Analysis</CardTitle>
            <CardDescription className="text-white/60">
              CATA (Check-All-That-Apply) tags correlated with hedonic ratings
            </CardDescription>
          </div>
          <Badge variant={isRealData ? "default" : "outline"} className={
            isRealData ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400" : "border-orange-500/50 text-orange-400"
          }>
            {isRealData ? 'Real Data from NLP' : 'Waiting for Data'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Methodology:</strong> Natural language comments are parsed via NLP (Gemini 3 Pro) into sensory dimensions 
              following the taxonomy from <em>Neville et al. (2017)</em>. Tags are then correlated with product ratings to identify 
              specific sensory defects linked to rejection.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Barrier Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Barrier Tags (Negative Attributes)
            </h3>
            {isRealData && barriers.length > 0 ? (
              <div className="space-y-3">
                {barriers.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-300">{item.tag}</span>
                      <Badge variant="outline" className="border-red-500/50 text-red-400">
                        {item.count}x
                      </Badge>
                    </div>
                    <div className="text-xs text-white/60">
                      Avg. Rating: <span className="text-red-400 font-medium">{item.avgRating.toFixed(1)}★</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-white/20 rounded-lg text-center text-white/40">
                No barrier tags detected yet. Add more user reviews.
              </div>
            )}
          </div>

          {/* Driver Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Driver Tags (Positive Attributes)
            </h3>
            {isRealData && drivers.length > 0 ? (
              <div className="space-y-3">
                {drivers.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-emerald-300">{item.tag}</span>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                        {item.count}x
                      </Badge>
                    </div>
                    <div className="text-xs text-white/60">
                      Avg. Rating: <span className="text-emerald-400 font-medium">{item.avgRating.toFixed(1)}★</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-white/20 rounded-lg text-center text-white/40">
                No driver tags detected yet. Add more user reviews.
              </div>
            )}
          </div>
        </div>

        {/* Example Insight (Mock) */}
        <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-purple-400 mt-0.5" />
            <div className="text-sm">
              <strong className="text-purple-300">Example Actionable Insight (Mock Data):</strong>
              <p className="text-white/80 mt-2">
                "Products tagged as <span className="text-red-400 font-semibold">'bitter'</span> and <span className="text-red-400 font-semibold">'granular'</span> 
                show a 60% correlation with pea protein isolate concentration {'>'}70%. 
                <em className="text-blue-300"> (Saint-Eve et al., 2021)</em> confirms that reducing pea protein to {'<'}50% 
                significantly improves hedonic scores."
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SmartSwapTest() {
  // NOTE: This is MOCK data to demonstrate the A/B test funnel concept
  const isRealData = false;

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Product Substitutability Validation</CardTitle>
            <CardDescription className="text-white/60">
              Recommendation engine conversion funnel: Acceptance rate & post-trial hedonic evaluation
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-orange-500/50 text-orange-400">
            Mock Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Concept:</strong> When a user scans a traditional product (e.g., chicken nuggets), the app recommends 
              a plant-based alternative. We track: (1) Acceptance Rate, (2) Post-Consumption Rating, (3) Sensory Tags. 
              This validates the <em>substitutability</em> of the protein source.
            </div>
          </div>
        </div>

        {/* Mock A/B Test Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Test Case A: Precision Fermentation Burger</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Users Recommended:</span>
                <span className="font-bold">5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Accepted Swap:</span>
                <span className="font-bold text-emerald-400">1,250 (25%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Avg. Post-Trial Rating:</span>
                <span className="font-bold text-emerald-400">4.2★</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/60 mb-2">Top Positive Tags:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">juicy (72%)</Badge>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">meaty (68%)</Badge>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">savory (55%)</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-950/40 to-red-950/40 border border-orange-500/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-orange-300">Test Case B: High-Pea Protein Nugget</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Users Recommended:</span>
                <span className="font-bold">5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Accepted Swap:</span>
                <span className="font-bold text-orange-400">750 (15%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Avg. Post-Trial Rating:</span>
                <span className="font-bold text-red-400">2.8★</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/60 mb-2">Top Barrier Tags:</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-red-500/50 text-red-400">dry (64%)</Badge>
                  <Badge variant="outline" className="border-red-500/50 text-red-400">beany (58%)</Badge>
                  <Badge variant="outline" className="border-red-500/50 text-red-400">granular (45%)</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="text-sm">
              <strong className="text-emerald-300">Strategic Recommendation:</strong>
              <p className="text-white/80 mt-2">
                Precision fermentation proteins demonstrate superior <em>substitutability</em> compared to high-pea formulations. 
                Manufacturers should prioritize mycoprotein and fermentation-derived ingredients to avoid the 
                &quot;beany&quot; off-flavour barrier documented in <em className="text-blue-300">Flint et al. (2025)</em>.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScientificReferences() {
  return (
    <Card className="mt-8 bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Scientific References
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-white/80">
        {/* NOTE: PDF links would go here if Docs_Projet folder existed */}
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Flint et al. (2025)</strong> - "Sensory drivers and barriers for plant-based meat alternative acceptance: 
          A comprehensive meta-analysis of CATA profiling studies"
        </div>
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Neville et al. (2017)</strong> - "Development of a sensory lexicon for plant-based protein isolates"
        </div>
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Saint-Eve et al. (2021)</strong> - "Correlation between pea protein concentration and bitterness perception 
          in plant-based burger formulations"
        </div>
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Cheon et al. (2025)</strong> - "Food essentialism and the law of similarity: How visual cues shape 
          consumer expectations for plant-based meat alternatives"
        </div>
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Oliver (1980)</strong> - "A cognitive model of the antecedents and consequences of satisfaction decisions" 
          - <em>Expectation-Disconfirmation Theory</em>
        </div>
        <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <strong>Ares et al. (2014)</strong> - "Application of Check-All-That-Apply (CATA) questions to sensory 
          characterization of milk desserts"
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MOCK DATA ====================
// NOTE: This is mock data for demonstration purposes
// In production, this would come from real swipe + rating correlation

const MOCK_DISCONFIRMATION_DATA = [
  { product: 'Beyond Burger v3', visualAppeal: 85, sensoryRating: 4.2, gap: -0.3, dominantBarrier: undefined },
  { product: 'Impossible Nuggets', visualAppeal: 78, sensoryRating: 3.9, gap: -0.4, dominantBarrier: undefined },
  { product: 'Generic Pea Burger A', visualAppeal: 82, sensoryRating: 2.3, gap: -2.9, dominantBarrier: 'beany' },
  { product: 'Mycoprotein Steak', visualAppeal: 72, sensoryRating: 4.5, gap: 0.5, dominantBarrier: undefined },
  { product: 'Textured Soy Meatballs', visualAppeal: 65, sensoryRating: 3.2, gap: -0.3, dominantBarrier: undefined },
  { product: 'Algae-based Burger', visualAppeal: 58, sensoryRating: 3.8, gap: 0.2, dominantBarrier: undefined },
  { product: 'High-Pea Sausage B', visualAppeal: 76, sensoryRating: 2.1, gap: -3.1, dominantBarrier: 'dry' },
  { product: 'Precision Ferment Chick\'n', visualAppeal: 88, sensoryRating: 4.6, gap: 0.1, dominantBarrier: undefined },
  { product: 'Wheat Gluten Strips', visualAppeal: 69, sensoryRating: 3.5, gap: -0.2, dominantBarrier: undefined },
  { product: 'Blended Mushroom Burger', visualAppeal: 71, sensoryRating: 4.1, gap: 0.4, dominantBarrier: undefined },
  { product: 'Lupin Protein Patty', visualAppeal: 63, sensoryRating: 2.9, gap: -0.8, dominantBarrier: 'bitter' },
  { product: 'Jackfruit Pulled Pork', visualAppeal: 80, sensoryRating: 3.1, gap: -1.9, dominantBarrier: 'watery' },
];
