
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAdDialog } from '../Ads/CreateAdDialog';
import { EditAdSetDialog } from './EditAdSetDialog';
import { DeleteAdSetDialog } from './DeleteAdSetDialog';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  adset: any;
  onUpdate?: () => void;
  disableModifications?: boolean;
}

export function AdSetCard({ adset, onUpdate, disableModifications = false }: Props) {
  return (
    <Card className="overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Link to={`/adsets/${adset.id}`} className="hover:underline">
            <CardTitle className="text-lg">{adset.name}</CardTitle>
          </Link>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <EditAdSetDialog 
                    adset={adset} 
                    onSuccess={onUpdate}
                    disabled={disableModifications}
                    trigger={
                      <Button variant="ghost" size="icon" disabled={disableModifications}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    } 
                  />
                </TooltipTrigger>
                <TooltipContent>Edit Ad Set</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <DeleteAdSetDialog 
                    adsetId={adset.id} 
                    adsetName={adset.name} 
                    onSuccess={onUpdate}
                    disabled={disableModifications}
                    trigger={
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" disabled={disableModifications}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    } 
                  />
                </TooltipTrigger>
                <TooltipContent>Delete Ad Set</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      {adset.targeting && (
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium">Targeting:</span> {adset.targeting}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
