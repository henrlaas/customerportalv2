
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AdPreview } from '../AdPreview';
import { FileInfo, WatchedFields } from '../types';
import { Platform } from '../../types/campaign';

interface AdDialogPreviewProps {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: Platform;
  limits: Record<string, number>;
  variation?: number;
}

export const AdDialogPreview = ({ 
  fileInfo, 
  watchedFields, 
  platform, 
  limits,
  variation = 0 
}: AdDialogPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col"
    >
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-background to-muted/20 h-full">
        <CardContent className="p-6 h-full">
          <div className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Ad Preview
          </div>
          <AdPreview
            fileInfo={fileInfo}
            watchedFields={watchedFields}
            platform={platform}
            limits={limits}
            variation={variation}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
