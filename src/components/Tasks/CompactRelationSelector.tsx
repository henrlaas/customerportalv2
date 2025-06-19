
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types/timeTracking';

// Define Campaign type locally since it's not available in the imports
type Campaign = {
  id: string;
  name: string;
  company_id: string;
};

interface CompactRelationSelectorProps {
  relatedType: 'none' | 'campaign' | 'project';
  onRelatedTypeChange: (type: 'none' | 'campaign' | 'project') => void;
  campaigns: Campaign[];
  projects: Project[];
  selectedCampaignId?: string;
  selectedProjectId?: string;
  onCampaignChange: (campaignId: string) => void;
  onProjectChange: (projectId: string) => void;
  isLoadingProjects?: boolean;
}

export function CompactRelationSelector({
  relatedType,
  onRelatedTypeChange,
  campaigns,
  projects,
  selectedCampaignId,
  selectedProjectId,
  onCampaignChange,
  onProjectChange,
  isLoadingProjects = false
}: CompactRelationSelectorProps) {
  return (
    <div className="space-y-3 p-4 border rounded-md bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Related to:</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={relatedType === 'none' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onRelatedTypeChange('none')}
          >
            None
          </Button>
          <Button
            type="button"
            variant={relatedType === 'campaign' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onRelatedTypeChange('campaign')}
          >
            Campaign
          </Button>
          <Button
            type="button"
            variant={relatedType === 'project' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onRelatedTypeChange('project')}
          >
            Project
          </Button>
        </div>
      </div>

      {relatedType === 'campaign' && (
        <Select value={selectedCampaignId} onValueChange={onCampaignChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.length === 0 ? (
              <SelectItem value="no-campaigns" disabled>
                No campaigns available for this company
              </SelectItem>
            ) : (
              campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {relatedType === 'project' && (
        <Select value={selectedProjectId} onValueChange={onProjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingProjects ? (
              <SelectItem value="loading" disabled>
                Loading projects...
              </SelectItem>
            ) : projects.length === 0 ? (
              <SelectItem value="no-projects" disabled>
                No projects available for this company
              </SelectItem>
            ) : (
              projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
