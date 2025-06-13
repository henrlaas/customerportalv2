
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  // Companies
  totalCompanies: number;
  marketingCompanies: number;
  webCompanies: number;
  totalMrr: number;
  totalContacts: number;
  
  // Projects
  totalProjects: number;
  totalProjectsValue: number;
  inProgressProjects: number;
  completedProjects: number;
  completedProjectsValue: number;
  overdueProjects: number;
  
  // Contracts
  totalContracts: number;
  signedContracts: number;
  unsignedContracts: number;
  
  // Tasks
  totalTasks: number;
  uncompletedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  
  // Campaigns
  totalCampaigns: number;
  totalAdsets: number;
  totalAds: number;
  platformDistribution: Array<{platform: string; count: number}>;
  
  // Deals
  totalDeals: number;
  totalDealsValue: number;
  
  // Users
  totalUsers: number;
  clientUsers: number;
  adminUsers: number;
  employeeUsers: number;
  
  // Files
  totalFiles: number;
  totalFileSize: number;
}

export const analyticsService = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    const [
      companiesData,
      projectsData,
      contractsData,
      tasksData,
      campaignsData,
      adsetsData,
      adsData,
      dealsData,
      usersData,
      filesData
    ] = await Promise.all([
      // Companies data
      supabase.from('companies').select('id, is_marketing_client, is_web_client, mrr'),
      
      // Projects data
      supabase.from('projects').select('id, value, deadline').then(async (projectsResult) => {
        if (projectsResult.error) throw projectsResult.error;
        
        // Get project statuses by checking milestones
        const projectIds = projectsResult.data.map(p => p.id);
        const milestonesResult = await supabase
          .from('milestones')
          .select('project_id, status')
          .in('project_id', projectIds);
        
        return { projectsResult, milestonesResult };
      }),
      
      // Contracts data
      supabase.from('contracts').select('id, status'),
      
      // Tasks data
      supabase.from('tasks').select('id, status, due_date'),
      
      // Campaigns data
      supabase.from('campaigns').select('id, platform'),
      
      // Adsets data
      supabase.from('adsets').select('id'),
      
      // Ads data
      supabase.from('ads').select('id'),
      
      // Deals data
      supabase.from('deals').select('id, value'),
      
      // Users data
      supabase.from('profiles').select('id, role'),
      
      // Files data (from media_metadata)
      supabase.from('media_metadata').select('id, file_size')
    ]);

    if (companiesData.error) throw companiesData.error;
    if (contractsData.error) throw contractsData.error;
    if (tasksData.error) throw tasksData.error;
    if (campaignsData.error) throw campaignsData.error;
    if (adsetsData.error) throw adsetsData.error;
    if (adsData.error) throw adsData.error;
    if (dealsData.error) throw dealsData.error;
    if (usersData.error) throw usersData.error;
    if (filesData.error) throw filesData.error;

    // Company contacts
    const contactsResult = await supabase.from('company_contacts').select('id');
    if (contactsResult.error) throw contactsResult.error;

    // Process companies data
    const companies = companiesData.data;
    const totalCompanies = companies.length;
    const marketingCompanies = companies.filter(c => c.is_marketing_client).length;
    const webCompanies = companies.filter(c => c.is_web_client).length;
    const totalMrr = companies.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const totalContacts = contactsResult.data.length;

    // Process projects data
    const { projectsResult, milestonesResult } = projectsData;
    if (projectsResult.error) throw projectsResult.error;
    if (milestonesResult.error) throw milestonesResult.error;

    const projects = projectsResult.data;
    const milestones = milestonesResult.data;
    
    // Group milestones by project to determine project status
    const projectStatusMap = new Map<string, string>();
    milestones.forEach(milestone => {
      const currentStatus = projectStatusMap.get(milestone.project_id) || 'created';
      if (milestone.status === 'completed' && currentStatus !== 'completed') {
        projectStatusMap.set(milestone.project_id, 'in_progress');
      } else if (milestone.status === 'completed') {
        projectStatusMap.set(milestone.project_id, 'completed');
      }
    });

    const totalProjects = projects.length;
    const totalProjectsValue = projects.reduce((sum, p) => sum + (p.value || 0), 0);
    
    const completedProjects = projects.filter(p => 
      projectStatusMap.get(p.id) === 'completed'
    ).length;
    
    const inProgressProjects = projects.filter(p => 
      projectStatusMap.get(p.id) === 'in_progress' || !projectStatusMap.has(p.id)
    ).length;
    
    const completedProjectsValue = projects
      .filter(p => projectStatusMap.get(p.id) === 'completed')
      .reduce((sum, p) => sum + (p.value || 0), 0);
    
    const now = new Date();
    const overdueProjects = projects.filter(p => 
      p.deadline && new Date(p.deadline) < now && projectStatusMap.get(p.id) !== 'completed'
    ).length;

    // Process contracts data
    const contracts = contractsData.data;
    const totalContracts = contracts.length;
    const signedContracts = contracts.filter(c => c.status === 'signed').length;
    const unsignedContracts = contracts.filter(c => c.status === 'unsigned').length;

    // Process tasks data
    const tasks = tasksData.data;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const uncompletedTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length;

    // Process campaigns data
    const campaigns = campaignsData.data;
    const totalCampaigns = campaigns.length;
    
    // Platform distribution
    const platformCounts = campaigns.reduce((acc, campaign) => {
      const platform = campaign.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const platformDistribution = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count
    }));

    // Process other data
    const totalAdsets = adsetsData.data.length;
    const totalAds = adsData.data.length;

    const deals = dealsData.data;
    const totalDeals = deals.length;
    const totalDealsValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

    const users = usersData.data;
    const totalUsers = users.length;
    const clientUsers = users.filter(u => u.role === 'client').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const employeeUsers = users.filter(u => u.role === 'employee').length;

    const files = filesData.data;
    const totalFiles = files.length;
    const totalFileSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);

    return {
      totalCompanies,
      marketingCompanies,
      webCompanies,
      totalMrr,
      totalContacts,
      totalProjects,
      totalProjectsValue,
      inProgressProjects,
      completedProjects,
      completedProjectsValue,
      overdueProjects,
      totalContracts,
      signedContracts,
      unsignedContracts,
      totalTasks,
      uncompletedTasks,
      completedTasks,
      overdueTasks,
      totalCampaigns,
      totalAdsets,
      totalAds,
      platformDistribution,
      totalDeals,
      totalDealsValue,
      totalUsers,
      clientUsers,
      adminUsers,
      employeeUsers,
      totalFiles,
      totalFileSize
    };
  }
};
