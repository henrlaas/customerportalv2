
import React, { useState } from 'react';
import { Palette, Type, Layout, MousePointer, Bell, Grid, Layers } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-7 mb-8">
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
