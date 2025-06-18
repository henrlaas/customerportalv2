
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PricingTab: React.FC = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    {
      id: '1',
      name: 'Basic',
      price: 29,
      description: 'Perfect for small teams getting started',
      features: ['Up to 5 users', 'Basic analytics', 'Email support', '10GB storage'],
    },
    {
      id: '2',
      name: 'Professional',
      price: 79,
      description: 'Ideal for growing businesses',
      features: ['Up to 25 users', 'Advanced analytics', 'Priority support', '100GB storage', 'Custom integrations'],
      popular: true,
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations with advanced needs',
      features: ['Unlimited users', 'Full analytics suite', '24/7 phone support', 'Unlimited storage', 'Custom features'],
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTier, setNewTier] = useState<Partial<PricingTier>>({
    name: '',
    price: 0,
    description: '',
    features: [],
  });

  const handleCreateTier = () => {
    if (newTier.name && newTier.price && newTier.description) {
      const tier: PricingTier = {
        id: Date.now().toString(),
        name: newTier.name,
        price: newTier.price,
        description: newTier.description,
        features: newTier.features || [],
      };
      setPricingTiers([...pricingTiers, tier]);
      setNewTier({ name: '', price: 0, description: '', features: [] });
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteTier = (id: string) => {
    setPricingTiers(pricingTiers.filter(tier => tier.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Pricing Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage pricing tiers and subscription plans for your services
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Tier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pricing Tier</DialogTitle>
              <DialogDescription>
                Add a new pricing tier for your services
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tier-name">Tier Name</Label>
                <Input
                  id="tier-name"
                  value={newTier.name || ''}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  placeholder="e.g., Professional"
                />
              </div>
              <div>
                <Label htmlFor="tier-price">Monthly Price ($)</Label>
                <Input
                  id="tier-price"
                  type="number"
                  value={newTier.price || ''}
                  onChange={(e) => setNewTier({ ...newTier, price: Number(e.target.value) })}
                  placeholder="79"
                />
              </div>
              <div>
                <Label htmlFor="tier-description">Description</Label>
                <Textarea
                  id="tier-description"
                  value={newTier.description || ''}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                  placeholder="Brief description of this tier"
                />
              </div>
              <Button onClick={handleCreateTier} className="w-full">
                Create Tier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pricing Tiers Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <Card key={tier.id} className={`relative ${tier.popular ? 'border-primary' : ''}`}>
            {tier.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5" />
                {tier.name}
              </CardTitle>
              <div className="text-3xl font-bold">${tier.price}</div>
              <div className="text-sm text-muted-foreground">per month</div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, index) => (
                  <li key={index} className="text-sm">
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTier(tier.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Analytics</CardTitle>
          <CardDescription>
            Overview of subscription metrics and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">$12,450</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Active Subscriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$79.80</div>
              <div className="text-sm text-muted-foreground">Average Revenue Per User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2.3%</div>
              <div className="text-sm text-muted-foreground">Churn Rate</div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Basic</TableCell>
                <TableCell>45</TableCell>
                <TableCell>$1,305</TableCell>
                <TableCell className="text-green-600">+5.2%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Professional</TableCell>
                <TableCell>87</TableCell>
                <TableCell>$6,873</TableCell>
                <TableCell className="text-green-600">+12.1%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Enterprise</TableCell>
                <TableCell>24</TableCell>
                <TableCell>$4,776</TableCell>
                <TableCell className="text-green-600">+8.7%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
