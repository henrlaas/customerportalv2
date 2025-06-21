
import React, { useState } from 'react';
import { Palette, Type, Layout, MousePointer, Bell, Grid, Layers, TrendingUp, Users, DollarSign, Target, Clock, Award, Activity, Building, Briefcase, CheckCircle, AlertCircle, ArrowUpIcon, ArrowDownIcon, CreditCard, Archive, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const UILibraryPage = () => {
  const [activeTab, setActiveTab] = useState('foundations');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const categories = [
    { id: 'foundations', label: 'Foundations', icon: Palette },
    { id: 'forms', label: 'Form Elements', icon: MousePointer },
    { id: 'display', label: 'Data Display', icon: Grid },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'navigation', label: 'Navigation', icon: Layout },
    { id: 'feedback', label: 'Feedback', icon: Bell },
    { id: 'layout', label: 'Layout', icon: Layers },
    { id: 'complex', label: 'Complex', icon: Type },
  ];

  const colorPalette = [
    { name: 'Primary (Evergreen)', color: '#004743', usage: 'Primary actions, branding' },
    { name: 'Primary Light', color: '#F2FCE2', usage: 'Backgrounds, highlights' },
    { name: 'Background', color: 'hsl(0 0% 100%)', usage: 'Main background' },
    { name: 'Foreground', color: 'hsl(222.2 84% 4.9%)', usage: 'Text content' },
    { name: 'Muted', color: 'hsl(210 40% 96.1%)', usage: 'Subtle backgrounds' },
    { name: 'Border', color: 'hsl(214.3 31.8% 91.4%)', usage: 'Borders, dividers' },
    { name: 'Destructive', color: 'hsl(0 84.2% 60.2%)', usage: 'Error states' },
    { name: 'Success', color: 'hsl(142.1 76.2% 36.3%)', usage: 'Success states' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
          <Palette className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Design System</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          UI Component Library
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive collection of reusable components built with consistency, accessibility, 
          and our brand identity in mind. Featuring our signature evergreen (#004743) and light green (#F2FCE2) palette.
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Foundations Tab */}
        <TabsContent value="foundations" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Design Foundations</h2>
            
            {/* Color Palette */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {colorPalette.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div 
                        className="h-20 rounded-lg border shadow-sm"
                        style={{ backgroundColor: color.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{color.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{color.color}</p>
                        <p className="text-xs text-muted-foreground">{color.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold">Heading 1 - Bold, 36px</h1>
                  <h2 className="text-3xl font-bold">Heading 2 - Bold, 30px</h2>
                  <h3 className="text-2xl font-bold">Heading 3 - Bold, 24px</h3>
                  <h4 className="text-xl font-semibold">Heading 4 - Semibold, 20px</h4>
                  <p className="text-base">Body text - Regular, 16px</p>
                  <p className="text-sm text-muted-foreground">Small text - Regular, 14px</p>
                  <p className="text-xs text-muted-foreground">Extra small - Regular, 12px</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Form Elements Tab */}
        <TabsContent value="forms" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button disabled>Disabled</Button>
                    <Button disabled>Loading...</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Input Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Input Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Text Input</Label>
                    <Input id="text-input" placeholder="Enter text..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-input">Email Input</Label>
                    <Input id="email-input" type="email" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-input">Password Input</Label>
                    <Input id="password-input" type="password" placeholder="Password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea">Textarea</Label>
                    <Textarea id="textarea" placeholder="Enter description..." />
                  </div>
                </CardContent>
              </Card>

              {/* Select & Dropdowns */}
              <Card>
                <CardHeader>
                  <CardTitle>Select & Dropdowns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Option</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Checkboxes & Radio */}
              <Card>
                <CardHeader>
                  <CardTitle>Checkboxes & Radio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="checkbox1" />
                      <Label htmlFor="checkbox1">Checkbox option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="checkbox2" />
                      <Label htmlFor="checkbox2">Checkbox option 2</Label>
                    </div>
                  </div>
                  <Separator />
                  <RadioGroup defaultValue="radio1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radio1" id="radio1" />
                      <Label htmlFor="radio1">Radio option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radio2" id="radio2" />
                      <Label htmlFor="radio2">Radio option 2</Label>
                    </div>
                  </RadioGroup>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Switch id="switch" />
                    <Label htmlFor="switch">Toggle switch</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Data Display Tab */}
        <TabsContent value="display" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Data Display</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This is a basic card with header and content.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-primary">Highlighted Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This card uses our primary color theme.
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Badges & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Progress & Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress & Loading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Progress</span>
                      <span>80%</span>
                    </div>
                    <Progress value={80} className="[&>div]:bg-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Avatars */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">AB</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">CD</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Card Library</h2>
            <p className="text-muted-foreground mb-8">
              A comprehensive collection of 22 different card designs for various use cases, 
              featuring our brand colors and multi-information layouts.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Total Revenue */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 1: Total Revenue</h4>
                <Card className="border-l-4 border-l-primary bg-gradient-to-br from-white to-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-1">$124,573</div>
                    <div className="flex items-center text-xs text-green-600">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      +12.5% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 2: User Profile */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 2: User Profile</h4>
                <Card className="bg-gradient-to-br from-white to-[#F2FCE2]/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">John Doe</CardTitle>
                        <p className="text-sm text-gray-600">Senior Developer</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Active Projects</span>
                      <Badge className="bg-primary/10 text-primary">3</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 3: Project Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 3: Project Status</h4>
                <Card className="border-primary/20 bg-[#F2FCE2]/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Website Redesign</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="text-primary font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <div className="text-xs text-gray-600">Due: Dec 15, 2024</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 4: Financial Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 4: Financial Summary</h4>
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-gray-700">Monthly Recurring Revenue</CardTitle>
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">$45,280</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 flex items-center">
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                        +8.2%
                      </span>
                      <span className="text-gray-600">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 5: Alert/Notification */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 5: Alert/Notification</h4>
                <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-sm text-orange-800">Action Required</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 mb-3">
                      Contract renewal deadline approaching
                    </p>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Review Contract
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Card 6: Feature Highlight */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 6: Feature Highlight</h4>
                <Card className="bg-gradient-to-br from-[#F2FCE2] to-white border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm text-primary">New Feature</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">
                      AI-powered content generation is now available!
                    </p>
                    <Button size="sm" variant="outline" className="border-primary text-primary">
                      Try It Now
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Card 7: Activity Feed */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 7: Activity Feed</h4>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm">Recent Activity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-600">Task completed</span>
                        <span className="text-gray-400">2h ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Meeting scheduled</span>
                        <span className="text-gray-400">4h ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Deal closed</span>
                        <span className="text-gray-400">1d ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 8: Company Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 8: Company Information</h4>
                <Card className="bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm">Acme Corporation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Industry:</span>
                        <span>Technology</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employees:</span>
                        <span>250+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Founded:</span>
                        <span>2015</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 9: Deal/Opportunity */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 9: Deal/Opportunity</h4>
                <Card className="border-l-4 border-l-green-500 bg-green-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Enterprise Deal</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Hot Lead</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-green-700 mb-1">$75,000</div>
                    <div className="text-xs text-gray-600 mb-2">Expected close: Q1 2025</div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Probability:</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 10: Quick Action */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 10: Quick Action</h4>
                <Card className="bg-gradient-to-br from-primary/10 to-[#F2FCE2]/50 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm text-primary">Quick Actions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start" variant="ghost">
                        <Users className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                      <Button size="sm" className="w-full justify-start" variant="ghost">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 11: Time Tracking */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 11: Time Tracking</h4>
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-blue-800">Time Logged Today</CardTitle>
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700 mb-1">6h 45m</div>
                    <div className="text-xs text-blue-600">Target: 8h 00m</div>
                    <Progress value={84} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Card 12: Success/Achievement */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 12: Success/Achievement</h4>
                <Card className="bg-gradient-to-br from-[#F2FCE2] to-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-sm text-green-800">Goal Achieved!</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-2">
                      Monthly sales target exceeded by 15%
                    </p>
                    <Badge className="bg-green-600 text-white">Congratulations!</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Card 13: My Tasks */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 13: My Tasks</h4>
                <Card className="border-l-4 border-l-primary bg-gradient-to-br from-white to-[#F2FCE2]/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">My Tasks</CardTitle>
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total Tasks</span>
                        <span className="text-lg font-bold text-primary">24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Completed</span>
                        <span className="text-sm font-semibold text-green-600">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Overdue</span>
                        <span className="text-sm font-semibold text-red-600">2</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 14: Team Performance */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 14: Team Performance</h4>
                <Card className="bg-gradient-to-br from-[#F2FCE2]/30 to-white border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Team Performance</CardTitle>
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Members</span>
                        <span className="text-lg font-bold text-primary">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Projects Completed</span>
                        <span className="text-sm font-semibold text-green-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Avg Efficiency</span>
                        <span className="text-sm font-semibold text-primary">92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 15: Sales Pipeline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 15: Sales Pipeline</h4>
                <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Sales Pipeline</CardTitle>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Leads</span>
                        <span className="text-lg font-bold text-blue-600">47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Conversions</span>
                        <span className="text-sm font-semibold text-green-600">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pipeline Value</span>
                        <span className="text-sm font-semibold text-primary">$280K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 16: Campaign Analytics */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 16: Campaign Analytics</h4>
                <Card className="bg-gradient-to-br from-purple-50/50 to-white border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Campaign Analytics</CardTitle>
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Campaigns</span>
                        <span className="text-lg font-bold text-purple-600">6</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Impressions</span>
                        <span className="text-sm font-semibold text-primary">125K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Conversion Rate</span>
                        <span className="text-sm font-semibold text-green-600">3.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 17: Financial Overview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 17: Financial Overview</h4>
                <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-[#F2FCE2]/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Financial Overview</CardTitle>
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Revenue</span>
                        <span className="text-lg font-bold text-primary">$89,450</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Expenses</span>
                        <span className="text-sm font-semibold text-red-600">$32,100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Profit Margin</span>
                        <span className="text-sm font-semibold text-green-600">64%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 18: Project Health */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 18: Project Health</h4>
                <Card className="bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Project Health</CardTitle>
                      <Briefcase className="h-5 w-5 text-emerald-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">On Track</span>
                        <span className="text-lg font-bold text-emerald-600">15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">At Risk</span>
                        <span className="text-sm font-semibold text-yellow-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Overdue</span>
                        <span className="text-sm font-semibold text-red-600">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 19: Client Satisfaction */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 19: Client Satisfaction</h4>
                <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Client Satisfaction</CardTitle>
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Happy Clients</span>
                        <span className="text-lg font-bold text-amber-600">94%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pending Reviews</span>
                        <span className="text-sm font-semibold text-primary">7</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Support Tickets</span>
                        <span className="text-sm font-semibold text-orange-600">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 20: Inventory Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 20: Inventory Status</h4>
                <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Inventory Status</CardTitle>
                      <Archive className="h-5 w-5 text-indigo-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Items in Stock</span>
                        <span className="text-lg font-bold text-indigo-600">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Low Stock Alerts</span>
                        <span className="text-sm font-semibold text-orange-600">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pending Orders</span>
                        <span className="text-sm font-semibold text-primary">35</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 21: System Monitoring */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 21: System Monitoring</h4>
                <Card className="border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50/50 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">System Monitoring</CardTitle>
                      <Activity className="h-5 w-5 text-teal-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Server Uptime</span>
                        <span className="text-lg font-bold text-teal-600">99.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Active Users</span>
                        <span className="text-sm font-semibold text-primary">2,341</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pending Updates</span>
                        <span className="text-sm font-semibold text-orange-600">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 22: Learning Progress */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Card 22: Learning Progress</h4>
                <Card className="bg-gradient-to-br from-[#F2FCE2]/40 to-primary/5 border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Learning Progress</CardTitle>
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Courses Completed</span>
                        <span className="text-lg font-bold text-primary">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Hours Learned</span>
                        <span className="text-sm font-semibold text-green-600">87h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Certifications</span>
                        <span className="text-sm font-semibold text-primary">4</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Navigation Elements</h2>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Tabs Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Tabs Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tab1">Overview</TabsTrigger>
                      <TabsTrigger value="tab2">Analytics</TabsTrigger>
                      <TabsTrigger value="tab3">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="mt-4">
                      <p className="text-sm text-muted-foreground">Overview content goes here...</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="mt-4">
                      <p className="text-sm text-muted-foreground">Analytics content goes here...</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="mt-4">
                      <p className="text-sm text-muted-foreground">Settings content goes here...</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Feedback Elements</h2>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      This is an informational alert with useful information.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="border-green-200 bg-green-50">
                    <Bell className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Operation completed successfully!
                    </AlertDescription>
                  </Alert>
                  
                  <Alert variant="destructive">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Please try again.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Layout Components</h2>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Separators & Dividers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Horizontal separator:</p>
                    <Separator />
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">Vertical</span>
                    <Separator orientation="vertical" className="h-6" />
                    <span className="text-sm">separator</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collapsible Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Click to expand
                        <span className="text-xs">▼</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 p-4 border rounded">
                      <p className="text-sm text-muted-foreground">
                        This content is collapsible and can be toggled on and off.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Complex Components Tab */}
        <TabsContent value="complex" className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Complex Components</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Component Usage Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">Best Practices:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Use consistent spacing (4px, 8px, 16px, 24px)</li>
                      <li>Maintain color contrast ratios for accessibility</li>
                      <li>Provide hover and focus states for interactive elements</li>
                      <li>Use loading states for async operations</li>
                      <li>Include proper ARIA labels for screen readers</li>
                    </ul>
                  </div>
                  <Separator />
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">Brand Colors Usage:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><span className="font-mono">#004743</span> - Primary actions, CTAs</li>
                      <li><span className="font-mono">#F2FCE2</span> - Success states, highlights</li>
                      <li>Use sparingly to maintain visual hierarchy</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UILibraryPage;
