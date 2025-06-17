
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

export const GreetingCard = () => {
  const { profile } = useAuth();
  const currentDate = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1">
              Welcome back, {profile?.first_name} 👋
            </h1>
            <p className="text-muted-foreground">
              {currentDate}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Have a productive day!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
