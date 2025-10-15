'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Gift,
  Building,
  BookOpen,
  Star,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  campaignId?: string;
  campaignName?: string;
  donationType: 'one-time' | 'recurring' | 'pledge';
  frequency?: 'monthly' | 'quarterly' | 'annually';
  date: string;
  status: 'completed' | 'pending' | 'processing';
  isAnonymous: boolean;
  message?: string;
  receiptUrl?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: 'scholarship' | 'infrastructure' | 'research' | 'programs' | 'emergency';
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  donorCount: number;
  image?: string;
}

interface DonationImpact {
  category: string;
  totalAmount: number;
  donorCount: number;
  projects: string[];
  impact: string;
}

export default function AlumniDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [impacts, setImpacts] = useState<DonationImpact[]>([]);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [donationForm, setDonationForm] = useState<{
    amount: string;
    currency: string;
    donationType: 'one-time' | 'recurring' | 'pledge';
    frequency: 'monthly' | 'quarterly' | 'annually';
    isAnonymous: boolean;
    message: string;
  }>({
    amount: '',
    currency: 'USD',
    donationType: 'one-time',
    frequency: 'monthly',
    isAnonymous: false,
    message: ''
  });

  useEffect(() => {
    // Simulate API calls
    const fetchDonationsData = async () => {
      // Mock donations
      const mockDonations: Donation[] = [
        {
          id: '1',
          amount: 500,
          currency: 'USD',
          campaignId: '1',
          campaignName: 'Student Scholarship Fund',
          donationType: 'one-time',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          isAnonymous: false,
          message: 'Happy to support the next generation of students!',
          receiptUrl: '/receipts/donation_1.pdf'
        },
        {
          id: '2',
          amount: 100,
          currency: 'USD',
          donationType: 'recurring',
          frequency: 'monthly',
          date: '2024-01-10T14:20:00Z',
          status: 'completed',
          isAnonymous: true,
          receiptUrl: '/receipts/donation_2.pdf'
        },
        {
          id: '3',
          amount: 1000,
          currency: 'USD',
          campaignId: '2',
          campaignName: 'New Library Building',
          donationType: 'one-time',
          date: '2024-01-05T09:15:00Z',
          status: 'completed',
          isAnonymous: false,
          message: 'Investing in knowledge and education for future generations.',
          receiptUrl: '/receipts/donation_3.pdf'
        }
      ];

      // Mock campaigns
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Student Scholarship Fund',
          description: 'Help deserving students pursue their dreams by contributing to our scholarship fund. Your donation can make education accessible to talented students regardless of their financial background.',
          category: 'scholarship',
          targetAmount: 100000,
          currentAmount: 75000,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          status: 'active',
          donorCount: 156
        },
        {
          id: '2',
          title: 'New Library Building',
          description: 'Support the construction of a state-of-the-art library that will serve thousands of students for decades to come. This modern facility will include study spaces, digital resources, and collaborative areas.',
          category: 'infrastructure',
          targetAmount: 500000,
          currentAmount: 320000,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-06-30T23:59:59Z',
          status: 'active',
          donorCount: 89
        },
        {
          id: '3',
          title: 'Research Innovation Grant',
          description: 'Fund cutting-edge research projects that have the potential to change the world. Your donation supports faculty and student researchers in their pursuit of groundbreaking discoveries.',
          category: 'research',
          targetAmount: 250000,
          currentAmount: 180000,
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-08-31T23:59:59Z',
          status: 'active',
          donorCount: 45
        },
        {
          id: '4',
          title: 'Emergency Student Aid',
          description: 'Provide immediate financial assistance to students facing unexpected hardships. This fund helps students stay in school during difficult times.',
          category: 'emergency',
          targetAmount: 50000,
          currentAmount: 50000,
          startDate: '2023-12-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          status: 'completed',
          donorCount: 67
        }
      ];

      // Mock impact data
      const mockImpacts: DonationImpact[] = [
        {
          category: 'Education',
          totalAmount: 125000,
          donorCount: 156,
          projects: ['Scholarship Fund', 'Student Aid Program'],
          impact: 'Helped 50+ students continue their education'
        },
        {
          category: 'Infrastructure',
          totalAmount: 320000,
          donorCount: 89,
          projects: ['New Library Building', 'Lab Renovation'],
          impact: 'Creating modern learning spaces for 5000+ students'
        },
        {
          category: 'Research',
          totalAmount: 180000,
          donorCount: 45,
          projects: ['Innovation Grant', 'Research Equipment'],
          impact: 'Supported 15+ research projects'
        }
      ];

      setDonations(mockDonations);
      setCampaigns(mockCampaigns);
      setImpacts(mockImpacts);
    };

    fetchDonationsData();
  }, []);

  const handleDonate = async () => {
    if (!user) return;

    const newDonation: Donation = {
      id: Date.now().toString(),
      amount: parseFloat(donationForm.amount),
      currency: donationForm.currency,
      campaignId: selectedCampaign || undefined,
      campaignName: campaigns.find(c => c.id === selectedCampaign)?.title,
      donationType: donationForm.donationType,
      frequency: donationForm.frequency,
      date: new Date().toISOString(),
      status: 'processing',
      isAnonymous: donationForm.isAnonymous,
      message: donationForm.message
    };

    // Update local state
    setDonations(prev => [newDonation, ...prev]);

    // Update campaign amount if donated to a campaign
    if (selectedCampaign) {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === selectedCampaign
          ? { ...campaign, currentAmount: campaign.currentAmount + newDonation.amount, donorCount: campaign.donorCount + 1 }
          : campaign
      ));
    }

    // Reset form and close dialog
    setDonationForm({
      amount: '',
      currency: 'USD',
      donationType: 'one-time',
      frequency: 'monthly',
      isAnonymous: false,
      message: ''
    });
    setSelectedCampaign('');
    setShowDonationDialog(false);
  };

  const getCampaignCategoryBadge = (category: string) => {
    switch (category) {
      case 'scholarship':
        return <Badge className="bg-blue-100 text-blue-800">Scholarship</Badge>;
      case 'infrastructure':
        return <Badge className="bg-green-100 text-green-800">Infrastructure</Badge>;
      case 'research':
        return <Badge className="bg-purple-100 text-purple-800">Research</Badge>;
      case 'programs':
        return <Badge className="bg-orange-100 text-orange-800">Programs</Badge>;
      case 'emergency':
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getDonationStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const donationCount = donations.length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Giving Back</h1>
          <p className="text-slate-600 mt-2">Make a difference through donations and support our community</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalDonated.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Donated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{donationCount}</div>
            <div className="text-sm text-slate-600">Donations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{activeCampaigns}</div>
            <div className="text-sm text-slate-600">Active Campaigns</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="my-donations">My Donations</TabsTrigger>
          <TabsTrigger value="impact">My Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Donate Button */}
          <div className="flex justify-end">
            <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Heart className="h-4 w-4 mr-2" />
                  Make a Donation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Make a Donation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign">Campaign (Optional)</Label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign or donate generally" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">General Donation</SelectItem>
                        {campaigns.filter(c => c.status === 'active').map(campaign => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount ({donationForm.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={donationForm.currency} onValueChange={(value) => setDonationForm(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Donation Type</Label>
                      <Select value={donationForm.donationType} onValueChange={(value: any) => setDonationForm(prev => ({ ...prev, donationType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-Time</SelectItem>
                          <SelectItem value="recurring">Recurring</SelectItem>
                          <SelectItem value="pledge">Pledge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {donationForm.donationType === 'recurring' && (
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={donationForm.frequency} onValueChange={(value: any) => setDonationForm(prev => ({ ...prev, frequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Input
                      id="message"
                      value={donationForm.message}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a personal message..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={donationForm.isAnonymous}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="anonymous">Make this donation anonymous</Label>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleDonate} className="flex-1" disabled={!donationForm.amount}>
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Now
                    </Button>
                    <Button variant="outline" onClick={() => setShowDonationDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{campaign.title}</h3>
                        {getCampaignCategoryBadge(campaign.category)}
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-slate-600 mb-4">{campaign.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>${campaign.currentAmount.toLocaleString()} / ${campaign.targetAmount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(campaign.currentAmount / campaign.targetAmount) * 100} 
                        className="h-2"
                      />
                      <div className="text-sm text-slate-600 mt-1">
                        {Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}% funded
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{campaign.donorCount} donors</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>Ends {formatDate(campaign.endDate)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedCampaign(campaign.id);
                        setShowDonationDialog(true);
                      }}
                      disabled={campaign.status === 'completed'}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {campaign.status === 'completed' ? 'Campaign Completed' : 'Donate Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-donations" className="space-y-6">
          <div className="space-y-4">
            {donations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {donation.campaignName ? donation.campaignName : 'General Donation'}
                        </h3>
                        {getDonationStatusBadge(donation.status)}
                        <Badge className="bg-blue-100 text-blue-800">
                          {donation.donationType === 'one-time' ? 'One-Time' : 
                           donation.donationType === 'recurring' ? `Recurring (${donation.frequency})` : 'Pledge'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{donation.currency} {donation.amount.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(donation.date)}</span>
                        </span>
                        {donation.isAnonymous && (
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>Anonymous</span>
                          </span>
                        )}
                      </div>

                      {donation.message && (
                        <p className="text-slate-700 mb-4 italic">"{donation.message}"</p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          {donation.receiptUrl && (
                            <a 
                              href={donation.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              <Gift className="h-4 w-4" />
                              <span>View Receipt</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Heart className="h-8 w-8 mx-auto text-red-600" />
                <CardTitle className="text-2xl">${totalDonated.toLocaleString()}</CardTitle>
                <CardDescription>Total Contributed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Award className="h-8 w-8 mx-auto text-yellow-600" />
                <CardTitle className="text-2xl">{donationCount}</CardTitle>
                <CardDescription>Total Donations</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Trophy className="h-8 w-8 mx-auto text-purple-600" />
                <CardTitle className="text-2xl">
                  {impacts.reduce((total, impact) => total + impact.donorCount, 0)}
                </CardTitle>
                <CardDescription>Lives Impacted</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-600" />
                <CardTitle className="text-2xl">
                  {impacts.reduce((total, impact) => total + impact.projects.length, 0)}
                </CardTitle>
                <CardDescription>Projects Supported</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6">
            {impacts.map((impact, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {impact.category === 'Education' && <BookOpen className="h-5 w-5" />}
                    {impact.category === 'Infrastructure' && <Building className="h-5 w-5" />}
                    {impact.category === 'Research' && <Target className="h-5 w-5" />}
                    <span>{impact.category}</span>
                  </CardTitle>
                  <CardDescription>Your contribution to this area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${impact.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-slate-600">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{impact.donorCount}</div>
                      <div className="text-sm text-slate-600">Donors Supported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{impact.projects.length}</div>
                      <div className="text-sm text-slate-600">Projects</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Projects Supported:</h4>
                      <div className="flex flex-wrap gap-2">
                        {impact.projects.map((project, idx) => (
                          <Badge key={idx} variant="outline">{project}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">Impact:</h4>
                      <p className="text-sm text-green-800">{impact.impact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recognition & Achievements</CardTitle>
              <CardDescription>Your contribution milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <h4 className="font-medium">First Donation</h4>
                  <p className="text-sm text-slate-600">Thank you for your first contribution!</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <h4 className="font-medium">Generous Supporter</h4>
                  <p className="text-sm text-slate-600">Over $1,000 in total donations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <h4 className="font-medium">Community Champion</h4>
                  <p className="text-sm text-slate-600">Multiple campaign supporter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}