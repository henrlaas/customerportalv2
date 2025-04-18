
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  ad: any;
  campaignPlatform?: string;
}

export function AdCard({ ad, campaignPlatform }: Props) {
  const [currentVariation, setCurrentVariation] = useState(0);
  
  // Safely parse JSON strings with error handling
  const safeParseJson = (jsonString: string | null) => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      return [];
    }
  };
  
  // Parse the variations from JSON strings with safe parsing
  const headlineVariations = safeParseJson(ad.headline_variations);
  const descriptionVariations = safeParseJson(ad.description_variations);
  const mainTextVariations = safeParseJson(ad.main_text_variations);
  const keywordsVariations = safeParseJson(ad.keywords_variations);
  
  // Calculate total variations (headline is most common, so we use it as reference)
  const totalVariations = 1 + headlineVariations.length; // Base + variations
  
  const getVariationValue = (field: string, variation: number) => {
    if (variation === 0) {
      return ad[field];
    }
    
    const variationsArray = {
      headline: headlineVariations,
      description: descriptionVariations,
      main_text: mainTextVariations,
      keywords: keywordsVariations
    }[field];
    
    return variationsArray && variationsArray[variation - 1]?.text;
  };

  const nextVariation = () => {
    setCurrentVariation((prev) => (prev + 1) % totalVariations);
  };

  const prevVariation = () => {
    setCurrentVariation((prev) => (prev - 1 + totalVariations) % totalVariations);
  };

  return (
    <Card className="overflow-hidden relative">
      {/* Navigation buttons when there are multiple variations */}
      {totalVariations > 1 && (
        <div className="absolute inset-y-0 top-auto bottom-auto left-0 right-0 flex justify-between items-center px-1 z-10 pointer-events-none">
          <Button
            onClick={prevVariation}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 shadow-md hover:bg-background pointer-events-auto"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={nextVariation}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 shadow-md hover:bg-background pointer-events-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {totalVariations > 1 && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full">
            {currentVariation + 1} / {totalVariations}
          </span>
        </div>
      )}
      
      {ad.file_url && (
        <div className="relative h-48 bg-muted">
          {ad.ad_type === 'image' ? (
            <img 
              src={ad.file_url} 
              alt={ad.name} 
              className="w-full h-full object-cover"
            />
          ) : ad.ad_type === 'video' ? (
            <video 
              src={ad.file_url} 
              controls 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              File: {ad.file_type}
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{ad.name}</CardTitle>
          <Badge variant="outline">{ad.ad_type}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm space-y-2">
        {getVariationValue('headline', currentVariation) && (
          <p>
            <span className="font-medium">Headline:</span> {getVariationValue('headline', currentVariation)}
          </p>
        )}
        {getVariationValue('description', currentVariation) && (
          <p>
            <span className="font-medium">Description:</span> {getVariationValue('description', currentVariation)}
          </p>
        )}
        {getVariationValue('main_text', currentVariation) && (
          <p>
            <span className="font-medium">Main Text:</span> {getVariationValue('main_text', currentVariation)}
          </p>
        )}
        {getVariationValue('keywords', currentVariation) && (
          <p>
            <span className="font-medium">Keywords:</span> {getVariationValue('keywords', currentVariation)}
          </p>
        )}
        {ad.brand_name && (
          <p>
            <span className="font-medium">Brand:</span> {ad.brand_name}
          </p>
        )}
        {ad.cta_button && (
          <div className="mt-3">
            <span className="font-medium">CTA Button:</span>
            <span className="inline-block ml-2 px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md">
              {ad.cta_button}
            </span>
          </div>
        )}
        
        {ad.url && (
          <p>
            <span className="font-medium">URL:</span> {ad.url}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
