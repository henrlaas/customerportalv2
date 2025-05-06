import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Task } from "@/types/task"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, Circle, ClipboardList, User2, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TaskDetailSheetProps {
  task: Task
  open: boolean
  setOpen: (open: boolean) => void
}

export function TaskDetailSheet({ task, open, setOpen }: TaskDetailSheetProps) {
  // Function to get the initials from the task's assigned user
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return ""
    const parts = name.split(" ")
    let initials = ""
    for (let i = 0; i < parts.length; i++) {
      initials += parts[i].charAt(0).toUpperCase()
    }
    return initials
  }

  // Placeholder function to get the project name
  const getProjectName = (projectId: string): string => {
    // Replace this with your actual logic to fetch the project name
    return "Project Name"
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>
            View all the details of this task. Click "Edit" to make changes.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={task.assigned_user_image} />
                <AvatarFallback>{getInitials(task.assigned_user)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{task.assigned_user}</p>
                <p className="text-sm text-muted-foreground">Assigned User</p>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Title</h4>
              <p className="text-sm text-muted-foreground">{task.title}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Due Date</h4>
              <p className="text-sm text-muted-foreground">
                {task.due_date ? format(new Date(task.due_date), "PPP") : "No due date"}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Status</h4>
              {task.is_completed ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Circle className="h-3.5 w-3.5" />
                  Incomplete
                </Badge>
              )}
            </div>

            {/* Project information - commented out due to missing properties and functions */}
            {task.project_id && (
              <p className="text-sm mb-2 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Project
                </span>
              </p>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button>Edit</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
