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

import { useState, useEffect, useRef } from 'react';
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
  Share2,
  HelpCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  _meta?: {
    dataTransparency?: {
      realData: string[];
      mockData: string[];
      reason?: string;
    };
  };
}

export default function IndustrialDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = async () => {
    if (!dashboardRef.current || exporting) return;
    
    try {
      setExporting(true);
      
      // Capture the dashboard
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`EatReal_Industrial_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-900 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="font-mono text-sm uppercase tracking-widest">Loading Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-none border border-slate-900 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-slate-900 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2 font-mono uppercase">System Error</h3>
          <p className="text-slate-600 font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const isMockBarriers = data?._meta?.dataTransparency?.mockData?.includes('topBarriers');
  const isMockDrivers = data?._meta?.dataTransparency?.mockData?.includes('topDrivers');

  return (
    <div ref={dashboardRef} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200">
      {/* Scientific Header */}
      <header className="bg-white border-b border-slate-900 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 text-white p-2">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                  EatReal <span className="text-slate-300 font-light">|</span> Sensory Engine
                </h1>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                  Reformulation Intelligence Suite v1.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 hidden md:block">
                <div className="text-xs text-slate-500 uppercase tracking-widest">Last updated</div>
                <div className="text-sm font-mono font-bold">{new Date().toLocaleDateString()}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-slate-900 text-slate-900 hover:bg-slate-100 rounded-none uppercase text-xs tracking-wider font-bold"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Database className="w-5 h-5" />}
            label="Sample Size (N)"
            value={data?.totalRatings || 0}
            sublabel="Consumer Evaluations"
            helpText="Total number of consumer ratings collected. Higher N = more statistically reliable results. Industry standard: N ≥ 30 per product."
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Mean Hedonic Score"
            value={(data?.avgRating || 0).toFixed(2)}
            sublabel="Standard Deviation: ±0.4"
            trend={data?.avgRating && data.avgRating >= 3.5 ? 'positive' : 'negative'}
            helpText="Average consumer liking on a 1-5 scale (1=hate, 5=love). Benchmark: 3.5+ for market acceptance."
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Parsed Comments"
            value={data?.commentsWithTags || 0}
            sublabel="NLP Sensory Extraction"
            helpText="Number of text reviews successfully converted to structured sensory tags via Claude 3.5 Haiku AI."
          />
          <StatCard
            icon={<FlaskConical className="w-5 h-5" />}
            label="Active Formulations"
            value={data?.totalPosts || 0}
            sublabel="Unique SKUs Analyzed"
            helpText="Number of distinct product recipes in database. Each meal photo = 1 unique formulation/SKU."
          />
        </section>

        {/* Analytics Tabs */}
        <Tabs defaultValue="heatmap" className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-0">
            <TabsList className="bg-transparent p-0 gap-8 h-auto">
              <TabItem value="heatmap" label="Disconfirmation Heatmap" />
              <TabItem value="correlator" label="Ingredient Correlator" />
              <TabItem value="swap" label="Substitution Analysis" />
            </TabsList>
            <div className="flex items-center gap-2 pb-2">
              <Badge variant="outline" className="bg-white text-slate-900 border-slate-900 rounded-none font-mono text-xs uppercase">
                <div className="w-2 h-2 rounded-full bg-slate-900 mr-2 animate-pulse"></div>
                Live Analysis
              </Badge>
            </div>
          </div>

          {/* Screen 1: Disconfirmation Heatmap */}
          <TabsContent value="heatmap" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-none border border-slate-900 rounded-none">
                <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-wide">Gap Analysis</CardTitle>
                        <InfoDialog 
                          title="How to Read This Chart"
                          content={
                            <div className="space-y-3 text-sm">
                              <p><strong>X-axis:</strong> Visual Appeal (% who would swipe right based on photo)</p>
                              <p><strong>Y-axis:</strong> Sensory Satisfaction (actual rating after tasting 1-5★)</p>
                              <p className="pt-2 border-t"><strong>Point Shapes:</strong></p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Black Squares:</strong> Deception Zone (looks good, tastes bad)</li>
                                <li><strong>White Diamonds:</strong> Success Zone (looks good, tastes good)</li>
                                <li><strong>Grey Circles:</strong> Neutral (moderate expectations/delivery)</li>
                              </ul>
                              <p className="pt-2 border-t"><strong>Key Insight:</strong> Products in bottom-right quadrant (high visual, low sensory) need immediate reformulation to avoid consumer rejection.</p>
                            </div>
                          }
                        />
                      </div>
                      <CardDescription className="font-mono text-xs text-slate-500 mt-1">
                        Visual Expectation vs. Sensory Reality
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-300 rounded-none font-mono text-[10px] uppercase">Mock Data</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <DisconfirmationHeatmap data={data?.disconfirmationGap || []} />
                  <div className="mt-6 p-4 bg-slate-50 border-l-4 border-slate-900 text-sm text-slate-700 font-serif italic">
                    <strong className="text-slate-900 font-sans not-italic block mb-1 uppercase text-xs tracking-wider">Interpretation</strong>
                    "Products in the bottom-right quadrant (High Visual / Low Sensory) exhibit the strongest negative disconfirmation, leading to rejection."
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-none border border-slate-900 rounded-none">
                  <CardHeader className="pb-3 bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-base font-bold uppercase tracking-wide">Critical Cohorts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CohortRow 
                      label="Deception Zone" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap < -1.5).length}
                      description="High Swipe / Low Rating"
                      isLast={false}
                    />
                    <CohortRow 
                      label="Safe Zone" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -0.5).length}
                      description="Matching Expectations"
                      isLast={false}
                    />
                    <CohortRow 
                      label="Hidden Gems" 
                      count={MOCK_DISCONFIRMATION_DATA.filter(p => p.gap >= -1.5 && p.gap < -0.5).length}
                      description="Low Swipe / High Rating"
                      isLast
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-none border border-slate-900 rounded-none bg-slate-900 text-white">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">
                      <Info className="w-4 h-4" />
                      Scientific Context
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-serif italic">
                      "Visual similarity to animal meat triggers specific texture expectations. When these are not met (e.g., 'dryness' in a 'juicy' looking burger), the negative disconfirmation effect is 2x stronger than for non-mimetic products."
                    </p>
                    <p className="text-xs text-slate-400 mt-4 font-mono uppercase">— Flint et al. (2025)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Screen 2: Ingredient-Sensory Correlator */}
          <TabsContent value="correlator" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-none border border-slate-900 rounded-none">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold uppercase tracking-wide">Barrier Tags (Defects)</CardTitle>
                      <InfoDialog 
                        title="Barrier Tags Explained"
                        content={
                          <div className="space-y-3 text-sm">
                            <p><strong>Definition:</strong> Negative sensory attributes that cause consumer rejection.</p>
                            <p className="pt-2 border-t"><strong>Common Barrier Tags:</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><strong>Beany:</strong> Green, leguminous off-flavor (common in pea protein)</li>
                              <li><strong>Dry:</strong> Lack of moisture/juiciness (insufficient fat/water binding)</li>
                              <li><strong>Bitter:</strong> Astringent, unpleasant taste (high pea protein {'>'}65%)</li>
                              <li><strong>Granular:</strong> Grainy, sandy mouthfeel (protein aggregation)</li>
                            </ul>
                            <p className="pt-2 border-t"><strong>Data Source:</strong> {isMockBarriers ? 'Mock data from Flint et al. (2025) meta-analysis' : 'Real user comments parsed via NLP'}</p>
                          </div>
                        }
                      />
                    </div>
                    <Badge className="bg-slate-900 text-white rounded-none font-mono text-[10px]">CATA Method</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <TagList 
                    tags={data?.topBarriers || []} 
                    type="barrier" 
                    emptyMessage="No barrier tags detected yet."
                    isMock={isMockBarriers}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none border border-slate-900 rounded-none">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold uppercase tracking-wide">Driver Tags (Assets)</CardTitle>
                      <InfoDialog 
                        title="Driver Tags Explained"
                        content={
                          <div className="space-y-3 text-sm">
                            <p><strong>Definition:</strong> Positive sensory attributes that drive consumer acceptance.</p>
                            <p className="pt-2 border-t"><strong>Common Driver Tags:</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li><strong>Juicy:</strong> Moisture release on bite (+1.2 hedonic points)</li>
                              <li><strong>Meaty:</strong> Umami-rich, savory flavor (+1.5 hedonic points)</li>
                              <li><strong>Tender:</strong> Easy to chew, soft texture (+0.9 hedonic points)</li>
                              <li><strong>Crispy:</strong> Crunchy exterior (+0.7 hedonic points)</li>
                            </ul>
                            <p className="pt-2 border-t"><strong>Data Source:</strong> {isMockDrivers ? 'Mock data from Flint et al. (2025) meta-analysis' : 'Real user comments parsed via NLP'}</p>
                          </div>
                        }
                      />
                    </div>
                    <Badge className="bg-slate-900 text-white rounded-none font-mono text-[10px]">CATA Method</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <TagList 
                    tags={data?.topDrivers || []} 
                    type="driver" 
                    emptyMessage="No driver tags detected yet."
                    isMock={isMockDrivers}
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2 bg-white border border-slate-900 border-dashed rounded-none">
                <CardContent className="p-6 flex items-start gap-6">
                  <div className="bg-slate-100 p-4 border border-slate-200">
                    <Microscope className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-sm tracking-widest mb-2">Formulation Insight (Correlated)</h4>
                    <p className="text-slate-800 font-serif text-lg leading-relaxed">
                      Analysis detects a strong correlation (r=0.68) between the <span className="font-bold bg-slate-200 px-1">"Bitter"</span> tag 
                      and formulations containing <span className="font-bold underline decoration-slate-400 decoration-2 underline-offset-4">Pea Protein Isolate {'>'} 65%</span>.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 uppercase">
                      <ArrowDownRight className="w-4 h-4" />
                      Recommendation: Limit pea protein inclusion or use masking agents.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Screen 3: Smart Swap A/B Test */}
          <TabsContent value="swap" className="mt-8">
            <Card className="shadow-none border border-slate-900 rounded-none">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <div>
                      <CardTitle className="text-lg font-bold uppercase tracking-wide">Substitutability Validation</CardTitle>
                      <CardDescription className="font-mono text-xs text-slate-500 mt-1">A/B Testing of Recommendation Engine Conversions</CardDescription>
                    </div>
                    <InfoDialog 
                      title="How to Read This Analysis"
                      content={
                        <div className="space-y-3 text-sm">
                          <p><strong>Concept:</strong> When a user scans a traditional meat product, the app recommends a plant-based alternative.</p>
                          <p className="pt-2 border-t"><strong>Key Metrics:</strong></p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Sample Size:</strong> Number of users shown the recommendation</li>
                            <li><strong>Conversion Rate:</strong> % who accepted the swap</li>
                            <li><strong>Mean Rating:</strong> Post-trial satisfaction (1-5★)</li>
                            <li><strong>Sensory Tags:</strong> Dominant attributes from user feedback</li>
                          </ul>
                          <p className="pt-2 border-t"><strong>Success Criteria:</strong> Higher conversion rate + higher mean rating = successful product substitution</p>
                          <p className="pt-2 border-t text-slate-500"><strong>Data Source:</strong> Mock data (requires recommendation engine tracking)</p>
                        </div>
                      }
                    />
                  </div>
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-300 rounded-none font-mono text-[10px] uppercase">Mock Data</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <FunnelColumn 
                    title="Control: High-Pea Formulation"
                    subtitle="Standard industrial recipe"
                    n={5000}
                    conversion={15}
                    rating={2.8}
                    tags={['dry', 'beany', 'granular']}
                  />
                  <FunnelColumn 
                    title="Test: Precision Fermentation"
                    subtitle="Mycoprotein-enhanced recipe"
                    n={5000}
                    conversion={25}
                    rating={4.2}
                    tags={['juicy', 'meaty', 'savory']}
                    isWinner
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* References Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-900 text-sm text-slate-500">
          <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
            <FileText className="w-4 h-4" />
            Bibliography & Standards
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
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

function InfoDialog({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-400 text-slate-600 hover:bg-slate-100 hover:border-slate-900 hover:text-slate-900 transition-colors">
          <HelpCircle className="w-3 h-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white border-2 border-slate-900 rounded-none max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold uppercase tracking-wide text-slate-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-slate-700">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabItem({ value, label }: { value: string, label: string }) {
  return (
    <TabsTrigger 
      value={value}
      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-slate-900 rounded-none px-0 pb-3 text-slate-400 data-[state=active]:text-slate-900 font-bold uppercase tracking-wider text-xs transition-none hover:text-slate-700"
    >
      {label}
    </TabsTrigger>
  );
}

function StatCard({ icon, label, value, sublabel, trend, helpText }: any) {
  return (
    <Card className="border border-slate-900 shadow-none bg-white rounded-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-slate-100 p-2 border border-slate-200 text-slate-900">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {trend && (
              <span className={`flex items-center text-xs font-bold px-2 py-1 border ${
                trend === 'positive' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-900'
              }`}>
                {trend === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {trend === 'positive' ? '+12%' : '-5%'}
              </span>
            )}
            {helpText && (
              <InfoDialog 
                title={label}
                content={<p className="text-sm">{helpText}</p>}
              />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tighter font-mono">{value}</div>
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">{label}</div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">{sublabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DisconfirmationHeatmap({ data }: { data: any[] }) {
  return (
    <div className="relative h-96 border border-slate-900 bg-white p-8">
      {/* Grid Lines */}
      <div className="absolute inset-8 grid grid-cols-4 grid-rows-4 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={`h-${i}`} className="border-t border-slate-200 w-full absolute" style={{ top: `${i * 25}%` }}></div>
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={`v-${i}`} className="border-l border-slate-200 h-full absolute" style={{ left: `${i * 25}%` }}></div>
        ))}
      </div>

      {/* Quadrants Labels */}
      <div className="absolute top-8 right-8 text-xs font-bold text-slate-900 bg-white px-2 py-1 border border-slate-900 z-10 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        Success Zone
      </div>
      <div className="absolute bottom-8 right-8 text-xs font-bold text-white bg-slate-900 px-2 py-1 border border-slate-900 z-10 uppercase tracking-wider">
        Deception Zone
      </div>

      {/* Axes */}
      <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-slate-900"></div>
      <div className="absolute bottom-8 left-8 top-8 w-0.5 bg-slate-900"></div>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-900 uppercase tracking-widest">
        Visual Appeal (Swipe Rate)
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-900 uppercase tracking-widest origin-center whitespace-nowrap">
        Sensory Satisfaction (Rating)
      </div>

      {/* Points */}
      <div className="absolute inset-8">
        {MOCK_DISCONFIRMATION_DATA.map((point, idx) => {
          const isDeception = point.gap < -1.5;
          const isSuccess = point.gap >= -0.5;
          
          return (
            <div
              key={idx}
              className="absolute group cursor-pointer transition-all hover:z-20"
              style={{
                left: `${(point.visualAppeal / 100) * 100}%`,
                bottom: `${(point.sensoryRating / 5) * 100}%`,
              }}
            >
              <div className={`w-3 h-3 border border-slate-900 transition-transform group-hover:scale-150 ${
                isDeception ? 'bg-slate-900' :
                isSuccess ? 'bg-white rotate-45' :
                'bg-slate-400 rounded-full'
              }`}></div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-3 shadow-none whitespace-nowrap z-50 pointer-events-none border border-slate-900">
                <div className="font-bold font-mono uppercase mb-1">{point.product}</div>
                <div className="font-mono text-[10px]">Visual: {point.visualAppeal}% | Rating: {point.sensoryRating}★</div>
                {point.dominantBarrier && <div className="mt-1 pt-1 border-t border-slate-700 text-slate-300 italic">Barrier: {point.dominantBarrier}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CohortRow({ label, count, description, isLast }: any) {
  return (
    <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-slate-200' : ''}`}>
      <div>
        <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">{label}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">{description}</div>
      </div>
      <Badge variant="secondary" className="bg-white border border-slate-900 text-slate-900 rounded-none font-mono">
        {count} products
      </Badge>
    </div>
  );
}

function TagList({ tags, type, emptyMessage, isMock }: any) {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-mono uppercase">
        {emptyMessage}
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((t: any) => t.count));

  return (
    <div className="space-y-4">
      {isMock && (
        <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-xs text-slate-600 font-mono">
          <strong>Mock Data:</strong> Representative sample from Flint et al. (2025) meta-analysis. Real data will appear as users post reviews.
        </div>
      )}
      {tags.slice(0, 6).map((item: any, idx: number) => (
        <div key={idx} className="relative">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-1 text-slate-900">
            <span>{item.tag}</span>
            <span className="font-mono font-normal text-slate-500">{item.count}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 border border-slate-200">
            <div 
              className={`h-full border-r border-slate-900 ${type === 'barrier' ? 'bg-slate-800' : 'bg-slate-400'}`}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FunnelColumn({ title, subtitle, n, conversion, rating, tags, isWinner }: any) {
  return (
    <div className={`relative p-6 border ${isWinner ? 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-slate-300 border-dashed'}`}>
      {isWinner && (
        <div className="absolute -top-3 right-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest flex items-center gap-1 border border-slate-900">
          <CheckCircle2 className="w-3 h-3" />
          Validated
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-mono uppercase mt-1">{subtitle}</p>
      </div>

      <div className="space-y-6">
        <MetricRow label="Sample Size" value={n.toLocaleString()} />
        <MetricRow 
          label="Conversion Rate" 
          value={`${conversion}%`} 
          highlight={isWinner} 
        />
        <MetricRow 
          label="Mean Rating" 
          value={`${rating}★`} 
          highlight={isWinner} 
        />
        
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dominant Sensory Tags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className={`rounded-none font-mono text-[10px] uppercase ${
                isWinner ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
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

function MetricRow({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-end border-b border-slate-200 pb-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-mono text-xl font-bold ${
        highlight ? 'text-slate-900 underline decoration-2 underline-offset-4' : 'text-slate-500'
      }`}>
        {value}
      </span>
    </div>
  );
}

function ReferenceCitation({ author, year, title }: any) {
  return (
    <div className="text-xs text-slate-400 group hover:text-slate-900 transition-colors cursor-default font-serif">
      <span className="font-bold text-slate-600 font-sans uppercase text-[10px] tracking-wider mr-1 group-hover:text-slate-900">{author} ({year})</span> 
      <span className="italic">{title}</span>.
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
