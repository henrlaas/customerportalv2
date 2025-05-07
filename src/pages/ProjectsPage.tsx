
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileClock, Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ContractsDashboard } from '@/components/Projects/ContractsDashboard';
import { ProjectContractTab } from '@/components/Projects/ProjectContractTab';

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  creator?: {
    profiles?: Array<{
      first_name: string;
      last_name: string;
    }>;
  };
};

type ProjectFormValues = {
  name: string;
  description: string;
};

const ProjectsPage = () => {
  const { user, profile, isAdmin, isEmployee } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:created_by (
            profiles:profiles (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: values.name,
            description: values.description,
            created_by: user.id
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      setIsCreateDialogOpen(false);
      form.reset();
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className="container p-6 mx-auto">
      {/* Dashboard stats */}
      {(isAdmin || isEmployee) && !selectedProject && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Contracts Overview</h2>
            <ContractsDashboard />
          </div>
          <div className="border-t my-6"></div>
        </>
      )}
      
      {/* Projects heading and create button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {selectedProject ? selectedProject.name : 'Projects'}
        </h1>
        <div className="flex space-x-2">
          {selectedProject && (
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Back to Projects
            </Button>
          )}
          {(isAdmin || isEmployee) && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>
      
      {/* Project detail view */}
      {selectedProject ? (
        <div className="space-y-6">
          {/* Project info card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <h3 className="font-medium text-lg">Description</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Created by</span>
                      <p>
                        {selectedProject.creator?.profiles?.[0]?.first_name || ''}{' '}
                        {selectedProject.creator?.profiles?.[0]?.last_name || ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created on</span>
                      <p>{format(new Date(selectedProject.created_at), 'PPP')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different project sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Project overview content will appear here.</p>
              </div>
            </TabsContent>
            <TabsContent value="contracts" className="mt-6">
              <ProjectContractTab projectId={selectedProject.id} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Projects list
        <div>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">Loading projects...</p>
              </div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id}
                  className="hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleProjectClick(project)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <FileClock className="h-5 w-5 mr-2 text-primary" />
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description || "No description provided."}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>Created: {format(new Date(project.created_at), 'PPP')}</p>
                      <p>
                        By: {project.creator?.profiles?.[0]?.first_name || ''}{' '}
                        {project.creator?.profiles?.[0]?.last_name || ''}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">No projects created yet. Projects will appear here once created.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Project name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter project description" 
                        {...field} 
                        rows={4} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
