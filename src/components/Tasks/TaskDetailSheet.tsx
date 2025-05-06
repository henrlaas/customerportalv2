"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Edit,
  ListChecks,
  Tag,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TaskAssignees, TaskAttachments, TaskComments } from "@/components/Tasks/TaskDetailComponents";
import { TaskStatus } from "@/components/Tasks/TaskStatus";
import { TaskPriority } from "@/components/Tasks/TaskPriority";
import { TaskType } from "@/components/Tasks/TaskType";
import { TaskAssign } from "@/components/Tasks/TaskAssign";
import { TaskAttachment } from "@/components/Tasks/TaskAttachment";
import { TaskComment } from "@/components/Tasks/TaskComment";
import { useUser } from "@/hooks/useUser";
import { useCompanyNames } from "@/hooks/useCompanyNames";
import { useCampaignNames } from "@/hooks/useCampaignNames";

interface TaskDetailSheetProps {
  task: any;
  children: React.ReactNode;
}

export function TaskDetailSheet({ task, children }: TaskDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  const { data: companyNames } = useCompanyNames();
  const { data: campaignNames } = useCampaignNames();

  const { data: assignees } = useQuery({
    queryKey: ["task-assignees", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_assignees")
        .select("*")
        .eq("task_id", task.id);

      if (error) {
        toast({
          title: "Error fetching task assignees",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const { data: attachments } = useQuery({
    queryKey: ["task-attachments", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", task.id);

      if (error) {
        toast({
          title: "Error fetching task attachments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["task-comments", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching task comments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const getCompanyName = (companyId: string) => {
    const company = companyNames?.find((company) => company.id === companyId);
    return company ? company.name : "N/A";
  };

  const getCampaignName = (campaignId: string) => {
    const campaign = campaignNames?.find((campaign) => campaign.id === campaignId);
    return campaign ? campaign.name : "N/A";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full max-w-4xl">
        <SheetHeader className="space-y-2.5">
          <SheetTitle>{task.title}</SheetTitle>
          <SheetDescription>
            {task.description || "No description"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection task={task} getCompanyName={getCompanyName} getCampaignName={getCampaignName} />
            <TaskAssign task={task} assignees={assignees || []} />
          </div>
          <TaskAttachment task={task} attachments={attachments || []} />
          <TaskComment task={task} comments={comments || []} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface DetailSectionProps {
  task: any;
  getCompanyName: (companyId: string) => string;
  getCampaignName: (campaignId: string) => string;
}

const DetailSection = ({ task, getCompanyName, getCampaignName }: DetailSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Details</h4>
      <div className="rounded-md border p-4">
        <div className="grid gap-6">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{task.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            {task.due_date ? (
              <span className="text-sm text-gray-600">
                {format(new Date(task.due_date), "PPP")}
              </span>
            ) : (
              <span className="text-sm text-gray-600">No due date</span>
            )}
          </div>
          {task.company_id && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{getCompanyName(task.company_id)}</span>
            </div>
          )}
          {task.campaign_id && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{getCampaignName(task.campaign_id)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <TaskStatus task={task} />
            <TaskPriority task={task} />
          </div>
        </div>
      </div>
    </div>
  );
};
