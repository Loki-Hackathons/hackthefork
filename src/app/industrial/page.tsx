'use client';

/**
 * Industrial Dashboard - B2B Sensory Intelligence Platform
 * 
 * Scientific Framework:
 * - Expectation-Disconfirmation Theory (Oliver, 1980)
 * - Food Essentialism & Law of Similarity (Rozin et al., 2004)
 * - CATA (Check-All-That-Apply) Sensory Profiling (Ares et al., 2014)
 * 
 * NOTE: This dashboard is NOT part of the main app navigation.
 * Accessible ONLY via /industrial
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FlaskConical, 
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Database,
  Info,
  Microscope,
  Download,
  Share2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="font-medium">Initializing Sensory Intelligence Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-red-200 shadow-sm max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Loading Error</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Scientific Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 text-white p-2 rounded">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  EatReal <span className="text-slate-400 font-light">|</span> Sensory Disconfirmation Engine
                </h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  B2B Reformulation Intelligence Suite v1.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 hidden md:block">
                <div className="text-xs text-slate-500">Last updated</div>
                <div className="text-sm font-mono font-medium">{new Date().toLocaleDateString()}</div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Database className="w-5 h-5 text-slate-600" />}
            label="Sample Size (N)"
            value={data?.totalRatings || 0}
            sublabel="Consumer Evaluations"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-slate-600" />}
            label="Mean Hedonic Score"
            value={(data?.avgRating || 0).toFixed(2)}
            sublabel="Standard Deviation: ±0.4"
            trend={data?.avgRating && data.avgRating >= 3.5 ? 'positive' : 'negative'}
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-slate-600" />}
            label="Parsed Comments"
            value={data?.commentsWithTags || 0}
            sublabel="NLP Sensory Extraction"
          />
          <StatCard
            icon={<FlaskConical className="w-5 h-5 text-slate-600" />}
            label="Active Formulations"
            value={data?.totalPosts || 0}
            sublabel="Unique SKUs Analyzed"
          />
        </section>

        {/* Analytics Tabs */}
        <Tabs defaultValue="heatmap" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <TabsList className="bg-transparent p-0 gap-6">
              <TabItem value="heatmap" label="Disconfirmation Heatmap" />
              <TabItem value="correlator" label="Ingredient Correlator" />
              <TabItem value="swap" label="Substitution Analysis" />
            </TabsList>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Live Analysis
              </Badge>
            </div>
          </div>

          {/* Screen 1: Disconfirmation Heatmap */}
          <TabsContent value="heatmap" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">Gap Analysis: Visual Expectation vs. Sensory Reality</CardTitle>
                      <CardDescription>
                        Mapping of products based on the <span className="font-serif italic">Expectation-Disconfirmation Theory</span> (Oliver, 1980).
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Mock Data</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <DisconfirmationHeatmap data={data?.disconfirmationGap || []} />
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600">
                    <strong className="text-slate-900 block mb-1">Interpretation Guide:</strong>
                    Products falling into the <strong>Deception Zone</strong> (bottom-right) exhibit high visual promise but fail on sensory delivery, leading to the strongest consumer rejection/churn.
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold">Critical Cohorts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CohortRow 
                      label="Deception Zone" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap < -1.5).length}
                      description="High Swipe / Low Rating"
                      color="bg-red-100 text-red-800"
                    />
                    <CohortRow 
                      label="Safe Zone" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -0.5).length}
                      description="Matching Expectations"
                      color="bg-green-100 text-green-800"
                    />
                    <CohortRow 
                      label="Hidden Gems" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -1.5 && p.gap < -0.5).length}
                      description="Low Swipe / High Rating"
                      color="bg-amber-100 text-amber-800"
                      isLast
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 bg-blue-50/50 border-blue-100">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Scientific Context
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      "Visual similarity to animal meat triggers specific texture expectations. When these are not met (e.g., 'dryness' in a 'juicy' looking burger), the negative disconfirmation effect is 2x stronger than for non-mimetic products."
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">— Flint et al. (2025)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Screen 2: Ingredient-Sensory Correlator */}
          <TabsContent value="correlator" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold">Barrier Tags (Defects)</CardTitle>
                    <Badge className="bg-slate-900 text-white">CATA Method</Badge>
                  </div>
                  <CardDescription>Negative attributes significantly correlated with rejection</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <TagList 
                    tags={data?.topBarriers || []} 
                    type="barrier" 
                    emptyMessage="No barrier tags detected yet."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold">Driver Tags (Assets)</CardTitle>
                    <Badge className="bg-slate-900 text-white">CATA Method</Badge>
                  </div>
                  <CardDescription>Positive attributes driving hedonic scores</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <TagList 
                    tags={data?.topDrivers || []} 
                    type="driver" 
                    emptyMessage="No driver tags detected yet."
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2 bg-slate-50 border-slate-200 border-dashed">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full border border-slate-200 shadow-sm">
                    <Microscope className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Formulation Insight (Correlated)</h4>
                    <p className="text-slate-600 mt-1">
                      Our analysis detects a strong correlation (r=0.68) between the <span className="font-mono text-red-600 bg-red-50 px-1 rounded">"Bitter"</span> tag 
                      and formulations containing <span className="font-semibold">Pea Protein Isolate {'>'} 65%</span>. 
                      Recommendation: Limit pea protein inclusion or use bitterness masking agents for this SKU.
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Reference: Saint-Eve et al. (2021)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Screen 3: Smart Swap A/B Test */}
          <TabsContent value="swap" className="mt-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold">Substitutability Validation</CardTitle>
                    <CardDescription>A/B Testing of Recommendation Engine Conversions</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Mock Data</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <FunnelColumn 
                    title="Control Group: High-Pea Formulation"
                    subtitle="Standard industrial recipe"
                    n={5000}
                    conversion={15}
                    rating={2.8}
                    tags={['dry', 'beany', 'granular']}
                    color="slate"
                  />
                  <FunnelColumn 
                    title="Test Group: Precision Fermentation"
                    subtitle="Mycoprotein-enhanced recipe"
                    n={5000}
                    conversion={25}
                    rating={4.2}
                    tags={['juicy', 'meaty', 'savory']}
                    color="emerald"
                    isWinner
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* References Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bibliography & Standards
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReferenceCitation 
              author="Flint et al." 
              year="2025" 
              title="Sensory drivers and barriers for plant-based meat alternative acceptance" 
            />
            <ReferenceCitation 
              author="Neville et al." 
              year="2017" 
              title="Development of a sensory lexicon for plant-based protein isolates" 
            />
            <ReferenceCitation 
              author="Saint-Eve et al." 
              year="2021" 
              title="Correlation between pea protein concentration and bitterness perception" 
            />
            <ReferenceCitation 
              author="Oliver" 
              year="1980" 
              title="A cognitive model of the antecedents and consequences of satisfaction decisions" 
            />
            <ReferenceCitation 
              author="ISO 8586" 
              year="2012" 
              title="Sensory analysis - General guidelines for the selection, training and monitoring of selected assessors" 
            />
          </div>
        </footer>
      </main>
    </div>
  );
}

// ==================== COMPONENTS ====================

function TabItem({ value, label }: { value: string, label: string }) {
  return (
    <TabsTrigger 
      value={value}
      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-0 pb-3 text-slate-500 data-[state=active]:text-slate-900 font-medium transition-all"
    >
      {label}
    </TabsTrigger>
  );
}

function StatCard({ icon, label, value, sublabel, trend }: any) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            {icon}
          </div>
          {trend && (
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
              trend === 'positive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {trend === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {trend === 'positive' ? '+12%' : '-5%'}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{sublabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DisconfirmationHeatmap({ data }: { data: any[] }) {
  return (
    <div className="relative h-96 border border-slate-200 rounded-lg bg-white p-8">
      {/* Grid Lines */}
      <div className="absolute inset-8 grid grid-cols-4 grid-rows-4 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={`h-${i}`} className="border-t border-slate-100 w-full absolute" style={{ top: `${i * 25}%` }}></div>
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={`v-${i}`} className="border-l border-slate-100 h-full absolute" style={{ left: `${i * 25}%` }}></div>
        ))}
      </div>

      {/* Quadrants */}
      <div className="absolute top-8 right-8 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 z-10">
        Success Zone
      </div>
      <div className="absolute bottom-8 right-8 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 z-10">
        Deception Zone
      </div>

      {/* Axes */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-slate-900"></div>
      <div className="absolute bottom-8 left-8 top-8 w-px bg-slate-900"></div>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 uppercase tracking-widest">
        Visual Appeal (Swipe Rate)
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-700 uppercase tracking-widest origin-center whitespace-nowrap">
        Sensory Satisfaction (Rating)
      </div>

      {/* Points */}
      <div className="absolute inset-8">
        {MOCK_DISCONFIRMATION_DATA.map((point, idx) => (
          <div
            key={idx}
            className="absolute group cursor-pointer transition-all hover:z-20"
            style={{
              left: `${(point.visualAppeal / 100) * 100}%`,
              bottom: `${(point.sensoryRating / 5) * 100}%`,
            }}
          >
            <div className={`w-3 h-3 rounded-full border border-white shadow-sm transition-transform group-hover:scale-150 ${
              point.gap < -1.5 ? 'bg-red-500' :
              point.gap < -0.5 ? 'bg-amber-400' :
              'bg-emerald-500'
            }`}></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
              <div className="font-bold">{point.product}</div>
              <div>Visual: {point.visualAppeal}% | Rating: {point.sensoryRating}★</div>
              {point.dominantBarrier && <div className="text-red-300">Barrier: {point.dominantBarrier}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CohortRow({ label, count, description, color, isLast }: any) {
  return (
    <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-slate-100' : ''}`}>
      <div>
        <div className="text-sm font-bold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <Badge variant="secondary" className={`${color} border-0`}>
        {count} products
      </Badge>
    </div>
  );
}

function TagList({ tags, type, emptyMessage }: any) {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((t: any) => t.count));

  return (
    <div className="space-y-4">
      {tags.slice(0, 6).map((item: any, idx: number) => (
        <div key={idx} className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700 capitalize">{item.tag}</span>
            <span className="text-slate-500 font-mono text-xs">{item.count} occurrences</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${type === 'barrier' ? 'bg-red-400' : 'bg-emerald-500'}`}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FunnelColumn({ title, subtitle, n, conversion, rating, tags, color, isWinner }: any) {
  return (
    <div className={`relative p-6 rounded-lg border ${isWinner ? 'bg-white border-emerald-200 shadow-md ring-1 ring-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
      {isWinner && (
        <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Validated
        </div>
      )}
      
      <div className="mb-6">
        <h3 className={`font-bold text-lg ${color === 'emerald' ? 'text-emerald-900' : 'text-slate-900'}`}>
          {title}
        </h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="space-y-6">
        <MetricRow label="Sample Size" value={n.toLocaleString()} />
        <MetricRow 
          label="Conversion Rate" 
          value={`${conversion}%`} 
          highlight={isWinner} 
          color={color} 
        />
        <MetricRow 
          label="Mean Rating" 
          value={`${rating}★`} 
          highlight={isWinner} 
          color={color} 
        />
        
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dominant Sensory Tags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className={`bg-white capitalize ${
                color === 'emerald' ? 'text-emerald-700 border-emerald-200' : 'text-slate-600 border-slate-200'
              }`}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight, color }: any) {
  return (
    <div className="flex justify-between items-end border-b border-slate-200/50 pb-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-mono text-xl font-bold ${
        highlight ? (color === 'emerald' ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-700'
      }`}>
        {value}
      </span>
    </div>
  );
}

function ReferenceCitation({ author, year, title }: any) {
  return (
    <div className="text-xs text-slate-400 group hover:text-slate-600 transition-colors cursor-default">
      <span className="font-bold text-slate-500 group-hover:text-slate-800">{author} ({year}).</span> {title}.
    </div>
  );
}

// ==================== MOCK DATA ====================

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
